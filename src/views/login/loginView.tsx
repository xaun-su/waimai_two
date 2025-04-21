import  { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './login.less';
import request from '../../utils/request';
import { useDispatch } from 'react-redux';
import { setToken, setUserInfo } from '../../store/userSlice';
import { useNavigate } from 'react-router-dom'; // 引入 useNavigate 钩子

interface LoginType {
  username: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 使用 useNavigate 钩子
  const [showAlert, setShowAlert] = useState(false); // 控制 Alert 的显示和隐藏
  const [alertMessage, setAlertMessage] = useState(''); // Alert 的消息内容
  const [alertType, setAlertType] = useState<'success' | 'error'>('success'); // Alert 的类型

  const onFinish = async (values: LoginType) => {
    console.log('Received values of form: ', values);
    try {
      const response = await request.post('/users/checkLogin', values);
      console.log('response', response.data);

      if (response.data.code === 0) {
        const { token, id, role } = response.data;

        dispatch(setToken(token));
        localStorage.setItem('token', token);

        dispatch(setUserInfo({ id, role }));

        // 显示成功提示
        setAlertMessage(response.data.msg || '登录成功');
        setAlertType('success');
        setShowAlert(true);

        // 延迟跳转以确保提示信息可见
        setTimeout(() => {
          navigate('/home', { replace: true }); // 使用 navigate 替代错误的 navigator
        }, 1500);
      } else {
        // 显示失败提示
        setAlertMessage(response.data.msg || '登录失败');
        setAlertType('error');
        setShowAlert(true);
      }
    } catch (error: any) {
      // 显示失败提示
      setAlertMessage(error.message || '服务器错误');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  return (
    <div className="login-view">
      {/* Alert 组件 */}
      {showAlert && (
        <Alert
          message={alertMessage}
          type={alertType}
          closable
          onClose={() => setShowAlert(false)}
          className="alert"
        />
      )}
      <div className="login-form-container">
        <Typography.Title level={2} className="login-title">
          系统登录
        </Typography.Title>

        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="account"
            rules={[{ required: true, message: '请输入账号!' }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="请输入账号"
              className="login-form-input"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="请输入密码"
              className="login-form-input"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;