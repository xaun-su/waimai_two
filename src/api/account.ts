// ../api/account.js

import request from '../utils/request'
//个人信息
export const account_info = '/users/accountinfo'
// 遍历账户
export const account_list= '/users/list'
export const account_add = '/users/add'
export const account_delete = '/users/del'
export const account_update = '/users/edit'

//修改密码
export const account_password = '/users/editpwd'

// 个人中心
// 上传头像接口地址 (注意：这个是文件上传接口)
export const account_avatar_upload_url = '/users/avatar_upload'

// 添加用户
export const postAccountAdd = async (data: any): Promise<any> => {
  return await request.post(account_add, data)
}

// 修改密码
export const postAccountPassword = async (data: any): Promise<any> => {
  console.log('postAccountPassword', data)
  return await request.post(account_password, data)
}

//删除用户
export const deleteAccount = async (id: number): Promise<any> => {
  return await request.get(`${account_delete}?id=${id}`)
}

//更新用户
export const updateAccount = async (data: any): Promise<any> => {
  console.log('updateAccount', data)
  return await request.post(account_update, data)
}

// --- 新增 API 函数 ---

// 获取个人中心信息
export const getAccountInfo = async (id: number): Promise<any> => {
  return await request.get(`${account_info}?id=${id}`)
}

