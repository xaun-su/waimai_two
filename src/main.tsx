// main.tsx
import ReactDOM from 'react-dom/client'; // 导入 React 18 的客户端模块
import './index.less';
import App from './App.tsx';
import 'antd/dist/reset.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'; // 导入 Provider
import store from './store/store'; // 导入 Redux store
import { ConfigProvider } from 'antd';
import { AliveScope } from 'react-activation'; // 导入 KeepAlive 相关组件
import zhCN from 'antd/locale/zh_CN';

// 创建根节点
const root = ReactDOM.createRoot(document.getElementById('root')!);

// 使用 createRoot 渲染应用
root.render(
  <AliveScope> {/* 将 AliveScope 放在最外面 */}
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider locale={zhCN}>
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  </AliveScope>
);