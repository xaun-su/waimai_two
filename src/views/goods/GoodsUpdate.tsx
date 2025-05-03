import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import '@ant-design/v5-patch-for-react-19';
import { useParams, useNavigate } from 'react-router-dom'; // 导入 useParams 和 useNavigate

import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Spin, // 导入 Spin 用于加载提示
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  getGoodsCategory, // 获取商品分类列表 (编辑时也需要显示分类选项)
  good_img,         // 图片上传接口 (用于替换图片)
  getGoodsDetail,   // <-- 导入获取商品详情接口 (GET /goods/info?id=...)
  updateGoods,      // <-- 导入更新商品接口 (POST /goods/edit)
} from '../../api/goods'; // 确保这些 API 函数已在您的 api/goods.js 中定义并导出
import { baseURL } from '../../api/config';

// 布局配置
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

// 声明表单数据的类型
interface FormValues {
  name: string;
  category: string;
  price: number;
  goodsDesc: string;
  id: number;
}

interface GoodsDetail {
  name: string;
  category: string;
  price: number;
  goodsDesc: string;
  imgUrl: string;
  id: string;
}

const EditProductForm: React.FC = () => { // 将组件名改为 EditProductForm 更清晰
  const { id } = useParams<{ id: string }>(); // 从路由参数中获取商品 ID (编辑模式下必须存在)
  const navigate = useNavigate(); // 用于跳转

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]); // 用于管理上传的文件列表
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]); // 存储商品分类选项
  const [loading, setLoading] = useState<boolean>(false); // 用于管理整个表单的加载状态 (例如，获取商品详情时或提交时)

  useEffect(() => {
      if (!id) {
          message.error('缺少商品ID，无法编辑！');
      }
  }, [id, navigate]); // 依赖 id 和 navigate

  // 获取商品分类列表
  useEffect(() => {
    getGoodsCategory().then(res => {
      console.log('获取商品分类列表:', res);
      if (res && res.data && res.data.code === 0) {
        const options = res.data.categories.map((category: { cateName: string }) => ({
          value: category.cateName, // 使用分类名称作为 value
          label: category.cateName, // 使用 cateName 作为 label
        }));
        setCategoryOptions(options);
      } else {
        message.error(res?.message || '获取商品分类失败');
      }
    }).catch(error => {
      console.error('Failed to fetch categories:', error);
      message.error('请求商品分类失败');
    });
  }, []); // 仅在组件挂载时执行一次

  useEffect(() => {
    if (id) { // <-- 仅当 ID 存在时才获取详情
      setLoading(true); // 开始加载商品详情
      // 调用获取商品详情的 API
      getGoodsDetail(Number(id)).then(res => { // 假设 getGoodsDetail 接收 ID
        console.log('获取商品详情:', res);
        if (res && res.data && res.data.code === 0 && res.data.data) {
          const goodsDetail: GoodsDetail = res.data.data;
          // 填充表单字段
          form.setFieldsValue({
            name: goodsDetail.name,
            category: goodsDetail.category, 
            price: goodsDetail.price,
            goodsDesc: goodsDetail.goodsDesc,
          });

          // 处理图片回显
          if (goodsDetail.imgUrl) {
             const existingFile = {
               uid: goodsDetail.id || '-1', // 使用商品 ID 或其他唯一标识符作为 uid
               name: 'existing_image.png', // 文件名，可以根据 URL 提取或使用默认
               status: 'done', // 状态为已完成
               url: `${baseURL}${goodsDetail.imgUrl}`, // 图片的 URL
             };
             setFileList([existingFile]); // 设置 fileList 状态
             console.log('设置回显图片URL:', existingFile.url); // 添加日志确认 URL
          } else {
             setFileList([]); // 如果没有图片 URL，则 fileList 为空数组
          }

        } else {
          message.error(res?.message || '获取商品详情失败');
        }
      }).catch(error => {
        console.error('Failed to fetch goods detail:', error);
        message.error('请求商品详情失败');
        navigate('/goods/list');
      }).finally(() => {
        setLoading(false); // 结束加载
      });
    }
  }, [id, form]); // 依赖 id 和 form 实例

  // 处理文件上传前的校验
  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 文件!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  // 处理文件列表变化
  const handleUploadChange = ({ fileList: newFileList, file }: any) => {
    console.log('Upload onChange:', newFileList, file);
    const latestFileList = newFileList.slice(-1);
    setFileList(latestFileList);

    if (file.status === 'done') {
        if (file.response && file.response.code === 0  && file.response.imgUrl) {
             message.success(`${file.name} 文件上传成功`);
        } else {
             message.error(`${file.name} 文件上传失败: ${file.response?.msg || '未知错误'}`);
             setFileList(latestFileList.filter((item:any)  => item.uid !== file.uid));
        }
    } else if (file.status === 'error') {
         message.error(`${file.name} 文件上传失败.`);
         setFileList(latestFileList.filter((item:any) => item.uid !== file.uid));
    }
  };

  const normFile = (e: any) => {
    console.log('Upload event for Form.Item:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const onFinish = async (values: FormValues) => {
    console.log('原始提交的表单数据 (包含 fileList):', values);

    let imageUrl = '';
    if (fileList && fileList.length > 0) {
        const firstFile = fileList[0];
        if (firstFile.response && firstFile.response.code === 0) {
            imageUrl = firstFile.response.imgUrl;
        } else if (firstFile.imgUrl) {
            imageUrl = firstFile.imgUrl;
        }
    }

     if (!imageUrl) {
         message.error('请上传商品图片!');
         return;
     }

     const submitData = {
      name: values.name,
      category: values.category,
      price: values.price,
      imgUrl: imageUrl,
      goodsDesc: values.goodsDesc,
      id: id ? parseInt(id, 10) : 0,  };

    if (id) {
        submitData.id = parseInt(id, 10);
        submitData.imgUrl = submitData.imgUrl.split('/').pop() || '';
    } else {
        message.error('商品ID缺失，无法提交修改！');
        return;
    }

    console.log('提交给后端的数据:', submitData);

    setLoading(true);
    try {
      const res = await updateGoods(submitData); 
      console.log('更新商品结果:', res);
      if (res && res.data && res.data.code === 0) {
        message.success('商品更新成功!');
        navigate('/goodsList');
      } else {
        message.error(res?.msg || '商品更新失败!');
      }
    } catch (error) {
      console.error('提交商品失败:', error);
      message.error('请求失败，请稍后再试!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title left="商品编辑" />
      {id ? (
        <Spin spinning={loading} tip="加载商品详情...">
          <Form
            {...formItemLayout}
            form={form}
            style={{ maxWidth: 600 }}
            onFinish={onFinish}
          >
            <Form.Item
              label="商品名称"
              name="name"
              rules={[{ required: true, message: '请输入商品名称!' }]}
            >
              <Input placeholder="请输入商品名称" />
            </Form.Item>

            <Form.Item
              label="商品分类"
              name="category"
              rules={[{ required: true, message: '请选择商品分类!' }]}
            >
              <Select
                placeholder="请选择商品分类"
                options={categoryOptions}
              />
            </Form.Item>

            <Form.Item
              label="商品价格"
              name="price"
              rules={[{ required: true, type: 'number', min: 0, message: '请输入有效的商品价格!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="请输入商品价格"
              />
            </Form.Item>

            <Form.Item
              label="商品图片"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                action={good_img}
                listType="picture-card"
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                maxCount={1}
              >
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item
              label="商品描述"
              name="goodsDesc"
              rules={[{ required: true, message: '请输入商品描述!' }]}
            >
              <Input.TextArea rows={4} placeholder="请输入商品描述" />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                立即修改
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <p>正在加载或商品ID缺失...</p>
        </div>
      )}
    </div>
  );
};

export default EditProductForm;
