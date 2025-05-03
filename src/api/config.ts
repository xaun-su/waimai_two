import request from "../utils/request";

export const baseURL='/api'

// 店铺详情
export const  shop_info='/shop/info'

// 上传店铺图片
export const  shop_upload='/shop/upload'
export const  shop_upload_img=baseURL+shop_upload

export const  editShopInfo='/shop/edit'

//获取店铺详情
export const getOrderInfo = async ()=> {
  return await request.get(shop_info);
};

//修改店铺
export const postShopInfo = async (data:any)=> {
  return await request.post(editShopInfo,data);
};