import request from "../utils/request";

export const baseURL='http://8.137.157.16:9002'

// 店铺详情
export const  shop_info='/shop/info'

// 上传店铺图片
export const  shop_upload='/shop/upload'
export const  shop_upload_img=baseURL+shop_upload


//获取店铺详情
export const getOrderInfo = async ()=> {
  return await request.get(shop_info);
};

