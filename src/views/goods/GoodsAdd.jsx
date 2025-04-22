import React, { useEffect, useState } from 'react';
import Title from '../../components/Title'; 
import '@ant-design/v5-patch-for-react-19'; 


import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message, // 用于上传成功/失败提示
} from 'antd';
import { PlusOutlined } from '@ant-design/icons'; // 用于 Upload 的加号图标
import { getGoodsCategory ,good_img,addGoods} from '../../api/goods';

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

const AddProductForm = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]); // 用于管理上传的文件列表
  const [uploading, setUploading] = useState(false); // 用于管理上传状态 (如果需要显示加载)
  const [cateName, setCateName] = useState([]);

  useEffect(() => {
    getGoodsCategory().then(res => {
      console.log(res.data.categories);
      // 使用索引作为 value - 注意：这会导致提交的 value 是索引而不是分类名称
      const categoryOptions = res.data.categories.map((category, index) => ({
        value: category.cateName, // 使用索引作为 value (唯一的)
        label: category.cateName, // 使用 cateName 作为 label
      }));
      setCateName(categoryOptions);
    });
  }, []);

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
    // 返回 false 阻止 Upload 自动上传，我们将手动处理
    return isJpgOrPng && isLt2M ? true : Upload.LIST_IGNORE; // 使用 Upload.LIST_IGNORE 忽略不符合条件的文件
  };

  // 处理文件列表变化
  const handleUploadChange = ({ fileList: newFileList }) => {
    // 只保留最新的一个文件，如果需要多图上传，则保留全部
    setFileList(newFileList.slice(-1)); // 示例：只保留最后一个上传的文件
  };

  // 处理表单提交
  const onFinish = (values) => {
    console.log('Form fields value before onFinish args:', form.getFieldsValue()); // 添加这行用于验证
    values.imgUrl = fileList[0].response.imgUrl.split('/').pop();
    console.log('提交的表单数据 ', values); // 验证 price 是否正常
    console.log('Uploaded files:', fileList);
    addGoods(values).then(response => {
      message.success('添加成功!');
}).catch(error => {
      message.error('添加失败!');
    });
  };

  // 用于 Upload 组件从事件中获取文件列表
  const normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    // 如果 e.fileList 存在，返回 e.fileList，否则返回空数组
    return e?.fileList;
  };

  // 手动处理 InputNumber 的变化并更新 Form 状态
  const handlePriceChange = (value) => {
    console.log('InputNumber onChange value:', value); // 打印确认 InputNumber 收到了值
    form.setFieldsValue({ price: value }); // <-- 手动更新 Form 状态中的 price 字段
    console.log('手动更新 Form price:', form.getFieldValue('price')); // 打印确认 Form 状态已更新
  };


  return (
    <div style={{ padding: '20px' }}>
      <Title left="添加商品" /> {/* 使用你的 Title 组件 */}
      <Form
        {...formItemLayout}
        form={form}
        style={{ maxWidth: 600 }} // 限制表单最大宽度
        onFinish={onFinish} // 表单提交时调用 onFinish 函数
      >
        {/* 商品名称 */}
        <Form.Item
          label="商品名称"
          name="name" // 字段名
          rules={[{ required: true, message: '请输入商品名称!' }]}
        >
          <Input placeholder="请输入商品名称" />
        </Form.Item>

        {/* 商品分类 */}
        <Form.Item
          label="商品分类"
          name="category"
          rules={[{ required: true, message: '请选择商品分类!' }]}
        >
          <Select
            placeholder="请选择商品分类"
            options={cateName} // 使用转换后的数据
          />
        </Form.Item>

        {/* 商品价格 */}
        <Form.Item
          label="商品价格"
          name="price" // 字段名
          // rules={[{ required: true, message: '请输入商品价格!' }]} // 注意：手动更新后这里的校验可能需要调整或通过 form.validateFields 触发
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            placeholder="请输入商品价格"
            onChange={handlePriceChange} // 使用手动处理函数
          /> {/* 使用 InputNumber */}
        </Form.Item>

        {/* 商品图片 */}
        <Form.Item
          label="商品图片"
          name="imgUrl" // 字段名 (用于 Form.Item 收集文件信息)
          valuePropName="fileList" // Upload 组件的值是 fileList
          getValueFromEvent={normFile} // 从上传事件中提取 fileList
          rules={[{ required: true, message: '请上传商品图片!' }]}
        >
          <Upload
            action={good_img}
            listType="picture-card" // 卡片样式
            fileList={fileList} // 绑定文件列表状态
            onChange={handleUploadChange} // 文件列表变化时的回调
            beforeUpload={beforeUpload} // 上传前的校验
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
          name="goodsDesc" // 字段名
          // rules={[{ required: true, message: '请输入商品描述!' }]}
        >
          {/* 移除 Input.TextArea 上用于打印的 onChange，让 Form 自动收集 */}
          <Input.TextArea rows={4} placeholder="请输入商品描述" />
        </Form.Item>

        {/* 提交按钮 */}
        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type="primary" htmlType="submit">
            添加商品
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddProductForm;
