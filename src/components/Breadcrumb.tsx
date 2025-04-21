import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import { privateRoutes } from '../router/routes';

const BreadcrumbComponent: React.FC = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  const getBreadcrumbNameMap = () => {
    const result: Record<string, string> = {};
    privateRoutes.forEach(route => {
      result[route.path] = route.name;
    });
    return result;
  };

  const breadcrumbNameMap = getBreadcrumbNameMap();

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return {
      key: url,
      title: <Link to={url}>{breadcrumbNameMap[url] || url.split('/').pop()}</Link>,
    };
  });

  const breadcrumbItems = [
    {
      title: <Link to="/">首页</Link>,
      key: 'home',
    },
    ...extraBreadcrumbItems,
  ];

  return (
    <Breadcrumb
      style={{ margin: '16px 24px' }}
      items={breadcrumbItems}
    />
  );
};

export default BreadcrumbComponent;