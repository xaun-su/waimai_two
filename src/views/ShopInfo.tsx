// src/components/ShopForm/FormDisabledDemo.tsx

import React, { useState, useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Upload,
  Checkbox,
  Row,
  Col,
  Space,
  message
} from 'antd';
import Title from '../components/Title';
import moment from 'moment';
import './shopinfo.less'; // 引入 Less 文件

const { RangePicker } = DatePicker;
const { TextArea } = Input;

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
  const [form] = Form.useForm();
  const avatarUploadRef = useRef<any>(null);
  const imagesUploadRef = useRef<any>(null);
  const [avatarFileList, setAvatarFileList] = useState<any[]>([]); // 新增状态
  const [shopImagesFileList, setShopImagesFileList] = useState<any[]>([]);

  const initialValues = {
    shopName: 'dsx',
    shopAnnouncement: '真心话:不好吃',
    minPrice: 5,
    deliveryTime: 5,
    deliveryDescription: 'hhh',
    shopRating: 1,
    shopSales: 13,
    activitySupport: ['single', 'vc', 'online'],
    businessHours: [moment('06:06:06', 'HH:mm:ss'), moment('12:51:35', 'HH:mm:ss')]
  };

  const handleAvatarChange = ({ fileList }: any) => {
    setAvatarFileList(fileList);
  };

  const handleShopImagesChange = ({ fileList }: any) => {
    setShopImagesFileList(fileList);
  };

  return (
    <div>
      <Title className="styled-title" left="店铺管理" right={<Button type="primary" onClick={() => console.log(form.getFieldsValue())}>保存店铺信息</Button>} />
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"

        style={{ maxWidth: 800 }}
        initialValues={initialValues}
      >
        <Form.Item label={<div className="styled-form-item-label">店铺名称</div>} name="shopName">
          <Input />
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">店铺公告</div>} name="shopAnnouncement">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">店铺头像</div>} name="shopAvatar" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload
            className="styled-upload"
            action="/upload.do"
            listType="picture-card"
            maxCount={1}  // 限制只能上传一个文件
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            beforeUpload={beforeUpload}
            ref={avatarUploadRef}
            onChange={handleAvatarChange} // 添加 onChange 事件
            fileList={avatarFileList} // 控制 fileList
          >
            {avatarFileList.length === 0 && ( // 仅在未上传时显示占位符
              <div className="styled-upload image-placeholder" onClick={() => avatarUploadRef.current?.openFileDialog()}>
                <PlusOutlined />
                <div>上传</div>
              </div>
            )}
          </Upload>
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">店铺图片</div>} name="shopImages" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload
            className="styled-upload"
            action="/upload.do"
            listType="picture-card"
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            beforeUpload={beforeUpload}
            ref={imagesUploadRef}
            onChange={handleShopImagesChange}
            fileList={shopImagesFileList}
          >
            {shopImagesFileList.length < 5 && ( // 限制最多上传 5 张图片
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
        <Form.Item label={<div className="styled-form-item-label">配送描述</div>} name="deliveryDescription">
          <Input />
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">店铺好评率</div>} name="shopRating" labelAlign="left">
          <Space>
            <InputNumber style={{ width: '100%' }} />
            <span className="styled-input-number-suffix">%</span>
          </Space>
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">店铺销量</div>} name="shopSales">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">活动支持</div>} name="activitySupport">
          <Checkbox.Group className="styled-checkbox-group" options={[
            { label: '单人精彩套餐', value: 'single' },
            { label: 'VC无限橙果汁全场8折', value: 'vc' },
            { label: '在线支付满28减5', value: 'online' },
            { label: '特价饮品八折抢购', value: 'discount' },
            { label: '中秋特惠', value: 'midAutumn' },
            { label: '国庆特价', value: 'nationalDay' },
            { label: '春节1折折扣', value: 'springFestival' },
          ]} />
        </Form.Item>
        <Form.Item label={<div className="styled-form-item-label">营业时间</div>} name="businessHours">
          <RangePicker showTime format="HH:mm:ss" />
        </Form.Item>
      </Form>
    </div>
  );
};

export default () => <FormDisabledDemo />;
