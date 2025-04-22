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
  Modal, // 引入 Modal 组件
} from 'antd';
import Title from '../components/Title';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import Pagination from '../components/Pagination';
import { getOrderList, getOrderDetail, updateOrder } from '../api/orderlist'; // 引入 getOrderDetail 和 updateOrder

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

const OrderList = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // 新增状态：控制弹窗显示
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // 新增状态：存储当前查看/编辑的订单数据
  const [currentOrder, setCurrentOrder] = useState(null);

  // 获取订单列表数据
  const getOrderData = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {
        currentPage: pagination.current, // 使用当前分页状态的页码
        pageSize: pagination.pageSize, // 使用当前分页状态的每页条数
        ...filters, // 合并过滤条件
      };
      //  const res = await fetchOrderList(params); // 替换为实际的 API 调用
      const res = await getOrderList(params); // 使用实际的 API 调用
      console.log('获取订单列表数据:', res.data);
      if (res && res.data.code === 0) {
        const dataWithKeys = res.data.data.map(item => ({ ...item, key: item.id }));
        setOrderList(dataWithKeys);
        // 更新总条数，但保持当前页和每页条数，除非在搜索时重置了 current
        setPagination(prev => ({
          ...prev,
          total: res.data.total,
          // 如果是搜索触发的，current 已经在 onSearch 中被设置为 1
          // 如果是分页触发的，current 和 pageSize 已经在 handlePaginationChange 中被更新
        }));
      } else {
        message.error(res?.msg || '获取订单列表失败');
        setOrderList([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error('获取订单列表请求失败:', error);
      message.error('请求订单列表失败，请稍后再试！');
      setOrderList([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取第一页数据
  useEffect(() => {
    // 首次加载时，获取初始数据，使用默认分页参数
    getOrderData({ currentPage: 1, pageSize: pagination.pageSize });
  }, []); // 空依赖数组表示只在挂载时执行一次

  // 处理搜索表单提交
  const onSearch = (values) => {
    console.log('搜索条件:', values);
    const dateRange = values.dateRange;
    const startDate = dateRange ? moment(dateRange[0]).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const endDate = dateRange ? moment(dateRange[1]).format('YYYY-MM-DD HH:mm:ss') : undefined;

    // 在搜索时，重置分页到第一页
    setPagination(prev => ({ ...prev, current: 1 }));

    // 调用获取数据函数，带上过滤条件和重置后的分页参数 (current: 1)
    // 注意：这里直接调用 getOrderData，它会使用 state 中最新的 pagination.current (已经被设置为 1)
    getOrderData({
      orderNo: values.orderNumber,  // 对应后端的 orderNo
      consignee: values.recipient, // 对应后端的 consignee
      phone: values.phoneNumber,   // 对应后端的 phone
      orderState: values.orderStatus, // 对应后端的 orderState
      date: dateRange ? [startDate, endDate] : undefined, // 对应后端的 date
    });
  };

  // 处理分页变化（由自定义 Pagination 组件触发）
  const handlePaginationChange = (page, pageSize) => {
    console.log('分页变化: Page =', page, ', PageSize =', pageSize);
    // 更新分页状态
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));

    // 获取当前的过滤条件
    const currentFilters = form.getFieldsValue();
    const dateRange = currentFilters.dateRange;
    const startDate = dateRange ? moment(dateRange[0]).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const endDate = dateRange ? moment(dateRange[1]).format('YYYY-MM-DD HH:mm:ss') : undefined;

    // 重新获取数据，带上新的分页参数和当前的过滤条件
    // 注意：这里直接将新的 page 和 pageSize 传递给 getOrderData，
    // 避免依赖异步更新的 pagination state
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

  // 处理查看操作
  const handleView = async (record) => {
    console.log('查看订单:', record);
    setLoading(true);
    try {
      const res = await getOrderDetail(record.id);

      if (res && res.data.code === 0) {
        setCurrentOrder(res.data.data); // 存储订单数据
        setViewModalVisible(true); // 显示查看弹窗
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

  // 处理编辑操作
  const handleEdit = async (record) => {
    console.log('编辑订单:', record);
    setLoading(true);
    try {
      const res = await getOrderDetail(record.id);
      if (res && res.data.code === 0) {
        setCurrentOrder(res.data.data); // 存储订单数据
        form.setFieldsValue({ // 初始化表单数据
          ...res.data.data,
          orderTime: moment(res.data.data.orderTime),
          deliveryTime: moment(res.data.data.deliveryTime)
        });
        setEditModalVisible(true); // 显示编辑弹窗
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

  // 处理编辑表单提交
  const onEditFinish = async (values) => {
    setLoading(true);
    try {
      const params = {
        ...values,
        id: currentOrder.id,
        orderTime: moment(values.orderTime).format('YYYY-MM-DD HH:mm:ss'),
        deliveryTime: moment(values.deliveryTime).format('YYYY-MM-DD HH:mm:ss'),
      };
      const res = await updateOrder(params);
      if (res && res.data.code === 0) {
        message.success('修改订单成功!');
        setEditModalVisible(false);
        getOrderData({ // 刷新订单列表
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

  // 定义表格列
  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', }, // 使用 orderNo
    { title: '下单时间', dataIndex: 'orderTime', key: 'orderTime', render: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-', },
    { title: '联系电话', dataIndex: 'phone', key: 'phone', }, // 使用 phone
    { title: '收货人', dataIndex: 'consignee', key: 'consignee', }, // 使用 consignee
    { title: '送货地址', dataIndex: 'deliverAddress', key: 'deliverAddress', }, // 使用 deliverAddress
    { title: '送达时间', dataIndex: 'deliveryTime', key: 'deliveryTime', render: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-', },
    { title: '备注', dataIndex: 'remarks', key: 'remarks', },
    { title: '订单金额', dataIndex: 'orderAmount', key: 'orderAmount', render: (text) => `¥${text !== undefined ? text.toFixed(2) : '-'}`, }, // 格式化金额，处理 undefined
    { title: '订单状态', dataIndex: 'orderState', key: 'orderState', }, // 使用 orderState
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleView(record)}>查看</Button>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title left="订单列表" />

      {/* 搜索过滤区域 */}
      <Form
        form={form}
        layout="inline"
        onFinish={onSearch}
        style={{ marginBottom: 20 }}
      >
        <Form.Item name="orderNumber" label="订单号">
          <Input placeholder="请输入订单号" />
        </Form.Item>
        <Form.Item name="recipient" label="收货人">
          <Input placeholder="请输入收货人" />
        </Form.Item>
        <Form.Item name="phoneNumber" label="手机号">
          <Input placeholder="请输入手机号" />
        </Form.Item>
        <Form.Item name="orderStatus" label="订单状态">
          <Select placeholder="请选择订单状态" style={{ width: 120 }}>
            {orderStatusOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="dateRange" label="选择时间">
          <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            搜索
          </Button>
        </Form.Item>
      </Form>

      {/* 订单数据表格 */}
      <Spin spinning={loading}> {/* 将 Spin 放在 Table 外面，覆盖整个表格区域 */}
        <Table
          columns={columns}
          dataSource={orderList}
          // 禁用 Table 内置的分页
          pagination={false}
          // 如果需要处理排序和过滤，可以在这里添加 onChange，但要确保它不影响分页状态
          // onChange={(pagination, filters, sorter) => { /* 处理排序过滤 */ }}
        />
      </Spin>

      {/* 手动渲染您的自定义 Pagination 组件 */}
      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <Pagination
          total={pagination.total}  // 总条数
          current={pagination.current}  // 当前页码
          pageSize={pagination.pageSize}  // 每页条数
          onChange={handlePaginationChange}  // 分页变化时的回调
          showSizeChanger={true}  // 显示每页条数选择控件
          showQuickJumper={true}  // 显示快速跳转到页码的控件
          pageSizeOptions={['5', '10', '20', '50']}  // 每页条数的选项
          showTotal={(total) => `共 ${total} 条`}  // 显示总条数的格式
        />
      </div>

      {/* 查看订单详情弹窗 */}
      <Modal
        title="查看订单详情"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setViewModalVisible(false)}>
            返回
          </Button>,
        ]}
      >
        {currentOrder && (
          <div>
            <p>订单号: {currentOrder.orderNo}</p>
            <p>下单时间: {moment(currentOrder.orderTime).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p>联系电话: {currentOrder.phone}</p>
            <p>收货人: {currentOrder.consignee}</p>
            <p>送货地址: {currentOrder.deliverAddress}</p>
            <p>送达时间: {moment(currentOrder.deliveryTime).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p>备注: {currentOrder.remarks}</p>
            <p>订单金额: {currentOrder.orderAmount}</p>
            <p>订单状态: {currentOrder.orderState}</p>
          </div>
        )}
      </Modal>

      {/* 编辑订单弹窗 */}
      <Modal
        title="编辑订单"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null} // 自定义 footer
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onEditFinish}
          >
            <Form.Item
              label="订单号"
              name="orderNo"
              rules={[{ required: true, message: '请输入订单号!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="下单时间"
              name="orderTime"
              rules={[{ required: true, message: '请选择下单时间!' }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="联系电话"
              name="phone"
              rules={[{ required: true, message: '请输**系电话!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="收货人"
              name="consignee"
              rules={[{ required: true, message: '请输入收货人!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="送货地址"
              name="deliverAddress"
              rules={[{ required: true, message: '请输入送货地址!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="送达时间"
              name="deliveryTime"
              rules={[{ required: true, message: '请选择送达时间!' }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="备注"
              name="remarks"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="订单金额"
              name="orderAmount"
              rules={[{ required: true, message: '请输入订单金额!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="订单状态"
              name="orderState"
              rules={[{ required: true, message: '请选择订单状态!' }]}
            >
              <Select placeholder="请选择订单状态">
                {orderStatusOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default OrderList;
