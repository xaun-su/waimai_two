import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.less'
import App from './App.tsx'
import 'antd/dist/reset.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'; // 导入 Provider
import store from './store/store'; // 导入 Redux store

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}> {/* 使用 Provider 组件 */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
