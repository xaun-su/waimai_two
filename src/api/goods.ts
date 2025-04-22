// api/goods.js
import { baseURL } from './config';
import request from '../utils/request';

// 商品相关（保留原有的，但本次修改主要关注分类）
export const good_list = '/goods/list';
export const good_del = '/goods/del';
export const good_info = '/goods/info';
export const good_add = '/goods/add';
export const good_edit = '/goods/edit';
export const good_img = baseURL+'/goods/goods_img_upload';

// 商品分类相关
export const good_category = '/goods/categories'; // 查询所有分类名称（可能用于下拉框等）
export const good_cate_list= '/goods/catelist'; // 商品分类列表（带分页）
export const good_cate_del = '/goods/delcate'; // 删除商品分类
export const good_cate_add = '/goods/addcate'; // 添加商品分类
export const good_cate_edit = '/goods/editcate'; // 修改商品分类


// 获取所有商品分类
export const getGoodsCategory = async (): Promise<any> => {
  return await request.get(good_category);
};

// 上传商品
export const addGoods = async (data: any): Promise<any> => {
  return await request.post(good_add, data);
};

// 获取分类列表 (带分页)
// 接收查询参数字符串，例如 '?currentPage=1&pageSize=10'
export const getGoodsCategoryList = async (str: string): Promise<any> => {
  return await request.get(good_cate_list + str);
};

// 添加商品分类
// data 应该包含新分类的信息，例如 { cateName: '...', state: 0/1 }
export const addGoodsCategory = async (data: { cateName: string, state: number }): Promise<any> => {
  return await request.post(good_cate_add, data);
};

// 修改商品分类
// data 应该包含分类的 ID 和需要修改的字段，例如 { id: 1, cateName: '...', state: 0/1 }
export const updateGoodsCategory = async (data: { id: number | string, cateName?: string, state?: number }): Promise<any> => {
  return await request.post(good_cate_edit, data);
};

// 删除商品分类
// id 是要删除的分类的 ID
export const deleteGoodsCategory = async (id: number | string): Promise<any> => {

  return await request.get(`${good_cate_del}?id=${id}`);
};
