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
// 上传头像
export const account_avatar = '/users/avatar_upload'

// 添加用户
export const postAccountAdd = async (data: any): Promise<any> => {
  return await request.post(account_add, data)
}

// 修改密码
export const postAccountPassword = async (data: any): Promise<any> => {
  console.log('postAccountPassword', data)
  return await request.post(account_password, data)
}
