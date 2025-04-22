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

const EditProductForm = () => { // 将组件名改为 EditProductForm 更清晰
  const { id } = useParams(); // 从路由参数中获取商品 ID (编辑模式下必须存在)
  const navigate = useNavigate(); // 用于跳转

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]); // 用于管理上传的文件列表
  const [categoryOptions, setCategoryOptions] = useState([]); // 存储商品分类选项
  const [loading, setLoading] = useState(false); // 用于管理整个表单的加载状态 (例如，获取商品详情时或提交时)
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
        const options = res.data.categories.map(category => ({
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
      getGoodsDetail(id).then(res => { // 假设 getGoodsDetail 接收 ID
        console.log('获取商品详情:', res);
        if (res && res.data && res.data.code === 0 && res.data.data) {
          const goodsDetail = res.data.data;
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
          // 获取失败可以考虑跳转回列表页
          // navigate('/goods/list');
        }
      }).catch(error => {
        console.error('Failed to fetch goods detail:', error);
        message.error('请求商品详情失败');
        // navigate('/goods/list');
      }).finally(() => {
        setLoading(false); // 结束加载
      });
    }
    // 在这个编辑组件中，不需要处理添加模式的 else 逻辑 (清空表单等)
  }, [id, form]); // 依赖 id 和 form 实例

  // 处理文件上传前的校验
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 文件!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!');
    }
    // 返回 true 允许 Upload 自动上传 (如果配置了 action)，或者返回 false 阻止并手动处理
    // 这里我们配置了 action，所以返回 true 允许自动上传
    return isJpgOrPng && isLt2M; // 如果校验失败，返回 false 阻止上传
  };

  // 处理文件列表变化
  const handleUploadChange = ({ fileList: newFileList, file }) => {
    console.log('Upload onChange:', newFileList, file);
    // 只保留最新的一个文件 (假设只允许上传一张图)
    const latestFileList = newFileList.slice(-1);
    setFileList(latestFileList); // 更新 fileList 状态

    // 如果上传成功，并且您需要立即获取后端返回的图片 URL
    if (file.status === 'done') {
        // 假设您的图片上传接口成功后返回的数据结构是 { code: 0, data: { url: '...' } }
        if (file.response && file.response.code === 0  && file.response.imgUrl) {
             message.success(`${file.name} 文件上传成功`);
        } else {
             message.error(`${file.name} 文件上传失败: ${file.response?.msg || '未知错误'}`);
             // 上传失败时，从 fileList 中移除这个文件
             setFileList(latestFileList.filter(item => item.uid !== file.uid));
        }
    } else if (file.status === 'error') {
         message.error(`${file.name} 文件上传失败.`);
         // 上传失败时，从 fileList 中移除这个文件
         setFileList(latestFileList.filter(item => item.uid !== file.uid));
    }
  };

  // 用于 Upload 组件从事件中获取文件列表
  // Form.Item 会调用这个函数来获取 Upload 组件的值
  const normFile = (e) => {
    console.log('Upload event for Form.Item:', e);
    if (Array.isArray(e)) {
      return e;
    }
    // 如果 e.fileList 存在，返回 e.fileList，否则返回空数组
    return e?.fileList;
  };


  // 处理表单提交
  const onFinish = async (values) => {
    console.log('原始提交的表单数据 (包含 fileList):', values);

    // 从 fileList 中提取图片 URL
    let imageUrl = '';
    if (fileList && fileList.length > 0) {
        const firstFile = fileList[0]; // 假设只上传一张图，取第一个文件对象
        // 优先从上传成功的响应中获取 URL (新上传的图片)
        if (firstFile.response && firstFile.response.code === 0) {
            imageUrl = firstFile.response.imgUrl;
        } else if (firstFile.imgUrl) {
            // 如果没有 response (可能是编辑时已有的图片)，从 url 属性获取
            imageUrl = firstFile.imgUrl;
        }
    }

    // 检查图片是否上传成功或存在
     if (!imageUrl) {
         message.error('请上传商品图片!');
         return; // 阻止表单提交
     }


    // 构建最终要提交给后端的数据
    const submitData = {
        name: values.name,
        category: values.category, // 使用 category 的 value (分类名称)
        price: values.price,
        imgUrl: imageUrl, // 使用提取出的图片 URL
        goodsDesc: values.goodsDesc,
    };

    // 在编辑模式下，必须添加商品 ID
    if (id) {
        submitData.id = parseInt(id, 10); // 将 ID 转换为整数，因为 API 要求 int
        submitData.imgUrl=submitData.imgUrl.split('/').pop()
    } else {
        // 如果没有 ID，说明路由配置有问题，不应该进入这个编辑组件
        message.error('商品ID缺失，无法提交修改！');
        return;
    }


    console.log('提交给后端的数据:', submitData);

    setLoading(true); // 提交时显示加载状态
    try {
      // 调用更新 API (POST /goods/edit)
      const res = await updateGoods(submitData); 
      console.log('更新商品结果:', res);
      if (res && res.data &&res.data.code === 0) {
        message.success('商品更新成功!');
        // 更新成功后，可以跳转回商品列表页
        navigate('/goodsList'); // 假设商品列表页路由是 /goods/list
      } else {
        message.error(res?.msg || '商品更新失败!'); // 根据您的响应示例使用 msg
      }
    } catch (error) {
      console.error('提交商品失败:', error);
      message.error('请求失败，请稍后再试!'); // 网络错误或请求异常
    } finally {
      setLoading(false); // 隐藏加载状态
    }
  };


  return (
    <div style={{ padding: '20px' }}>
      {/* 标题固定为商品编辑 */}
      <Title left="商品编辑" />

      {/* 添加 Spin 组件，在加载时覆盖表单 */}
      {/* 在没有 ID 时不渲染表单，或者显示错误信息 */}
      {id ? (
        <Spin spinning={loading} tip="加载商品详情...">
          <Form
            {...formItemLayout}
            form={form}
            style={{ maxWidth: 600 }}
            onFinish={onFinish}
            // initialValues={...} // 在 useEffect 中通过 setFieldsValue 设置
          >
            {/* 商品名称 */}
            <Form.Item
              label="商品名称"
              name="name"
              rules={[{ required: true, message: '请输入商品名称!' }]}
            >
              <Input placeholder="请输入商品名称" />
            </Form.Item>

            {/* 商品分类 */}
            <Form.Item
              label="商品分类"
              name="category" // 会存储 Select 的 value (分类名称)
              rules={[{ required: true, message: '请选择商品分类!' }]}
            >
              <Select
                placeholder="请选择商品分类"
                options={categoryOptions} // 使用从 API 获取并转换后的分类选项
              />
            </Form.Item>

            {/* 商品价格 */}
            <Form.Item
              label="商品价格"
              name="price"
              rules={[{ required: true, type: 'number', min: 0, message: '请输入有效的商品价格!' }]} // 添加 number 类型校验
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="请输入商品价格"
              />
            </Form.Item>

            {/* 商品图片 */}
            <Form.Item
              label="商品图片"
              // name="imgUrl" // Form.Item 的 name，用于收集 Upload 的值 (fileList)
              valuePropName="fileList" // Upload 组件的值是 fileList
              getValueFromEvent={normFile} // 从上传事件中提取 fileList
              // rules={[{ required: true, message: '请上传商品图片!' }]} // 图片校验逻辑在 onFinish 中处理
            >
              {/* action prop 使得 Upload 自动上传到指定 URL */}
              <Upload
                action={good_img} // 您的图片上传接口 URL
                listType="picture-card"
                fileList={fileList} // 绑定 fileList 状态
                onChange={handleUploadChange} // 文件列表变化回调
                beforeUpload={beforeUpload} // 上传前校验
                maxCount={1} // 只允许上传一张图片
                // onRemove={handleRemove} // 如果需要处理图片移除，添加此回调
                // customRequest={handleCustomUpload} // 如果需要完全手动控制上传过程，使用此 prop
              >
                {/* 当 fileList 长度小于1时显示上传按钮，否则隐藏 (只允许上传一张图) */}
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            {/* 商品描述 */}
            <Form.Item
              label="商品描述"
              name="goodsDesc"
              rules={[{ required: true, message: '请输入商品描述!' }]} // 根据截图，描述是必填的
            >
              <Input.TextArea rows={4} placeholder="请输入商品描述" />
            </Form.Item>

            {/* 提交按钮 */}
            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                立即修改 {/* 按钮文本固定为立即修改 */}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      ) : (
          // 当没有 ID 时显示错误信息或加载状态，而不是表单
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <p>正在加载或商品ID缺失...</p>
              {/* 如果需要，可以在这里显示 Spin 或其他提示 */}
          </div>
      )}
    </div>
  );
};

export default EditProductForm;
