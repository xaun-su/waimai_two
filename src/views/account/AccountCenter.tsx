import { useState, useEffect, useCallback } from 'react'; // 引入 Hooks
import { Card, Descriptions, Image, Spin, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons'; // 引入 Ant Design Icon
import Title from '../../components/Title'; // 假设 Title 组件路径正确
// 引入 API 常量和函数
import request from '../../utils/request'; // 确保 request 导入正确
import { baseURL } from '../../api/config'; // 确保 baseURL 导入正确

import {
  getAccountInfo, // 获取个人信息函数
  account_avatar_upload_url, // 头像上传接口地址 (对应 Vue 中的 account_avatar)
} from '../../api/account'; // 确保 API 函数和常量导入正确

import { useSelector } from 'react-redux'; // 引入 useSelector Hook

// 定义管理员信息类型 (如果使用 TypeScript，保留此接口)
interface AdminDetails {
  id: number;
  account: string;
  userGroup: string;
  ctime: string;
  imgUrl: string; // 注意这里存储的是完整的 URL
}

// 将类组件转换为函数组件
const AccountCenter = () => {
  // 使用 useState 管理状态
  const [userInfo, setUserInfo] = useState<AdminDetails | null>(null); // 使用类型声明，初始化为 null
  const [loading, setLoading] = useState(true); // 页面数据加载状态 (用于整个页面的 Spin)
  const [error, setError] = useState<string | null>(null); // 页面数据错误信息，使用类型声明
  // 移除了 uploading 状态，不再显示头像上传的等待动画
  // const [uploading, setUploading] = useState(false); // 头像上传状态

  // 使用 useSelector Hook 获取用户ID 和 Token
  // 确保 Redux store 结构正确，并且 user.userInfo 和 user.token 存在
  // 添加默认值 {} 防止在 Redux 状态未加载时访问属性导致报错
  const { id: userId } = useSelector((state: any) => state.user.userInfo || {});
  const userToken = useSelector((state: any) => state.user.token); // 假设 token 存储在 state.user.token

  console.log('个人ID', userId);
  console.log('用户 Token', userToken); // 打印 token

  // 使用 useCallback 包装 fetchData 函数，避免不必要的重新创建
  const fetchUserInfo = useCallback(async () => {
    if (!userId) {
      console.warn('userId is not available, skipping fetchUserInfo');
      setLoading(false); // 如果没有 userId，也需要停止加载状态
      setError('无法获取用户ID，请检查登录状态。');
      return;
    }

    setLoading(true);
    setError(null); // 开始加载前重置错误状态
    try {
      // 调用获取个人信息的 API
      // 注意：Vue 代码中使用的是查询参数 ?id=${user.id}，这里也保持一致
      // 假设 getAccountInfo 函数接受 id 作为参数，并在内部构建 URL
      // 如果 getAccountInfo 期望完整的 URL，请调整这里
      const res = await getAccountInfo(userId);
      console.log('获取个人信息成功:', res.data);

      if (res.data && res.data.code === 0 && res.data.accountInfo) {
        // 构建完整的头像 URL
        // 假设后端返回的 accountInfo.imgUrl 是相对路径，例如 '/uploads/avatar/xxx.png'
        const fullAvatarUrl = res.data.accountInfo.imgUrl
          ? `${baseURL}${res.data.accountInfo.imgUrl}`
          : null; // 如果没有 imgUrl，则设置为 null

        setUserInfo({
          ...res.data.accountInfo,
          imgUrl: fullAvatarUrl, // 存储完整的头像 URL (对应 Vue 中的 imgUrl 字段)
        });
        setLoading(false);
      } else {
          // 如果接口返回的数据结构不对或没有 accountInfo 或 code 不为 0
          setLoading(false);
          setError(res.data?.msg || '获取用户信息失败，数据结构异常或接口返回错误。'); // 使用可选链 ?.
      }

    } catch (error: any) { // 添加类型声明
      console.error('获取用户信息失败:', error);
      setLoading(false);
      setError(`获取用户信息失败: ${error.message || '请稍后再试。'}`);
    }
  }, [userId]); // 依赖 userId，当 userId 变化时重新创建函数

  // 格式化时间
  const formatDate = (dateString: string | undefined): string => { // 允许 dateString 为 undefined
    if (!dateString) return '';
    // 简单截取前10位，如果需要更复杂的格式化，可以使用 date-fns 或 moment.js
    return dateString.slice(0, 10);
  };

  // Token 验证函数
  const checkToken = useCallback(async () => {
      if (!userToken) {
          console.warn('Token is not available, skipping token check');
          return false;
      }
      try {
          // 假设 Token 验证接口是 /users/checktoken 并且接受 token 作为查询参数
          const response = await request.get('/users/checktoken', {
              params: { token: userToken },
          });

          if (response.data && response.data.code === 0) {
              console.log('Token 验证成功');
              return true;
          } else {
              console.error('Token 验证失败:', response.data?.msg);
              message.error(response.data?.msg || 'Token 无效，请重新登录');
              // TODO: 这里可以添加跳转到登录页面的逻辑，例如 history.push('/login');
              return false;
          }
      } catch (error: any) {
          console.error('验证 Token 失败:', error);
          message.error(`验证 Token 失败: ${error.message || '服务器异常，请稍后重试'}`);
          // TODO: 这里可以添加跳转到登录页面的逻辑
          return false;
      }
  }, [userToken]); // 依赖 userToken

  // 使用 useEffect 在组件挂载后获取用户信息，并依赖 fetchData 和 Token check
  useEffect(() => {
    const init = async () => {
        // 先进行 Token 验证
        const tokenValid = await checkToken();

        // 如果 Token 有效且 userId 存在，则获取用户信息
        if (tokenValid && userId) {
            fetchUserInfo();
        } else if (!tokenValid) {
             // 如果 Token 无效，停止加载并显示错误
             setLoading(false);
             setError('Token 无效，请重新登录。');
        } else if (!userId) {
             // 如果 userId 不存在（即使 Token 有效），也停止加载并显示错误
             setLoading(false);
             setError('无法获取用户ID，请检查登录状态。');
        }
    };
    init();
  }, [fetchUserInfo, userId, checkToken]); // 依赖 fetchData, userId, checkToken

  // 上传图片 URL 和请求头 (对应 Vue 代码)
  // **重要：这里移除了 URL 中的查询参数 id，只通过 data 属性传递**
  const uploadUrl = `${baseURL}${account_avatar_upload_url}`;
  // headers 属性直接传递给 Upload 组件
  const uploadHeaders = {
    // 根据后端要求添加其他必要的头部，例如 Content-Type 如果不是 multipart/form-data
    Authorization: `Bearer ${userToken}`, // 使用 Token 进行身份验证
  };

  // 上传前的检查 (对应 Vue 代码 beforeAvatarUpload)
  const beforeUpload = (file: File) => { // 添加类型声明
    console.log('Upload action:', uploadUrl);  // 打印上传接口地址
    console.log('Upload data:', { id: userId });  // 打印上传参数，包括 userId
    console.log('Upload headers:', uploadHeaders); // 打印上传请求头

    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('上传头像图片只能是 JPG 或 PNG 格式!');
      return Upload.LIST_IGNORE; // 阻止上传
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('上传头像图片大小不能超过 2MB!');
      return Upload.LIST_IGNORE; // 阻止上传
    }
    // 只有通过检查才允许上传，返回 true 或 Promise.resolve()
    return isJpgOrPng && isLt2M;
  };

   // 上传状态变化时的回调 (移除了 uploading 状态管理)
   const handleUploadChange = async (info: any) => { // 添加类型声明
    console.log('Upload change info:', info);
    console.log('File status:', info.file.status);

    // 移除了设置 uploading(true) 的逻辑，不再显示等待状态

    try {
      if (info.file.status === 'done') {
        const response = info.file.response; // 获取上传接口的响应数据
        console.log('Upload response:', response); // **保留并确保打印响应**

        if (response && response.code === 0) {
          message.success(`${info.file.name} 文件上传成功.`);

          // 假设后端返回的 imgUrl 是相对路径，例如 '/uploads/avatar/xxx.png'
          const uploadedImgFilename = response.imgUrl;
          console.log('上传的图片文件名:', uploadedImgFilename);

          // 构建完整的头像 URL
          const newFullAvatarUrl = `${baseURL}${uploadedImgFilename}`;
          console.log('New full avatar URL:', newFullAvatarUrl);

          // 直接更新 userInfo 状态中的 imgUrl
          setUserInfo(prevUserInfo => {
              if (!prevUserInfo) return null; // 如果之前是 null，则不更新
              return {
                  ...prevUserInfo,
                  imgUrl: newFullAvatarUrl, // 更新头像 URL
              };
          });

        } else {
          console.log('Upload API failed');
          // 打印后端返回的错误信息
          console.error('Upload error response:', response);
          message.error(`${info.file.name} 文件上传失败: ${response?.msg || '未知错误'}`); // 使用可选链 ?.
        }
      } else if (info.file.status === 'error') {
        console.log('Upload status is error');
         // info.file.error 包含了错误的详细信息，可以打印出来调试
         console.error('Upload error details:', info.file.error);
        message.error(`${info.file.name} 文件上传失败.`);
      } else {
        console.log('Unknown upload status:', info.file.status);
        // 对于非 done/error 状态，如果不需要显示 loading，也不需要处理
        // message.warning(`文件上传状态异常: ${info.file.status}`); // 可以选择保留或移除此警告
      }
    } catch (error: any) {
        // 捕获处理 done/error 状态时的潜在错误
        console.error('Error handling upload change:', error);
        message.error(`处理上传结果时发生错误: ${error.message || '未知错误'}`);
    } finally {
      // 移除了设置 uploading(false) 的逻辑，不再显示等待状态
      // 如果你希望在上传结束时执行其他清理操作（除了设置 uploading 状态），可以保留 finally 块
    }
  };


  // 渲染逻辑
  if (loading) {
    return (
      <div>
        <Title left="个人中心" />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Title left="个人中心" />
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          {error}
        </div>
      </div>
    );
  }

  // 如果用户信息加载成功
  return (
    <div className="admin-details" style={{ padding: '20px' }}> {/* 对应 Vue 的 class */}
      <Card style={{ padding: '20px' }}> {/* 对应 Vue 的 el-card 样式 */}
        <h3>管理员信息</h3> {/* 对应 Vue 的 h3 */}
        {/* 使用 flexbox 布局模拟 el-row/el-col */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {/* 左侧信息列 */}
          <div style={{ flex: 1, minWidth: '300px' }}> {/* 模拟 el-col */}
            {/* 使用 Descriptions 替代 Form 用于展示 */}
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="管理员ID">{userInfo?.id}</Descriptions.Item> {/* 使用可选链 ?. 防止 userInfo 是 null 时访问 */}
              <Descriptions.Item label="账号">{userInfo?.account}</Descriptions.Item>
              <Descriptions.Item label="用户组">{userInfo?.userGroup}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{formatDate(userInfo?.ctime)}</Descriptions.Item>
            </Descriptions>
          </div>

          {/* 右侧头像列 */}
          <div style={{ flex: 1, minWidth: '300px' }}> {/* 模拟 el-col */}
             {/* Ant Design 的 Descriptions.Item 可以包含复杂内容 */}
             <Descriptions column={1} bordered size="small">
               <Descriptions.Item label="管理员头像">
                {/* 使用 Upload 组件包裹 Image 组件 */}
                {/* Ant Design Upload 的 children 就是可点击触发上传的区域 */}
                <Upload
                  // name="avatar" // 上传文件字段名，请根据后端要求调整 (对应 Vue 的 name)
                  action={`${uploadUrl}?id=${userId}` }
                  data={{ id: userId }} // **通过 data 属性传递 userId**
                  headers={uploadHeaders} // 传递请求头 (对应 Vue 的 headers)
                  showUploadList={false} // 不显示默认的上传列表 (对应 Vue 的 show-file-list)
                  beforeUpload={beforeUpload} // 上传前检查 (对应 Vue 的 before-upload)
                  onChange={handleUploadChange} // 上传状态变化回调 (对应 Vue 的 on-success 和其他状态)
                  // 注意：Ant Design Upload 通常会自己发送请求，不需要手动使用 request
                >
                  {/* 根据是否有头像显示不同的内容 */}
                  {userInfo && userInfo.imgUrl ? ( // 确保 userInfo 和 imgUrl 存在
                    // 显示现有头像
                    <div style={{ position: 'relative', width: 150, height: 150, display: 'inline-block' }}> {/* 对应 Vue img 样式，inline-block 使其不占满父容器宽度 */}
                      <Image
                        width={150} // 设置图片宽度
                        height={150} // 设置图片高度
                        src={userInfo.imgUrl} // 图片源使用完整的 URL
                        alt="管理员头像"
                        preview={false} // 不允许点击放大预览，因为点击要触发上传
                        style={{ objectFit: 'cover', cursor: 'pointer', borderRadius: '6px' }} // 对应 Vue img 样式和 uploader 边框
                      />
                      {/* 移除了上传中的 Spin 动画 */}
                      {/* {uploading && (...) } */}
                    </div>
                  ) : (
                    // 没有头像时显示一个默认的上传区域 (对应 Vue avatar-uploader-icon)
                    <div style={{
                       width: 150,
                       height: 150,
                       border: '1px dashed #d9d9d9',
                       borderRadius: '6px', // 对应 Vue 样式
                       display: 'flex',
                       flexDirection: 'column',
                       justifyContent: 'center',
                       alignItems: 'center',
                       cursor: 'pointer',
                       position: 'relative', // 为了放置可能的其他内容
                       // 移除了上传中背景变暗的样式
                       // backgroundColor: uploading ? 'rgba(255, 255, 255, 0.6)' : 'transparent',
                    }}>
                      {/* 移除了上传中的 Spin 动画 */}
                      {/* <Spin spinning={uploading}> */}
                         {/* 你可以放一个图标或者文字提示用户上传 */}
                         <PlusOutlined style={{ fontSize: '28px', color: '#8c9398' }} /> {/* 对应 Vue icon */}
                         <div style={{ color: '#8c9398', marginTop: '8px' }}>上传头像</div> {/* 添加文字提示 */}
                      {/* </Spin> */}
                    </div>
                  )}
                </Upload>
               </Descriptions.Item>
             </Descriptions>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccountCenter;    