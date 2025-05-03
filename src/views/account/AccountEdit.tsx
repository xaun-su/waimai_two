import React, { useState } from 'react';
import { Button, Form, Input, Space, message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Title from '../../components/Title';
import { postAccountPassword } from '../../api/account';
import '@ant-design/v5-patch-for-react-19';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // 引入 useNavigate 钩子

const layout = {
 labelCol: { span: 8 },
 wrapperCol: { span: 16 },
};

const tailLayout = {
 wrapperCol: { offset: 8, span: 16 },
};

const AccountEdit: React.FC = () => {
 const [form] = Form.useForm();
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const navigate = useNavigate();

 const togglePasswordVisibility = () => {
   setShowPassword(!showPassword);
 };

 const toggleConfirmPasswordVisibility = () => {
   setShowConfirmPassword(!showConfirmPassword);
 };
// 获取用户ID
const userInfo = useSelector((state:any) => state.user.userInfo);
const userId = userInfo.id;
 const onFinish = (values: any) => {
   console.log('提交的用户数据:', values);
   postAccountPassword({
    oldPwd: values.oldPassword,
    newPwd: values.newPassword,
    newPwd1: values.confirmPassword,
    id: userId,
   })
     .then((res) => {
       console.log('返回的数据', res);
       message.success('修改密码成功!'); // 显示成功提示
       setTimeout(() => {
        navigate('/login', { replace: true }); // 使用 navigate 替代错误的 navigator
      }, 500);
     })
     .catch((error) => {
       console.error('修改密码失败:', error);
       message.error('修改密码失败!'); // 显示失败提示
     });
 };

 const onReset = () => {
   form.resetFields();
 };

 const validateConfirmPassword = ({ getFieldValue }: any) => ({
   validator(_: any, value: string) {
     if (!value || getFieldValue('newPassword') === value) {
       return Promise.resolve();
     }
     return Promise.reject(new Error('两次输入的密码不一致!'));
   },
 });

 return (
   <div>
     <Title left="修改密码" />
     <Form
       {...layout}
       form={form}
       name="add-user-form"
       onFinish={onFinish}
       style={{ maxWidth: 600 }}
       scrollToFirstError
     >
    <Form.Item
         name="oldPassword"
         label="原密码"
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
         name="newPassword"
         label="新密码"
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
         dependencies={['newPassword']}
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

export default AccountEdit;
