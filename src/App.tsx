import React from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './router/routes';
import Navbar from './components/Navbar'; // 导入 Navbar 组件

function App() {
  const element = useRoutes(routes);

  return (
    <div>
      <Navbar /> {/* 使用 Navbar 组件 */}
      <div className="container">{element}</div>
    </div>
  );
}

export default App;
