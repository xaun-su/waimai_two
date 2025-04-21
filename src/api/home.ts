// src/api/home.ts
import request from "../utils/request" // 假设您的 request 库在这里

export const home_url = '/stats/total'

// 定义接口响应数据的类型，提高代码可读性和健壮性
interface TotalDataResponse {
  totalOrder: number;
  totalAmount: number;
  todayOrder: number;
  totayAmount: number;
  xData: string[]; // 日期字符串数组
  orderData: number[]; // 订单数据数组
  amountData: number[]; // 金额数据数组
}

// 获取首页报表数据
// 返回类型明确为 AxiosResponse<TotalDataResponse>
export const getTotalData = async (): Promise<any> => { // 根据您的 request 库返回类型调整这里的 Promise<any>
  try {
    const response = await request.get<TotalDataResponse>(home_url);
    console.log('API Response from getTotalData:', response);
    return response; // 返回完整的响应对象
  } catch (error) {
    console.error('Error fetching total data:', error);
    throw error; // 抛出错误以便调用方处理
  }
}
