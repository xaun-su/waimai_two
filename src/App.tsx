import { Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './router/routes';
import LoginHome from './views/home/LoginHome';

function App() {
  return (
    <Routes>
      {/* 公共路由 */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
      
      {/* 私有路由 - 使用LoginHome作为布局容器 */}
      <Route path="/" element={<LoginHome />}>
        {privateRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>
    </Routes>
  );
}

export default App;
