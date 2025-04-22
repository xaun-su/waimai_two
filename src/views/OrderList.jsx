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
} from 'antd';
import Title from '../components/Title';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import Pagination from '../components/Pagination'; 
// 模拟 API 调用
// **请替换为您的实际 API 调用函数**
const fetchOrderList = async (params) => {
  console.log('模拟请求参数:', params);
  // 模拟异步请求
  await new Promise(resolve => setTimeout(resolve, 500)); // 稍微缩短模拟延迟

  // 模拟后端返回的数据结构
  const mockData = {
    code: 0,
    msg: '成功',
    data: {
      list: [
        { id: '16013', orderTime: '2020-06-04T09:35:19.000Z', contactPhone: '18181358998', recipient: '汪小哥', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '不要辣', orderAmount: 30, orderStatus: '已完成', },
        { id: '16012', orderTime: '2020-06-04T09:35:13.000Z', contactPhone: '18181358998', recipient: '江女士', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '不要辣', orderAmount: 60, orderStatus: '已完成', },
        { id: '16011', orderTime: '2020-06-04T09:35:03.000Z', contactPhone: '18181358998', recipient: '李俊聪', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '微辣', orderAmount: 99.88, orderStatus: '已受理', },
        { id: '15014', orderTime: '2020-06-04T09:34:43.000Z', contactPhone: '18181358998', recipient: '李大陆', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '不要辣', orderAmount: 99.88, orderStatus: '已受理', },
        { id: '15013', orderTime: '2020-06-04T09:34:33.000Z', contactPhone: '18181358998', recipient: '王女士', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '微辣', orderAmount: 19.88, orderStatus: '已完成', },
         // 模拟更多数据以测试分页
        { id: '15012', orderTime: '2020-06-04T09:34:23.000Z', contactPhone: '18181358998', recipient: '赵四', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '多放香菜', orderAmount: 45, orderStatus: '配送中', },
        { id: '15011', orderTime: '2020-06-04T09:34:13.000Z', contactPhone: '18181358998', recipient: '刘能', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '加辣', orderAmount: 25, orderStatus: '已受理', },
        { id: '15010', orderTime: '2020-06-04T09:34:03.000Z', contactPhone: '18181358998', recipient: '谢广坤', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '少盐', orderAmount: 55, orderStatus: '已完成', },
      ],
      total: 21, // 模拟总条数
    },
  };

    // 模拟根据参数过滤数据 (简单示例)
    const allMockOrders = [
         { id: '16013', orderTime: '2020-06-04T09:35:19.000Z', contactPhone: '18181358998', recipient: '汪小哥', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '不要辣', orderAmount: 30, orderStatus: '已完成', },
        { id: '16012', orderTime: '2020-06-04T09:35:13.000Z', contactPhone: '18181358998', recipient: '江女士', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '不要辣', orderAmount: 60, orderStatus: '已完成', },
        { id: '16011', orderTime: '2020-06-04T09:35:03.000Z', contactPhone: '18181358998', recipient: '李俊聪', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '微辣', orderAmount: 99.88, orderStatus: '已受理', },
        { id: '15014', orderTime: '2020-06-04T09:34:43.000Z', contactPhone: '18181358998', recipient: '李大陆', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '不要辣', orderAmount: 99.88, orderStatus: '已受理', },
        { id: '15013', orderTime: '2020-06-04T09:34:33.000Z', contactPhone: '18181358998', recipient: '王女士', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '微辣', orderAmount: 19.88, orderStatus: '已完成', },
        { id: '15012', orderTime: '2020-06-04T09:34:23.000Z', contactPhone: '18181358998', recipient: '赵四', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '多放香菜', orderAmount: 45, orderStatus: '配送中', },
        { id: '15011', orderTime: '2020-06-04T09:34:13.000Z', contactPhone: '18181358998', recipient: '刘能', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '加辣', orderAmount: 25, orderStatus: '已受理', },
        { id: '15010', orderTime: '2020-06-04T09:34:03.000Z', contactPhone: '18181358998', recipient: '谢广坤', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '少盐', orderAmount: 55, orderStatus: '已完成', },
         // 再多一些数据，确保总数超过一页
         { id: '15009', orderTime: '2020-06-04T09:33:53.000Z', contactPhone: '18181358998', recipient: '宋小宝', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '正常', orderAmount: 70, orderStatus: '待付款', },
         { id: '15008', orderTime: '2020-06-04T09:33:43.000Z', contactPhone: '18181358998', recipient: '小沈阳', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '不吃葱', orderAmount: 80, orderStatus: '已受理', },
         { id: '15007', orderTime: '2020-06-04T09:33:33.000Z', contactPhone: '18181358998', recipient: '文松', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '加冰', orderAmount: 90, orderStatus: '配送中', },
         { id: '15006', orderTime: '2020-06-04T09:33:23.000Z', contactPhone: '18181358998', recipient: '杨树林', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '打包', orderAmount: 100, orderStatus: '已完成', },
          { id: '15005', orderTime: '2020-06-04T09:33:13.000Z', contactPhone: '18181358998', recipient: '田娃', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '多醋', orderAmount: 110, orderStatus: '已取消', },
          { id: '15004', orderTime: '2020-06-04T09:33:03.000Z', contactPhone: '18181358998', recipient: '胖丫', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '少糖', orderAmount: 120, orderStatus: '已受理', },
          { id: '15003', orderTime: '2020-06-04T09:32:53.000Z', contactPhone: '18181358998', recipient: '王金龙', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '加麻', orderAmount: 130, orderStatus: '配送中', },
          { id: '15002', orderTime: '2020-06-04T09:32:43.000Z', contactPhone: '18181358998', recipient: '丫蛋', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '不香菜', orderAmount: 140, orderStatus: '已完成', },
           { id: '15001', orderTime: '2020-06-04T09:32:33.000Z', contactPhone: '18181358998', recipient: '程野', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '多糖', orderAmount: 150, orderStatus: '待付款', },
           { id: '15000', orderTime: '2020-06-04T09:32:23.000Z', contactPhone: '18181358998', recipient: '张小飞', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '少辣', orderAmount: 160, orderStatus: '已受理', },
            { id: '14999', orderTime: '2020-06-04T09:32:13.000Z', contactPhone: '18181358998', recipient: '王小利', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '正常', orderAmount: 170, orderStatus: '配送中', },
            { id: '14998', orderTime: '2020-06-04T09:32:03.000Z', contactPhone: '18181358998', recipient: '唐鉴军', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '不麻', orderAmount: 180, orderStatus: '已完成', },
             { id: '14997', orderTime: '2020-06-04T09:31:53.000Z', contactPhone: '18181358998', recipient: '刘小光', deliveryAddress: '天府新谷', deliveryTime: '2020-04-16T02:44:58.000Z', remarks: '多冰', orderAmount: 190, orderStatus: '已取消', },
    ];


    let filteredList = allMockOrders.filter(item => {
        let isMatch = true;
        if (params.orderNumber && !item.id.includes(params.orderNumber)) {
            isMatch = false;
        }
        if (params.recipient && !item.recipient.includes(params.recipient)) {
            isMatch = false;
        }
        if (params.phoneNumber && !item.contactPhone.includes(params.phoneNumber)) {
            isMatch = false;
        }
        // 注意：订单状态过滤需要处理 '全部' 的情况
        if (params.orderStatus && params.orderStatus !== '' && item.orderStatus !== params.orderStatus) {
            isMatch = false;
        }
        // TODO: 添加日期范围过滤逻辑
         if (params.startDate && moment(item.orderTime).isBefore(moment(params.startDate))) {
             isMatch = false;
         }
         if (params.endDate && moment(item.orderTime).isAfter(moment(params.endDate))) {
             isMatch = false;
         }

        return isMatch;
    });

   // 模拟分页 (根据当前页和每页条数截取数据)
   const startIndex = (params.page - 1) * params.pageSize;
   const endIndex = startIndex + params.pageSize;
   const paginatedList = filteredList.slice(startIndex, endIndex);


  return {
      code: 0,
      msg: '成功',
      data: {
          list: paginatedList,
          total: filteredList.length, // 模拟过滤后的总条数
      }
  };
};


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

  // 获取订单列表数据
  const getOrderData = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current, // 使用当前分页状态的页码
        pageSize: pagination.pageSize, // 使用当前分页状态的每页条数
        ...filters, // 合并过滤条件
      };
      const res = await fetchOrderList(params);

      if (res && res.code === 0) {
        const dataWithKeys = res.data.list.map(item => ({ ...item, key: item.id }));
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
    getOrderData({ page: 1, pageSize: pagination.pageSize });
  }, []); // 空依赖数组表示只在挂载时执行一次

  // 处理搜索表单提交
  const onSearch = (values) => {
    console.log('搜索条件:', values);
    const startDate = values.dateRange ? moment(values.dateRange[0]).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const endDate = values.dateRange ? moment(values.dateRange[1]).format('YYYY-MM-DD HH:mm:ss') : undefined;

    // 在搜索时，重置分页到第一页
    setPagination(prev => ({ ...prev, current: 1 }));

    // 调用获取数据函数，带上过滤条件和重置后的分页参数 (current: 1)
    // 注意：这里直接调用 getOrderData，它会使用 state 中最新的 pagination.current (已经被设置为 1)
     getOrderData({
       orderNumber: values.orderNumber,
       recipient: values.recipient,
       phoneNumber: values.phoneNumber,
       orderStatus: values.orderStatus,
       startDate,
       endDate,
     });

    // 如果您想确保在 setPagination 后立即使用更新后的 state 调用 getOrderData，
    // 可以考虑使用 useEffect 监听 pagination.current 的变化来触发数据获取，
    // 或者在 setPagination 的回调中调用 getOrderData，但那样会使逻辑复杂。
    // 当前的实现（先设置 state，再调用 getOrderData）在大多数情况下也能工作，
    // 因为 state 更新是异步的，但 getOrderData 可能会在 state 更新完成前执行。
    // 一个更保险的方法是在 setPagination 后，将新的 page 和 pageSize 作为参数直接传给 getOrderData。
    // 例如:
    // setPagination(prev => {
    //    const newPagination = { ...prev, current: 1 };
    //    getOrderData({
    //      page: newPagination.current,
    //      pageSize: newPagination.pageSize,
    //      ...filters // current filters
    //    });
    //    return newPagination;
    // });
    // 为了简洁，我们暂时保留当前写法，但请注意异步性。
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
       const startDate = currentFilters.dateRange ? moment(currentFilters.dateRange[0]).format('YYYY-MM-DD HH:mm:ss') : undefined;
       const endDate = currentFilters.dateRange ? moment(currentFilters.dateRange[1]).format('YYYY-MM-DD HH:mm:ss') : undefined;

       // 重新获取数据，带上新的分页参数和当前的过滤条件
       // 注意：这里直接将新的 page 和 pageSize 传递给 getOrderData，
       // 避免依赖异步更新的 pagination state
       getOrderData({
           page: page,
           pageSize: pageSize,
           orderNumber: currentFilters.orderNumber,
           recipient: currentFilters.recipient,
           phoneNumber: currentFilters.phoneNumber,
           orderStatus: currentFilters.orderStatus,
           startDate,
           endDate,
       });
   };


  // 处理查看操作
  const handleView = (record) => {
    console.log('查看订单:', record);
    // TODO: 跳转到订单详情页，例如 /order/detail/:id
    // navigate(`/order/detail/${record.id}`);
    message.info(`查看订单 ID: ${record.id}`);
  };

  // 处理编辑操作
  const handleEdit = (record) => {
    console.log('编辑订单:', record);
    // TODO: 跳转到订单编辑页，例如 /order/edit/:id
    // navigate(`/order/edit/${record.id}`);
    message.info(`编辑订单 ID: ${record.id}`);
  };


  // 定义表格列
  const columns = [
    { title: '订单号', dataIndex: 'id', key: 'id', },
    { title: '下单时间', dataIndex: 'orderTime', key: 'orderTime', render: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-', },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone', },
    { title: '收货人', dataIndex: 'recipient', key: 'recipient', },
    { title: '送货地址', dataIndex: 'deliveryAddress', key: 'deliveryAddress', },
    { title: '送达时间', dataIndex: 'deliveryTime', key: 'deliveryTime', render: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-', },
    { title: '备注', dataIndex: 'remarks', key: 'remarks', },
    { title: '订单金额', dataIndex: 'orderAmount', key: 'orderAmount', render: (text) => `¥${text !== undefined ? text.toFixed(2) : '-'}`, }, // 格式化金额，处理 undefined
    { title: '订单状态', dataIndex: 'orderStatus', key: 'orderStatus', },
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
    </div>
  );
};

export default OrderList;
