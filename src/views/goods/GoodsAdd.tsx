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
 message,
 UploadFile,
 UploadProps,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getGoodsCategory, good_img, addGoods } from '../../api/goods';

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

interface FormValues {
 name: string;
 category: string;
 price: number;
 imgUrl: string;
 goodsDesc?: string;
}

interface CategoryOption {
 value: string;
 label: string;
}

const AddProductForm: React.FC = () => {
 const [form] = Form.useForm<FormValues>();
 const [fileList, setFileList] = useState<UploadFile[]>([]);
 const [cateName, setCateName] = useState<CategoryOption[]>([]);

 useEffect(() => {
   getGoodsCategory().then((res: any) => {
     console.log(res.data.categories);
     const categoryOptions: CategoryOption[] = res.data.categories.map(
       (category: any) => ({
         value: category.cateName,
         label: category.cateName,
       })
     );
     setCateName(categoryOptions);
   });
 }, []);

 const beforeUpload = (file: any): boolean | Promise<boolean> => {
   const isJpgOrPng =
     file.type === 'image/jpeg' || file.type === 'image/png';
   if (!isJpgOrPng) {
     message.error('只能上传 JPG/PNG 文件!');
   }
   const isLt2M = file.size / 1024 / 1024 < 2;
   if (!isLt2M) {
     message.error('图片大小不能超过 2MB!');
   }
   return isJpgOrPng && isLt2M ? true : (Upload as any).LIST_IGNORE;
 };

 const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
   setFileList(newFileList.slice(-1));
 };

 const onFinish = (values: FormValues) => {
   console.log(
     'Form fields value before onFinish args:',
     form.getFieldsValue()
   );
   if (fileList.length > 0 && fileList[0].response && fileList[0].response.imgUrl) {
       values.imgUrl = fileList[0].response.imgUrl.split('/').pop();
   } else {
       message.error('请上传商品图片!');
       return;
   }
   console.log('提交的表单数据 ', values);
   console.log('Uploaded files:', fileList);
   addGoods(values)
     .then(() => {
       message.success('添加成功!');
     })
     .catch(() => {
       message.error('添加失败!');
     });
 };

 const normFile = (e: any) => {
   console.log('Upload event:', e);
   if (Array.isArray(e)) {
     return e;
   }
   return e?.fileList;
 };

 const handlePriceChange = (value: number | null) => {
  if (value === null) {
    form.setFieldsValue({ price: undefined }); // 将 null 转换为 undefined
  } else {
    form.setFieldsValue({ price: value });
  }
 };

 return (
   <div style={{ padding: '20px' }}>
     <Title left="添加商品" />
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
           options={cateName}
         />
       </Form.Item>

       <Form.Item
         label="商品价格"
         name="price"
         rules={[{ required: true, message: '请输入商品价格!' }]}
       >
         <InputNumber
           style={{ width: '100%' }}
           min={0}
           placeholder="请输入商品价格"
           onChange={handlePriceChange}
         />
       </Form.Item>

       <Form.Item
         label="商品图片"
         name="imgUrl"
         valuePropName="fileList"
         getValueFromEvent={normFile}
         rules={[{ required: true, message: '请上传商品图片!' }]}
       >
         <Upload
           action={good_img}
           listType="picture-card"
           fileList={fileList}
           onChange={handleUploadChange}
           beforeUpload={beforeUpload}
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
       >
         <Input.TextArea rows={4} placeholder="请输入商品描述" />
       </Form.Item>

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
