import React, { useState } from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom'; // 导入 useNavigate

type MenuItem = Required<MenuProps>['items'][number];

// 定义菜单项，并添加对应的路由路径 (path)
const items: MenuItem[] = [
  {
    key: '0',
    icon: <MailOutlined />,
    label: '首页',
    path: '/home', // 添加路径
  },
  {
    key: '1',
    icon: <MailOutlined />,
    label: '账号管理',
    children: [
      { key: '11', label: '账号列表', path: '/account/list' }, // 添加路径
      { key: '12', label: '添加账号', path: '/account/add' }, // 添加路径
      { key: '13', label: '个人信息', path: '/account/center' }, // 添加路径 (假设映射到 account/center)
      { key: '14', label: '修改密码', path: '/account/edit' }, // 添加路径 (假设映射到 account/edit)
    ],
  },
  {
    key: '2',
    icon: <AppstoreOutlined />,
    label: '商品管理',
    children: [
      { key: '21', label: '商品列表', path: '/goods/list' }, // 添加路径
      { key: '22', label: '添加商品', path: '/goods/add' }, // 添加路径
      { key: '23', label: '商品分类', path: '/goods/type' }, // 添加路径
    ],
  },
  {
    key: '3',
    icon: <SettingOutlined />,
    label: '订单管理',
    path: '/statistics/order', // 添加路径 (假设点击订单管理跳转到订单统计)
  },
  {
    key: '4',
    icon: <SettingOutlined />,
    label: '店铺管理',
    path: '/shop/info', // 添加路径
  },
  {
    key: '5',
    icon: <SettingOutlined />,
    label: '统计数据',
    children: [
      { key: '51', label: '商品统计', path: '/statistics/goods' }, // 添加路径
      { key: '52', label: '订单统计', path: '/statistics/order' }, // 添加路径
    ]
  },
  {
    key: '6',
    icon: <SettingOutlined />,
    label: '权限管理',
    children: [
      { key: '63', label: '权限管理', path: '/permission/info' }, // 添加路径 (假设映射到 permission/info)
      { key: '64', label: '角色管理', path: '/permission/role' }, // 添加路径 (假设映射到 permission/role)
    ]
  }
];

// 这个函数用于处理菜单项的打开/关闭状态，与跳转逻辑无关，可以保留
interface LevelKeysProps {
  key?: string;
  children?: LevelKeysProps[];
  path?: string; // 添加 path 属性类型定义
}

const getLevelKeys = (items1: LevelKeysProps[]) => {
  const key: Record<string, number> = {};
  const func = (items2: LevelKeysProps[], level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items1);
  return key;
};

const levelKeys = getLevelKeys(items as LevelKeysProps[]);

// 将组件名从 App 修改为 SideMenu，与 Home.tsx 中的导入一致
const SideMenu: React.FC = () => {
  const navigate = useNavigate(); // 获取 navigate 函数
  const [stateOpenKeys, setStateOpenKeys] = useState(['2', '23']); // 保持默认展开状态

  const onOpenChange: MenuProps['onOpenChange'] = (openKeys) => {
    const currentOpenKey = openKeys.find((key) => stateOpenKeys.indexOf(key) === -1);
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys
          // remove repeat key
          .filter((_, index) => index !== repeatIndex)
          // remove current level all child
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
      );
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };

  // 处理菜单项点击事件
  const handleMenuClick = (e: any) => {
    // 找到被点击菜单项对应的 path
    const clickedItem = findMenuItem(items, e.key);
    if (clickedItem && clickedItem.path) {
      navigate(clickedItem.path); // 使用 navigate 进行路由跳转
    }
  };

  // 辅助函数：根据 key 查找菜单项
  const findMenuItem = (menuItems: MenuItem[], key: string): MenuItem | undefined => {
    for (const item of menuItems) {
      if (item && item.key === key) {
        return item;
      }
      if (item && item.children) {
        const found = findMenuItem(item.children as MenuItem[], key);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };


  return (
    <Menu
      mode="inline"
      // defaultSelectedKeys={['231']} // 默认选中项可以根据当前路由动态设置
      openKeys={stateOpenKeys}
      onOpenChange={onOpenChange}
      onClick={handleMenuClick} // 添加点击事件处理
      style={{ width: "100%", height: "100%" }}
      items={items}
      theme='dark'
    />
  );
};

export default SideMenu; // 导出 SideMenu
