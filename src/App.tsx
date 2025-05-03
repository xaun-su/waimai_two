// App.js

import { Routes, Route } from 'react-router-dom';
// 确保路径正确，根据你的项目结构调整
import { publicRoutes, privateRoutes } from './router/routes';
import LoginHome from './views/home/LoginHome'; // 确保路径正确
// 导入 KeepAlive
import { KeepAlive } from 'react-activation';

function App() {
  return (
    <Routes>
      {/* 公共路由 */}
      {/* 例如: /login */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}

      {/* 私有路由，嵌套在 LoginHome 布局中 */}
      {/* 父级路由 path="/" 匹配所有以 "/" 开头的路径，并渲染 LoginHome */}
      <Route path="/" element={<LoginHome />}>
        {privateRoutes.map((route) => {
          // *** 临时测试：移除 KeepAlive 逻辑 ***
          if (route.path === "/goodsList" || route.path === "/orderList") {
            console.log(`Route ${route.path}: Temporarily removed KeepAlive for testing.`);
            return (
              <Route
                key={route.path}
                path={route.path}
                element={route.element} // 直接渲染组件，不使用 KeepAlive
              />
            );
          }
          // *** 其他路由保持原有的 KeepAlive 逻辑 ***
          if (route.cache) {
            // 使用 route.cacheKey 或 route.path 作为默认 cacheKey，确保唯一性
            const cacheKey = route.cacheKey || route.path;
             console.log(`Route ${route.path}: Wrapped with KeepAlive (cacheKey: ${cacheKey}).`);
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <KeepAlive cacheKey={cacheKey}>
                    {route.element}
                  </KeepAlive>
                }
              />
            );
          }
          // 不需要缓存的路由
           console.log(`Route ${route.path}: No KeepAlive wrap.`);
          return (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          );
        })}

        {/* 建议：添加一个索引路由或重定向，用于处理访问 "/" 时的默认子路由 */}
        {/* 例如，如果用户已登录，可以重定向到 "/home" */}
        {/* <Route index element={<Navigate to="/home" replace />} /> */}

      </Route>

      {/* 建议：添加一个通配符路由来处理所有未匹配的路径（例如 404 页面或重定向到登录页） */}
      {/* <Route path="*" element={<Navigate to="/login" />} /> */}

    </Routes>
  );
}

export default App;
