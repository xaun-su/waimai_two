import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { baseURL } from '../api/config';
import store from '../store/store'; // 导入 Redux store

// 定义响应数据类型
interface ResponseData<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 创建axios实例，可以自定义配置
const request: AxiosInstance = axios.create({
  baseURL, // 基础URL
  timeout: 10000, // 请求超时时间，设置为10秒，可以根据实际情况调整
});

// 添加请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
    const token = store.getState().user.token; // 从 Redux store 中获取 token

    if (token) {
      // 使用 AxiosHeaders 实例化 headers，确保类型正确
      config.headers = new AxiosHeaders({
        ...config.headers,
        Authorization: 'Bearer ' + token,
      });
    }

    return config;
  },
  (err: AxiosError) => {
    console.error('请求错误：', err);
    return Promise.reject(err);
  }
);

// 添加响应拦截器
request.interceptors.response.use(
  (res: AxiosResponse<ResponseData>) => {
    if (!res.data.code) {
      res.data.code = 0;
    }

    if (res.data.code === 0) {
      return res;
    } else {
      message.error(res.data.msg || '服务器异常');
      return Promise.reject(res.data);
    }
  },
  (err: AxiosError) => {
    const navigate = useNavigate(); // 获取 navigate 实例

    if (err.response?.status === 401) {
      const currentPath = window.location.pathname + window.location.search;

      // 跳转到登录页面，并携带当前页面的路径
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      message.warning('登录已过期，请重新登录');

      // 返回拒绝的 Promise，避免后续逻辑继续执行
      return Promise.reject(err);
    } else {
      message.error((err.response?.data as ResponseData)?.msg || '服务器异常');
      console.error('响应错误：', err);
      return Promise.reject(err);
    }
  }
);

// 导出 axios 实例
export default request;