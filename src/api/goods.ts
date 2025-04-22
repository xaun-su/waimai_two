import { baseURL } from './config';
import request from '../utils/request';
// 商品
// 商品列表的url
export const good_list = '/goods/list';
export const good_del = '/goods/del';

//获取商品信息
export const good_info = '/goods/info';
// 添加商品的url
export const good_add = '/goods/add';
//修改商品
export const good_edit = '/goods/edit';
// 商品图片上传
export const good_img = baseURL+'/goods/goods_img_upload';

// 查询所有分类名称
export const good_category = '/goods/categories';
//商品分类列表
export const good_cate_list= '/goods/catelist';
//删除商品分类
export const good_cate_del = '/goods/delcate';
//添加商品分类
export const good_cate_add = '/goods/addcate';
//修改商品分类
export const good_cate_edit = '/goods/editcate';


// 获取商品分类
export const getGoodsCategory = async (): Promise<any> => {
  return await request.get(good_category);
};

//上传商品
export const addGoods = async (data: any): Promise<any> => {
  return await request.post(good_add, data);
};