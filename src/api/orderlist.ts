import request from "../utils/request"

export const order_list = '/order/list'
export const order_detail = '/order/detail'
export const order_update = '/order/edit'

//遍历订单列表
export const getOrderList = async (params: any): Promise<any> => {
  // 过滤掉值为 undefined 的参数
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([value]) => value !== undefined)
  );

  // 将参数转换为 URL 查询字符串
  const queryString = Object.keys(filteredParams)
    .map(key => `${key}=${filteredParams[key]}`)
    .join('&');

  return await request.get(`${order_list}?${queryString}`);
}

//查看订单详情
export const getOrderDetail = async (id: number): Promise<any> => {
  return await request.get(order_detail + '?id=' + id)
}
// 编辑订单
export const updateOrder = async (data: any): Promise<any> => {
  return await request.post(order_update, data)
}
