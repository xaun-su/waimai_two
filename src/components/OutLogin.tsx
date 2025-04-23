import React, { useEffect, useState } from 'react';
import { Dropdown, Menu, Avatar } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import './less/outlogin.less';
import { useNavigate } from 'react-router-dom';
import { getAccountInfo } from '../api/account';
import { useSelector } from 'react-redux';
import { baseURL } from '../api/config';

function UserDropdown() {
  // 从 Redux store 中获取用户完整信息
  const { id: userId } = useSelector((state: any) => state.user.userInfo || {});
  const [shopInfo, setShopInfo] = useState({}); // 初始状态为空对象
  const navigate = useNavigate();

  // Effect 1: 获取用户账户信息
  useEffect(() => {
    // 只有当 userId 存在时才调用 API
    if (userId) {
      async function fetchAccountInfo() {
        try {
          const res = await getAccountInfo(userId);
          console.log('获取个人信息成功:', res.data);
          // 假设 API 返回的 imgUrl 是相对路径，需要拼接 baseURL
          // 确保属性名一致，这里使用 avatar
          const accountData = {
            account: res.data.accountInfo.account,
            avatar: baseURL + res.data.accountInfo.imgUrl // 修正属性名并拼接 baseURL
          };
          setShopInfo(accountData);
           console.log('设置的个人信息:', accountData); // 可以在这里打印设置的值
        } catch (error) {
          console.error('获取个人信息失败:', error);
          // TODO: 处理错误，例如显示提示信息
        }
      }
      fetchAccountInfo();
    } else {
      setShopInfo({});
    }
  }, [userId]); 

  useEffect(() => {
    console.log('shopInfo 状态更新了:', shopInfo);
  }, [shopInfo]);

  // 将 menu 定义移到函数组件内部
  const menu = (
    <Menu
      onClick={({ key }) => {
        if (key === 'profile') {
          console.log('点击了 个人中心'); // 修正 console.log
          navigate('/accountCenter');
        } else if (key === 'logout') {
          console.log('点击了 注销登录'); // 修正 console.log
          // TODO: 在这里添加注销登录的逻辑，例如 dispatch logout action
          navigate('/login');
        }
      }}
    >
      <Menu.Item key="profile">
        个人中心
      </Menu.Item>
      <Menu.Item key="logout">
        注销登录
      </Menu.Item>
    </Menu>
  );

  // 使用从 shopInfo 获取的 avatar 属性
  const avatar = shopInfo.avatar ? (
    <Avatar src={shopInfo.avatar} alt="User Avatar" /> // 直接使用 shopInfo.avatar
  ) : (
    <Avatar icon={<UserOutlined />} />
  );

  return (
    <div className="outlogin" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      {/* 下拉菜单触发区域 */}
      <Dropdown overlay={menu} trigger={['click']}>
        <a className="ant-dropdown-link" onClick={e => e.preventDefault()} style={{ marginRight: 8 }}>
          欢迎 {shopInfo.account || '用户'} 登录 <DownOutlined />
        </a>
      </Dropdown>

      {/* 用户头像 */}
      {avatar}
    </div>
  );
}

export default UserDropdown;
