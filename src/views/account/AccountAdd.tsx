import React, { useState } from 'react';
import { Button, Form, Input, Select, Space, message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Title from '../../components/Title';
import { postAccountAdd } from '../../api/account';
import '@ant-design/v5-patch-for-react-19';

const { Option } = Select;

const layout = {
 labelCol: { span: 8 },
 wrapperCol: { span: 16 },
};

const tailLayout = {
 wrapperCol: { offset: 8, span: 16 },
};

const AccountAdd: React.FC = () => {
 const [form] = Form.useForm();
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);

 const togglePasswordVisibility = () => {
   setShowPassword(!showPassword);
 };

 const toggleConfirmPasswordVisibility = () => {
   setShowConfirmPassword(!showConfirmPassword);
 };

 const onFinish = (values: any) => {
   console.log('提交的用户数据:', values);
   postAccountAdd({
     account: values.account,
     password: values.password,
     userGroup: values.userGroup,
   })
     .then((res) => {
       console.log('返回的数据', res);
       message.success('添加账号成功!'); // 显示成功提示
     })
     .catch((error) => {
       console.error('添加账号失败:', error);
       message.error('添加账号失败!'); // 显示失败提示
     });
 };

 const onReset = () => {
   form.resetFields();
 };

 const validateConfirmPassword = ({ getFieldValue }: any) => ({
   validator(_: any, value: string) {
     if (!value || getFieldValue('password') === value) {
       return Promise.resolve();
     }
     return Promise.reject(new Error('两次输入的密码不一致!'));
   },
 });

 return (
   <div>
     <Title left="新增用户" />
     <Form
       {...layout}
       form={form}
       name="add-user-form"
       onFinish={onFinish}
       style={{ maxWidth: 600 }}
       scrollToFirstError
     >
       <Form.Item
         name="account"
         label="账号"
         rules={[{ required: true, message: '请输入账号!' }]}
       >
         <Input placeholder="请输入账号" />
       </Form.Item>

       <Form.Item
         name="password"
         label="密码"
         rules={[{ required: true, message: '请输入密码!' }]}
         hasFeedback
       >
         <Input
           type={showPassword ? 'text' : 'password'}
           placeholder="请输入密码"
           suffix={
             <Button
               type="link"
               onClick={togglePasswordVisibility}
               style={{ padding: 0 }}
             >
               {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
             </Button>
           }
         />
       </Form.Item>

       <Form.Item
         name="confirmPassword"
         label="确认密码"
         dependencies={['password']}
         hasFeedback
         rules={[
           { required: true, message: '请再次输入密码!' },
           validateConfirmPassword,
         ]}
       >
         <Input
           type={showConfirmPassword ? 'text' : 'password'}
           placeholder="请再次输入密码"
           suffix={
             <Button
               type="link"
               onClick={toggleConfirmPasswordVisibility}
               style={{ padding: 0 }}
             >
               {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
             </Button>
           }
         />
       </Form.Item>

       <Form.Item
         name="userGroup"
         label="用户组"
         rules={[{ required: true, message: '请选择用户组!' }]}
       >
         <Select placeholder="请选择权限" allowClear>
           <Option value="user">普通管理员</Option>
           <Option value="admin">超级管理员</Option>
         </Select>
       </Form.Item>

       <Form.Item {...tailLayout}>
         <Space>
           <Button type="primary" htmlType="submit">
             提交
           </Button>
           <Button htmlType="button" onClick={onReset}>
             重置
           </Button>
         </Space>
       </Form.Item>
     </Form>
   </div>
 );
};

export default AccountAdd;
