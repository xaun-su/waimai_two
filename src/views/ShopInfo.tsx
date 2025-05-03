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
import { getOrderInfo, baseURL, shop_upload_img, postShopInfo } from '../api/config' // 确保 baseURL 也被导入

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

// 定义活动映射：后端名称 -> 前端 Value
const backendToFrontendMap: { [key: string]: string } = {
  '单人精彩套餐': 'single',
  'VC无限橙果汁全场8折': 'vc',
  '在线支付满28减5': 'online',
  '特价饮品八折抢购': 'discount',
  '中秋特惠': 'midAutumn',
  '国庆特价': 'nationalDay',
  '春节1折折扣': 'springFestival',
  // 请根据您的实际活动类型和 Checkbox options 完善这个映射
};

// 定义活动映射：前端 Value -> 后端名称 (用于构建提交数据)
const frontendToBackendMap: { [key: string]: string } = {
  'single': '单人精彩套餐',
  'vc': 'VC无限橙果汁全场8折',
  'online': '在线支付满28减5',
  'discount': '特价饮品八折抢购',
  'midAutumn': '中秋特惠',
  'nationalDay': '国庆特价',
  'springFestival': '春节1折折扣',
  // 请根据您的实际活动类型和 Checkbox options 完善这个映射
};


const FormDisabledDemo: React.FC = () => {
  const [componentDisabled, setComponentDisabled] = useState<boolean>(true);
  const [form] = Form.useForm(); // 获取 form 实例
  const avatarUploadRef = useRef<any>(null);
  const imagesUploadRef = useRef<any>(null);
  // Upload 组件的状态，用于控制展示
  const [avatarFileList, setAvatarFileList] = useState<any[]>([]);
  const [shopImagesFileList, setShopImagesFileList] = useState<any[]>([]);


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
        // *** 修改点：将后端 deliveryPrice 映射到前端 Form.Item name="deliveryPrice" ***
        deliveryPrice: shopData.deliveryPrice,
        deliveryTime: shopData.deliveryTime,
        description: shopData.description, // 与后端字段名一致
        // *** 移除或忽略 minPrice 的填充，因为它在 Form 中可能没有对应的字段或者含义冲突 ***
        // minPrice: shopData.minPrice, // 根据 API 和 Form 设计决定是否需要此行
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
        // *** 修改点：使用 backendToFrontendMap 将后端名称转换为前端 value ***
        supports: shopData.supports && Array.isArray(shopData.supports) ? shopData.supports
          .map((supportName: string) => backendToFrontendMap[supportName]) // 将后端名称映射为前端 value
          .filter((value: string | undefined) => value !== undefined) // 过滤掉没有映射到的活动
          : [],

        date: shopData.date && Array.isArray(shopData.date) && shopData.date.length === 2 ? [
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

    // 确保 frontendToBackendMap 已经定义并包含正确的映射
    // 这里为了方便，直接在函数外部定义了 frontendToBackendMap

    const data = {
      // *** 修改点：从 values 中获取 id ***
      id: values.id, // 正确获取 id，前提是 Form.Item name="id" 存在

      name: values.name, // name 直接使用
      bulletin: values.bulletin, // bulletin 直接使用
      deliveryPrice: values.deliveryPrice, // 现在 Form.Item 的 name 是 deliveryPrice，这里就能正确获取了
      deliveryTime: values.deliveryTime, // deliveryTime 直接使用
      description: values.description, // description 直接使用
      score: values.score, // score 直接使用
      sellCount: values.sellCount, // sellCount 直接使用

      // avatar 需要提取 url 的最后部分（图片名）
      // 加上一些基本的安全检查
      avatar: values.avatar && Array.isArray(values.avatar) && values.avatar[0] && values.avatar[0].url
              ? values.avatar[0].url.split('/').pop()
              : '',

      // *** 修改点：使用 frontendToBackendMap 将前端 value 转换为后端名称 ***
      // 加上一些基本的安全检查
      supports: JSON.stringify(values.supports && Array.isArray(values.supports)
                ? values.supports.map((value: string) => frontendToBackendMap[value]).filter(mappedValue => mappedValue !== undefined) // 过滤掉未映射到的值
                : []),

      // pics 需要提取每个 item 的 url 的最后部分（图片名）
      // 加上一些基本的安全检查
      pics: JSON.stringify(values.pics && Array.isArray(values.pics)
            ? values.pics.map((item: any) => {
                // 检查 item 是否有 url 属性，并且 url 是字符串
                if (item && typeof item.url === 'string') {
                   return item.url.split('/').pop();
                }
                // 如果 item 或 url 不存在/无效，返回空字符串或根据需要处理
                return '';
              }).filter(picName => picName !== '') // 过滤掉空的图片名
            : []),

      // *** 修改点：date 需要将 Moment 对象数组转换为格式化后的日期字符串数组 ***
      // API 示例格式是 "YYYY-MM-DD HH:mm:ss"
      date:JSON.stringify( values.date && Array.isArray(values.date)
            ? values.date.map((momentObj: any) => {
                // 检查 momentObj 是否是有效的 Moment 对象
                if (momentObj && typeof momentObj.format === 'function') {
                    return momentObj.format('YYYY-MM-DD HH:mm:ss');
                }
                // 如果不是有效的 Moment 对象，返回空字符串或根据需要处理错误
                return '';
            }).filter(dateString => dateString !== '') // 过滤掉空的日期字符串
            : []), // 如果 values.date 不是数组或不存在，则返回空数组
    };

    console.log('要提交的数据', data);

    // 在这里调用 postShopInfo API 发送 data
    try {
        const response = await postShopInfo(data);
        console.log('提交成功:', response);
        message.success('店铺信息保存成功');
        // 可能需要根据后端响应做进一步处理，例如刷新数据
        // fetchData(); // 如果需要保存后立即刷新表单数据
    } catch (error) {
        console.error('提交失败:', error);
        message.error('店铺信息保存失败');
        // 处理提交失败的情况
    }
  };

  return (
    <div className="shop-info">
      <Title className="styled-title" left="店铺管理" right={<Button type="primary" onClick={() => PushShop(form.getFieldsValue())}>保存店铺信息</Button>} />
      <Form
        form={form} // 绑定 form 实例
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 800 }}
      >
        {/* *** 修改点：添加一个隐藏的 Form.Item 用于 id *** */}
        {/* 这确保 id 被 Ant Design Form 管理，并能通过 getFieldsValue 获取 */}
        <Form.Item name="id" hidden>
           <Input type="hidden" /> {/* 可以是任何隐藏的输入控件 */}
        </Form.Item>

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
        {/* *** 修改点：将 name 从 minPrice 改为 deliveryPrice *** */}
        <Form.Item label={<div className="styled-form-item-label">起送价格</div>} name="deliveryPrice">
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
            { label: 'VC无限橙果汁全场8折', value: 'vc' }, // 请确保这里的 value 与 frontendToBackendMap 中的 key 对应
            { label: '在线支付满28减5', value: 'online' },
            { label: '特价饮品八折抢购', value: 'discount' },
            { label: '中秋特惠', value: 'midAutumn' }, // 请确保这里的 value 与 frontendToBackendMap 中的 key 对应
            { label: '国庆特价', value: 'nationalDay' }, // 请确保这里的 value 与 frontendToBackendMap 中的 key 对应
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
