// src/components/ShopForm/FormDisabledDemo.tsx

import React, { useState, useRef, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Upload,
  Checkbox,
  message
} from 'antd';
import Title from '../components/Title';
import moment from 'moment'; // 确保您安装了 moment.js 或 dayjs，并根据您的 Ant Design 版本选择正确的导入
import './shopinfo.less'; // 引入 Less 文件
import {getOrderInfo, baseURL ,shop_upload_img} from '../api/config' // 确保 baseURL 也被导入

const { RangePicker } = DatePicker;
const { TextArea } = Input;

// ... normFile 和 beforeUpload 函数保持不变 ...
const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const beforeUpload = (file: any) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};


const FormDisabledDemo: React.FC = () => {
  const [componentDisabled, setComponentDisabled] = useState<boolean>(true);
  const [form] = Form.useForm(); // 获取 form 实例
  const avatarUploadRef = useRef<any>(null);
  const imagesUploadRef = useRef<any>(null);
  // Upload 组件的状态，用于控制展示
  const [avatarFileList, setAvatarFileList] = useState<any[]>([]);
  const [shopImagesFileList, setShopImagesFileList] = useState<any[]>([]);

  // 将后端返回的活动名称映射到前端 Checkbox 的 value
  // 请根据您的 Checkbox options 和后端 supports 数组的值来完善这个映射
  const activityMap: { [key: string]: string } = {
    '单人精彩套餐': 'single',
    'VC无限橙果汁全场8折': 'vc', // 假设有这个活动，根据您的 options 补充
    '在线支付满28减5': 'online',
    '特价饮品八折抢购': 'discount',
    '中秋特惠': 'midAutumn', // 假设有这个活动
    '国庆特价': 'nationalDay', // 假设有这个活动
    '春节1折折扣': 'springFestival',
  };

  // 获取店铺数据并填充表单
  const fetchData = async () => {
    try {
      const response = await getOrderInfo(); // 假设 getOrderInfo 返回的数据结构是 { data: { code: ..., data: { ...shopData } } }
      const shopData = response.data.data; // 提取实际的店铺数据对象

      console.log("获取到的原始店铺数据:", shopData);

      // --- 数据转换开始 ---
      // 转换后的数据对象，其键与 Form.Item 的 name 属性一致
      const transformedValues: any = {
        // 直接映射的字段
        id: shopData.id, // 如果需要填充 ID
        name: shopData.name,
        bulletin: shopData.bulletin,
        deliveryPrice: shopData.deliveryPrice,
        deliveryTime: shopData.deliveryTime,
        description: shopData.description, // 与后端字段名一致
        minPrice: shopData.minPrice,
        score: shopData.score, // 与后端字段名一致
        sellCount: shopData.sellCount, // 与后端字段名一致

        // 转换店铺头像 (avatar) - 与后端字段名一致
        avatar: shopData.avatar ? [{
          uid: '-1', // 唯一的标识符，在实际应用中可能需要更复杂的生成方式
          name: 'shop_avatar.jpg', // 文件名，可以尝试从 URL 中提取
          status: 'done', // 状态，表示已上传完成
          url: `${baseURL}${shopData.avatar}`, // 完整的图片 URL
          // 如果后端上传接口需要额外信息，可以在这里添加 originFileObj 或 response
        }] : [],

        // 转换店铺图片 (pics) - 与后端字段名一致
        pics: shopData.pics ? shopData.pics.map((url: string, index: number) => ({
          uid: `${index}`, // 唯一的标识符
          name: `shop_image_${index + 1}.jpg`, // 文件名
          status: 'done',
          url: `${baseURL}${url}`, // 完整的图片 URL
          // 如果后端上传接口需要额外信息，可以在这里添加 originFileObj 或 response
        })) : [],

        // 转换活动支持 (supports) - 与后端字段名一致
        supports: shopData.supports ? shopData.supports
          .map((supportName: string) => activityMap[supportName]) // 将中文名称映射为 value
          .filter((value: string | undefined) => value !== undefined) // 过滤掉没有映射到的活动
          : [],

        date: shopData.date && shopData.date.length === 2 ? [
          moment(shopData.date[0]), // 使用 moment 解析第一个时间字符串
          moment(shopData.date[1]), // 使用 moment 解析第二个时间字符串
        ] : undefined, //
      };
      // --- 数据转换结束 ---

      console.log("转换后的数据:", transformedValues);
      // 使用 form.setFieldsValue 填充表单
      form.setFieldsValue(transformedValues);

      // 同时更新 Upload 组件的 fileList 状态，以便正确显示已上传的图片
      setAvatarFileList(transformedValues.avatar); // 使用新的字段名 avatar
      setShopImagesFileList(transformedValues.pics); // 使用新的字段名 pics

      message.success('获取店铺数据成功');
    } catch (error) {
      message.error('获取店铺数据失败');
      console.error("获取店铺数据失败:", error);
    }
  };

  // 使用 useEffect 在组件挂载时调用 fetchData
  useEffect(() => {
    fetchData();
  }, []); // 确保依赖数组是空的 []，表示只在组件初次渲染后执行一次

  // 注意：这些 onChange handler 现在会接收到与表单字段同名的 fileList
  const handleAvatarChange = ({ fileList }: any) => {
    setAvatarFileList(fileList);
    // 当文件列表改变时，Form 会自动更新对应的字段 (avatar) 的值
  };

  const handleShopImagesChange = ({ fileList }: any) => {
    setShopImagesFileList(fileList);
    // 当文件列表改变时，Form 会自动更新对应的字段 (pics) 的值
  };
const PushShop = async (values: any) => {
    console.log("表单值：", values);
    const data={
      id:values.id,//
      name:values.name,//
      bulletin:values.bulletin,//
      deliveryPrice:values.deliveryPrice,//
      deliveryTime:values.deliveryTime,//
      description:values.description,//
      minPrice:values.minPrice,//
      score:values.score,//
      sellCount:values.sellCount,//
      avatar:values.avatar[0].url.split('/').pop(),//
      date:values.date,
      supports:values.supports.map((value: string) => activityMap[value]),
      pics:values.pics.map(item=> item.url.split('/').pop()),
    }
    console.log('要提交的数据', data);
    
}

  return (
    <div className="shop-info">
      <Title className="styled-title" left="店铺管理" right={<Button type="primary" onClick={()=>PushShop(form.getFieldsValue())}>保存店铺信息</Button>} />
      <Form
        form={form} // 绑定 form 实例
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 800 }}
      >
        {/* Form.Item name 与后端字段名一致 */}
         <Form.Item label={<div className="styled-form-item-label">店铺名称</div>} name="name">
          <Input />
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">店铺公告</div>} name="bulletin">
          <TextArea rows={4} />
        </Form.Item>
        {/* Upload 组件 name 改为 avatar */}
        <Form.Item label={<div className="styled-form-item-label">店铺头像</div>} name="avatar" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload
            className="styled-upload"
            action={shop_upload_img} 
            listType="picture-card"
            maxCount={1}
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            beforeUpload={beforeUpload}
            ref={avatarUploadRef}
            onChange={handleAvatarChange}
            fileList={avatarFileList} // 使用状态控制 fileList
          >
            {avatarFileList.length === 0 && (
              <div className="styled-upload image-placeholder" onClick={() => avatarUploadRef.current?.openFileDialog()}>
                <PlusOutlined />
                <div>上传</div>
              </div>
            )}
          </Upload>
        </Form.Item>
         {/* Upload 组件 name 改为 pics */}
        <Form.Item label={<div className="styled-form-item-label">店铺图片</div>} name="pics" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload
            className="styled-upload"
            action={shop_upload_img}
            listType="picture-card"
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            beforeUpload={beforeUpload}
            ref={imagesUploadRef}
            onChange={handleShopImagesChange}
            fileList={shopImagesFileList} // 使用状态控制 fileList
          >
            {shopImagesFileList.length < 100 && (
              <div className="styled-upload image-placeholder" onClick={() => imagesUploadRef.current?.openFileDialog()}>
                <PlusOutlined />
                <div>上传</div>
              </div>
            )}
          </Upload>
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">起送价格</div>} name="minPrice">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">送达时间</div>} name="deliveryTime">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
         {/* Input 组件 name 改为 description */}
        <Form.Item label={<div className="styled-form-item-label">配送描述</div>} name="description">
          <Input />
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">店铺好评率</div>} name="score">
            <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">店铺销量</div>} name="sellCount">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
         {/* Checkbox.Group 组件 name 改为 supports */}
        <Form.Item label={<div className="styled-form-item-label">活动支持</div>} name="supports">
          <Checkbox.Group className="styled-checkbox-group" options={[
            { label: '单人精彩套餐', value: 'single' },
            { label: 'VC无限橙果汁全场8折', value: 'vc' }, // 请确保这里的 value 与 activityMap 中的 key 对应
            { label: '在线支付满28减5', value: 'online' },
            { label: '特价饮品八折抢购', value: 'discount' },
            { label: '中秋特惠', value: 'midAutumn' }, // 请确保这里的 value 与 activityMap 中的 key 对应
            { label: '国庆特价', value: 'nationalDay' }, // 请确保这里的 value 与 activityMap 中的 key 对应
            { label: '春节1折折扣', value: 'springFestival' },
          ]} />
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">营业时间</div>} name="date">
          <RangePicker
    showTime
    format="YYYY-MM-DD HH:mm:ss"
    onChange={(dates, dateStrings) => {
      console.log('RangePicker onChange:', dates, dateStrings);
    }}
  />
        </Form.Item>
      </Form>
    </div>
  );
};

export default () => <FormDisabledDemo />;
