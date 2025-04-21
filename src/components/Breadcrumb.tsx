// src/components/BreadcrumbComponent.tsx
import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
// 从 SideMenu.tsx 文件中导入 menuItems, MenuItem 类型 和 findDeepestMenuItemPath 辅助函数
import { menuItems, MenuItem, findDeepestMenuItemPath } from './SideMenu'; // 请根据您的实际文件路径调整导入路径


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
  // findDeepestMenuItemPath 返回的路径已经包含了从根到目标项的所有父级
  if (matchedPathItems && matchedPathItems.length > 0 && currentPath !== '/home') {
    // 过滤掉 findDeepestMenuItemPath 返回的路径中的“首页”项（如果它包含的话），因为我们已经手动添加了
    const pathItemsAfterHome = matchedPathItems.filter(item => item.path !== '/home' || item.key !== '0'); // 假设首页的 key 是 '0'

    // 将找到的菜单路径转换为面包屑项
    pathItemsAfterHome.forEach((item, index) => {
      // 最后一个面包屑项通常是当前页面，不带链接
      const isLastItem = index === pathItemsAfterHome.length - 1;
      breadcrumbItems.push({
        key: item.key || item.path || `breadcrumb-${index}`, // 使用 key 或 path 作为唯一 key
        title: isLastItem ? (
          item.label // 最后一个项只显示文本
        ) : (
          // 非最后一个项带有链接
          <Link to={item.path || '#'}>{item.label}</Link> // 如果没有 path，链接到 #
        ),
      });
    });
  }

  // 如果当前路径没有在菜单中找到匹配项（例如 404 页面），面包屑将只显示“首页”

  return (
    <Breadcrumb
      style={{ margin: '16px 24px' }} // Ant Design 推荐的标准外边距
      items={breadcrumbItems} // 将构建好的面包屑项传递给 Breadcrumb 组件
    />
  );
};

export default BreadcrumbComponent;
