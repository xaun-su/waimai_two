import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Space,
  message,
  Spin,
  Modal,
} from 'antd';
import Title from '../components/Title';
import moment from 'moment';
import Pagination from '../components/Pagination';
import { getOrderList, getOrderDetail, updateOrder } from '../api/orderlist';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 订单状态选项 (示例)
const orderStatusOptions = [
  { label: '全部', value: '' },
  { label: '待付款', value: '待付款' },
  { label: '已受理', value: '已受理' },
  { label: '配送中', value: '配送中' },
  { label: '已完成', value: '已完成' },
  { label: '已取消', value: '已取消' },
];

// 订单数据类型
interface Order {
  id: string;
  orderNo: string;
  orderTime: string;
  phone: string;
  consignee: string;
  deliverAddress: string;
  deliveryTime: string;
  remarks: string;
  orderAmount: number;
  orderState: string;
}

// 翻页信息类型
interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

const OrderList: React.FC = () => {
  const [form] = Form.useForm();
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // 新增状态：控制弹窗显示
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);

  // 新增状态：存储当前查看/编辑的订单数据
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // 获取订单列表数据
  const getOrderData = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
      };
      const res = await getOrderList(params);
      console.log('获取订单列表数据:', res.data);
      if (res && res.data.code === 0) {
        const dataWithKeys = res.data.data.map((item: Order) => ({
          ...item,
          key: item.id,
        }));
        setOrderList(dataWithKeys);
        setPagination((prev) => ({
          ...prev,
          total: res.data.total,
        }));
      } else {
        message.error(res?.msg || '获取订单列表失败');
        setOrderList([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error('获取订单列表请求失败:', error);
      message.error('请求订单列表失败，请稍后再试！');
      setOrderList([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrderData({ currentPage: 1, pageSize: pagination.pageSize });
  }, []);

  const onSearch = (values: any) => {
    console.log('搜索条件:', values);
    const dateRange = values.dateRange;
    const startDate = dateRange ? moment(dateRange[0]).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const endDate = dateRange ? moment(dateRange[1]).format('YYYY-MM-DD HH:mm:ss') : undefined;

    setPagination((prev) => ({ ...prev, current: 1 }));

    getOrderData({
      orderNo: values.orderNumber,
      consignee: values.recipient,
      phone: values.phoneNumber,
      orderState: values.orderStatus,
      date: dateRange ? [startDate, endDate] : undefined,
    });
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    console.log('分页变化: Page =', page, ', PageSize =', pageSize);
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));

    const currentFilters = form.getFieldsValue();
    const dateRange = currentFilters.dateRange;
    const startDate = dateRange ? moment(dateRange[0]).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const endDate = dateRange ? moment(dateRange[1]).format('YYYY-MM-DD HH:mm:ss') : undefined;

    getOrderData({
      currentPage: page,
      pageSize: pageSize,
      orderNo: currentFilters.orderNumber,
      consignee: currentFilters.recipient,
      phone: currentFilters.phoneNumber,
      orderState: currentFilters.orderStatus,
      date: dateRange ? [startDate, endDate] : undefined,
    });
  };

  const handleView = async (record: Order) => {
    console.log('查看订单:', record);
    setLoading(true);
    try {
      const res = await getOrderDetail(Number(record.id));
      if (res && res.data.code === 0) {
        setCurrentOrder(res.data.data);
        setViewModalVisible(true);
      } else {
        message.error(res?.msg || '获取订单详情失败');
      }
    } catch (error) {
      console.error('获取订单详情请求失败:', error);
      message.error('请求订单详情失败，请稍后再试！');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (record: Order) => {
    console.log('编辑订单:', record);
    setLoading(true);
    try {
      const res = await getOrderDetail(Number(record.id));
      if (res && res.data.code === 0) {
        setCurrentOrder(res.data.data);
        form.setFieldsValue({
          ...res.data.data,
          orderTime: moment(res.data.data.orderTime),
          deliveryTime: moment(res.data.data.deliveryTime),
        });
        setEditModalVisible(true);
      } else {
        message.error(res?.msg || '获取订单详情失败');
      }
    } catch (error) {
      console.error('获取订单详情请求失败:', error);
      message.error('请求订单详情失败，请稍后再试！');
    } finally {
      setLoading(false);
    }
  };

  const onEditFinish = async (values: any) => {
    setLoading(true);
    try {
      const params = {
        ...values,
        id: currentOrder?.id,
        orderTime: moment(values.orderTime).format('YYYY-MM-DD HH:mm:ss'),
        deliveryTime: moment(values.deliveryTime).format('YYYY-MM-DD HH:mm:ss'),
      };
      const res = await updateOrder(params);
      if (res && res.data.code === 0) {
        message.success('修改订单成功!');
        setEditModalVisible(false);
        getOrderData({
          currentPage: pagination.current,
          pageSize: pagination.pageSize,
        });
      } else {
        message.error(res?.msg || '修改订单失败');
      }
    } catch (error) {
      console.error('修改订单请求失败:', error);
      message.error('修改订单失败，请稍后再试！');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '下单时间', dataIndex: 'orderTime', key: 'orderTime', render: (text: string) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-') },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '收货人', dataIndex: 'consignee', key: 'consignee' },
    { title: '送货地址', dataIndex: 'deliverAddress', key: 'deliverAddress' },
    { title: '送达时间', dataIndex: 'deliveryTime', key: 'deliveryTime', render: (text: string) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-') },
    { title: '备注', dataIndex: 'remarks', key: 'remarks' },
    { title: '订单金额', dataIndex: 'orderAmount', key: 'orderAmount', render: (text: number) => `¥${text !== undefined ? text.toFixed(2) : '-'}` },
    { title: '订单状态', dataIndex: 'orderState', key: 'orderState' },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleView(record)}>查看</Button>
          <Button type="link"
            onClick={() => handleEdit(record)}>编辑</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title left="订单列表" />
      <Form form={form} onFinish={onSearch} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item label="订单号" name="orderNumber">
          <Input placeholder="请输入订单号" />
        </Form.Item>
        <Form.Item label="收货人" name="recipient">
          <Input placeholder="请输入收货人" />
        </Form.Item>
        <Form.Item label="联系电话" name="phoneNumber">
          <Input placeholder="请输入联系电话" />
        </Form.Item>
        <Form.Item label="订单状态" name="orderStatus">
          <Select style={{ width: 120 }} defaultValue="">
            {orderStatusOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="日期" name="dateRange">
          <RangePicker />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">搜索</Button>
        </Form.Item>
      </Form>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={orderList}
          pagination={false}
        />
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={handlePaginationChange}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={['5', '10', '20']}
          showTotal={(total) => `共 ${total} 条`}
        />
      </Spin>

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentOrder ? (
          <div>
            <p>订单号: {currentOrder.orderNo}</p>
            <p>下单时间: {moment(currentOrder.orderTime).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p>联系电话: {currentOrder.phone}</p>
            <p>收货人: {currentOrder.consignee}</p>
            <p>送货地址: {currentOrder.deliverAddress}</p>
            <p>送达时间: {moment(currentOrder.deliveryTime).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p>备注: {currentOrder.remarks}</p>
            <p>订单金额: ¥{currentOrder.orderAmount.toFixed(2)}</p>
            <p>订单状态: {currentOrder.orderState}</p>
          </div>
        ) : (
          <p>加载中...</p>
        )}
      </Modal>

      {/* 编辑订单弹窗 */}
      <Modal
        title="编辑订单"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={onEditFinish}
          initialValues={currentOrder || {}}
        >
          <Form.Item label="订单号" name="orderNo">
            <Input disabled />
          </Form.Item>
          <Form.Item label="下单时间" name="orderTime">
            <DatePicker showTime />
          </Form.Item>
          <Form.Item label="联系电话" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="收货人" name="consignee">
            <Input />
          </Form.Item>
          <Form.Item label="送货地址" name="deliverAddress">
            <Input />
          </Form.Item>
          <Form.Item label="送达时间" name="deliveryTime">
            <DatePicker showTime />
          </Form.Item>
          <Form.Item label="备注" name="remarks">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="订单金额" name="orderAmount">
            <Input disabled />
          </Form.Item>
          <Form.Item label="订单状态" name="orderState">
            <Select>
              {orderStatusOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">提交</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderList;
