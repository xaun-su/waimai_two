// App.js

import { Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './router/routes';
import LoginHome from './views/home/LoginHome';
// 导入 KeepAlive
import { KeepAlive } from 'react-activation'; 

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
      
      {/* 私有路由 */}
      <Route path="/" element={<LoginHome />}>
        {privateRoutes.map((route) => {
          if (route.cache) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <KeepAlive cacheKey={route.cacheKey}> 
                    {route.element}
                  </KeepAlive>
                }
              />
            );
          }
          return (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          );
        })}
      </Route>
    </Routes>
  );
}

export default App;
