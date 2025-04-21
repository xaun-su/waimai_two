import React, { useState, useEffect, useCallback } from 'react'; // 引入 Hooks
import { Card, Descriptions, Image, Spin, Upload, message } from 'antd';
import Title from '../../components/Title';
// 引入新的 API 常量和函数
import request from '../../utils/request'; // 确保 request 导入正确
import { baseURL } from '../../api/config';

import {
  getAccountInfo, // 获取个人信息函数
  account_avatar_upload_url, // 头像上传接口地址
} from '../../api/account';
import { useSelector } from 'react-redux'; // 引入 useSelector Hook

// 将类组件转换为函数组件
const AccountCenter = () => {
  // 使用 useState 管理状态
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // 页面数据加载状态
  const [error, setError] = useState(null); // 页面数据错误信息
  const [uploading, setUploading] = useState(false); // 头像上传状态

  // 使用 useSelector Hook 获取用户ID (现在在函数组件中是合法的)
  const userId = useSelector((state) => state.user.userInfo).id;

  console.log('个人ID', userId);

  // 使用 useCallback 包装 fetchData 函数，避免不必要的重新创建
  const fetchUserInfo = useCallback(async () => {
    setLoading(true);
    setError(null); // 开始加载前重置错误状态
    try {
      // 调用获取个人信息的 API
      const res = await getAccountInfo(userId); // 使用从 Hook 获取的 userId
      console.log('获取个人信息成功:', res.data);
      if (res.data.accountInfo) {
        // 构建完整的头像 URL
        const fullAvatarUrl = res.data.accountInfo.imgUrl 
          ? `${baseURL}${res.data.accountInfo.imgUrl}` 
          : null; // 如果没有 imgUrl，则设置为 null

        setUserInfo({
          ...res.data.accountInfo,
          avatarUrl: fullAvatarUrl, // 存储完整的头像 URL
        });
        setLoading(false);
      } else {
          // 如果接口返回的数据结构不对或没有 accountInfo
          setLoading(false);
          setError('获取用户信息失败，数据结构异常。');
      }

    } catch (error) {
      console.error('获取用户信息失败:', error);
      setLoading(false);
      setError('获取用户信息失败，请稍后再试。');
    }
  }, [userId]); // 依赖 userId，当 userId 变化时重新创建函数

  // 使用 useEffect 在组件挂载后获取用户信息，并依赖 fetchData
  useEffect(() => {
    // 确保 userId 已经获取到再调用 fetchData
    if (userId) {
       fetchUserInfo();
    }
  }, [fetchUserInfo, userId]); // 依赖 fetchData 和 userId

  // 上传前的检查
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 文件!');
      return Upload.LIST_IGNORE; // 阻止上传
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!');
      return Upload.LIST_IGNORE; // 阻止上传
    }
    // 只有通过检查才允许上传，返回 true 或 Promise.resolve()
    return isJpgOrPng && isLt2M;
  };

  // 上传状态变化时的回调
  const handleUploadChange = async (info) => {
    console.log('Upload change info:', info);
    console.log('File status:', info.file.status);

    if (info.file.status === 'uploading') {
      console.log('Setting uploading to true');
      setUploading(true);
      // 在 uploading 状态下，通常不需要执行后续逻辑，直接返回
      return; 
    }

    // 尝试在上传流程结束时（无论成功或失败）设置 uploading 为 false
    // 注意：这是一种调试手段，可能需要根据实际问题调整
    try {
        if (info.file.status === 'done') {
            console.log('Upload status is done');
            const response = info.file.response; // 获取上传接口的响应数据
            console.log('Upload response:', response);

            if (response && response.code === 0) {
                message.success(`${info.file.name} 文件上传成功.`);

                const uploadedImgFilename = response.imgUrl;
                console.log('上传的图片文件名:', uploadedImgFilename);

                const newFullAvatarUrl = `${baseURL}${uploadedImgFilename}`;
                console.log('New full avatar URL:', newFullAvatarUrl);

                // 调用修改头像 URL 的 API 保存到用户记录
                try {
                    console.log('Calling updateAvatarUrl');
                    const updateRes = await updateAvatarUrl({
                        id: userId,
                        imgUrl: newFullAvatarUrl,
                    });
                    console.log('updateAvatarUrl response:', updateRes);

                    if (updateRes && updateRes.code === 0) {
                        message.success('头像更新成功!');
                        setUserInfo(prevUserInfo => ({
                            ...prevUserInfo,
                            avatarUrl: newFullAvatarUrl,
                        }));
                        console.log('Update URL API success');
                    } else {
                         console.log('Update URL API failed');
                         message.error(`头像更新失败: ${updateRes ? updateRes.msg : '未知错误'}`);
                    }

                } catch (updateError) {
                    console.error('更新头像 URL 失败:', updateError);
                    message.error('更新头像 URL 失败，请稍后再试。');
                }

            } else {
                console.log('Upload API failed');
                message.error(`${info.file.name} 文件上传失败: ${response ? response.msg : '未知错误'}`);
            }

        } else if (info.file.status === 'error') {
            console.log('Upload status is error');
            message.error(`${info.file.name} 文件上传失败.`);
        } else {
           console.log('Unknown upload status:', info.file.status);
           // 如果出现未知状态，也尝试提示并重置
           message.warning(`文件上传状态异常: ${info.file.status}`);
        }

    } finally {
        // 在处理完 'done', 'error', 或未知状态后，确保设置 uploading 为 false
        console.log('Setting uploading to false in finally');
        setUploading(false);
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
    <div>
      <Title left="个人中心" />
      <Card style={{ margin: '20px' }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="管理员ID">{userInfo.id}</Descriptions.Item>
          <Descriptions.Item label="账号">{userInfo.account}</Descriptions.Item>
          <Descriptions.Item label="用户组">{userInfo.userGroup}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{userInfo.ctime}</Descriptions.Item>
          <Descriptions.Item label="管理员头像">
            {/* 使用 Upload 组件包裹 Image 组件 */}
            <Upload
              name="avatar" // 上传文件字段名，通常是 'file' 或 'avatar'，请根据后端要求调整
              action={baseURL+account_avatar_upload_url} // 头像上传接口地址
              data={{ id: userId }} // 将用户ID作为参数传递给上传接口
              showUploadList={false} // 不显示默认的上传列表
              beforeUpload={beforeUpload} // 上传前检查
              onChange={handleUploadChange} // 上传状态变化回调
            >
              {/* Upload 的 children 就是可点击触发上传的区域 */}
              {userInfo && userInfo.avatarUrl ? ( // 确保 userInfo 存在再访问 avatarUrl
                <div style={{ position: 'relative' }}>
                  <Image
                    width={100} // 设置图片宽度
                    src={userInfo.avatarUrl} // 图片源使用完整的 URL
                    alt="管理员头像"
                    preview={false} // 不允许点击放大预览，因为点击要触发上传
                    style={{ display: 'block' }} // 避免底部留白
                  />
                   {/* 上传中显示加载动画 */}
                  {uploading && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    }}>
                       <Spin />
                    </div>
                  )}
                </div>
              ) : (
                // 没有头像时显示一个默认的上传区域
                <div style={{ width: 100, height: 100, border: '1px dashed #d9d9d9', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                  <Spin spinning={uploading}>
                     {/* 你可以放一个图标或者文字提示用户上传 */}
                     {uploading ? '' : '上传头像'}
                  </Spin>
                </div>
              )}
            </Upload>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default AccountCenter;
