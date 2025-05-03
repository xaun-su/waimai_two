import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Layout, theme } from 'antd';
import './home.less';
import Breadcrumb from '../../components/Breadcrumb';
import { Outlet } from 'react-router-dom';
import SideMenu from '../../components/SideMenu';
import OutLogin from '../../components/OutLogin';

const { Header, Sider, Content } = Layout;

const LoginHome: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  //  动态调整 Content 的 left 值
  const [, setContentLeft] = useState(200);

  useEffect(() => {
    setContentLeft(collapsed ? 80 : 200);
  }, [collapsed]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <SideMenu/>
      </Sider>
      <Layout className="site-layout">
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Breadcrumb/>
          <OutLogin/>
        </Header>
        <Content
          className={`site-layout-content-fixed ${collapsed ? 'sider-collapsed' : ''}`}
          style={{
            /*  移除原有的 style 属性，样式已在 Less 文件中定义 */
          }}
        >
          {/* 子路由渲染组件 */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LoginHome;
