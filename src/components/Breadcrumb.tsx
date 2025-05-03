// src/components/BreadcrumbComponent.tsx
import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
// 从 SideMenu.tsx 文件中导入 menuItems, MenuItem 类型 和 findDeepestMenuItemPath 辅助函数
import { menuItems, findDeepestMenuItemPath } from './SideMenu'; // 请根据您的实际文件路径调整导入路径

const BreadcrumbComponent: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 使用 findDeepestMenuItemPath 查找当前路径对应的最深层菜单项及其所有父级
  const matchedPathItems = findDeepestMenuItemPath(menuItems, currentPath);

  // 构建 Ant Design Breadcrumb 组件所需的 items 数组
  const breadcrumbItems = [
    {
      title: <Link to="/home">首页</Link>, // 始终包含 "首页" 作为第一个面包屑项
      key: 'home',
    },
  ];

  // 如果找到了匹配的菜单路径 (并且不是首页本身)
  if (matchedPathItems && matchedPathItems.length > 0 && currentPath !== '/home') {
    // 过滤掉首页项（如果存在）
    const pathItemsAfterHome = matchedPathItems.filter(item => item.path !== '/home');

    // 将找到的菜单路径转换为面包屑项
    pathItemsAfterHome.forEach((item, index) => {
      const isLastItem = index === pathItemsAfterHome.length - 1;
      breadcrumbItems.push({
        key: item.key || item.path || `breadcrumb-${index}`,
        title: isLastItem ? (
          <span>{item.label}</span> // 确保始终返回 ReactElement
        ) : (
          <Link to={item.path || '#'}>{item.label}</Link>
        ),
      });
    });
  }

  return (
    <Breadcrumb
      style={{ margin: '16px 24px' }}
      items={breadcrumbItems}
    />
  );
};

export default BreadcrumbComponent;