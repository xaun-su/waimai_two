import React, { useState, useEffect, useCallback } from 'react';
// 引入 Modal, Form, Input, Select 组件
import { Space, Table, message, Modal, Form, Input, Select } from 'antd';
import Pagination from '../../components/Pagination';
import Title from '../../components/Title';
// 导入 deleteAccount 和 updateAccount (假设您有一个用于更新账号的API函数)
import { account_list, deleteAccount, updateAccount } from '../../api/account';
import '@ant-design/v5-patch-for-react-19';
import request from '../../utils/request';

const App = () => {
  const [data, setData] = useState([]); // 设置数据状态
  const [currentPage, setCurrentPage] = useState(1); // 当前页数
  const [pageSize, setPageSize] = useState(5); // 每页显示的数量
  const [total, setTotal] = useState(0); // 数据总条数
  const [loading, setLoading] = useState(false); // 添加加载状态，用于Table的loading

  // *** 新增状态用于控制编辑模态框的显示和存储当前编辑的账号信息 ***
  const [isModalVisible, setIsModalVisible] = useState(false); // 控制模态框显示/隐藏
  const [editingAccount, setEditingAccount] = useState(null); // 存储当前正在编辑的账号数据

  // *** 使用 Ant Design 的 Form hook 来管理表单状态 ***
  const [form] = Form.useForm();

  // 表格列定义
  const columns = [
    {
      title: '账号', // 列标题
      dataIndex: 'account', // 数据字段名
      key: 'account', // 唯一标识
      render: text => <a>{text}</a>, // 渲染方式，显示为链接
    },
    {
      title: '用户组',
      dataIndex: 'userGroup',
      key: 'userGroup',
    },
    {
      title: '创建时间',
      dataIndex: 'ctime',
      key: 'ctime',
    },
    {
      title: '操作',
      key: 'action', // 操作列
      render: (_, record) => ( // 渲染操作内容
        <Space size="middle">
          {/* *** 修改 "编辑" 链接，添加点击事件，调用 handleEditUser 函数 *** */}
          <a onClick={() => handleEditUser(record)}>编辑</a>
          {/* 确保 record 中有用于删除的唯一标识，这里假设是 record.id */}
          <a onClick={() => handleDeleteUser(record.id)}>删除</a>
        </Space>
      ),
    },
  ];

  // **将 fetchData 函数定义在组件作用域内，并使用 useCallback 包装**
  const fetchData = useCallback(async () => {
    setLoading(true); // 开始加载
    try {
      const res = await request.get(
        `${account_list}?currentPage=${currentPage}&pageSize=${pageSize}`
      );
      console.log(res.data);

      // 并且 data 数组中的每个对象都有一个唯一的 id 字段用于标识
      setData(res.data.data); // 更新表格数据
      setTotal(res.data.total); // 更新总条数
      message.success('数据加载成功!'); // 显示成功提示

    } catch (error) {
      console.error('数据加载失败:', error); // 捕获和处理请求失败的错误
      message.error('数据加载失败!'); // 显示失败提示

    } finally {
      setLoading(false); // 结束加载
    }
  }, [currentPage, pageSize, request, account_list]); // useCallback 的依赖项

  // 使用 useEffect 在组件挂载和分页参数变化时调用 fetchData
  useEffect(() => {
    fetchData(); // 调用获取数据的函数
  }, [fetchData]); // useEffect 的依赖是 fetchData 函数本身

  // 分页变化的回调函数，更新页码和每页显示条数
  const handlePageChange = (page, size) => {
    setCurrentPage(page); // 设置当前页码
    setPageSize(size); // 设置每页显示条数
    // 当 currentPage 或 pageSize 变化时，useEffect 会自动触发 fetchData
  };

  // 删除用户的函数
  const handleDeleteUser = async (id) => {
    console.log('删除用户', id);
    try {
      // 调用删除接口
      await deleteAccount(id);
      message.success('删除成功');
      // 删除成功后重新获取当前页的数据
      fetchData();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // *** 新增函数：处理点击编辑按钮 ***
  const handleEditUser = (record) => {
    console.log('编辑用户：', record);
    
    setEditingAccount(record); // 将当前行的账号数据存入 state
    setIsModalVisible(true); // 显示模态框
    // 使用 form.setFieldsValue 方法设置表单的初始值
    form.setFieldsValue({
      id: record.id,
      account: record.account,
      userGroup: record.userGroup,
    });
  };

  // *** 新增函数：处理模态框的确认按钮点击 ***
  const handleModalOk = async () => {
    try {
      // 验证表单字段并获取值
      const values = await form.validateFields();
      console.log('Updated values:', values);

      // *** 调用更新账号的 API ***
      // 假设 updateAccount 函数接收账号 id 和更新后的数据
      await updateAccount({
        id: form.getFieldValue('id'),
        ...values,
      });

      message.success('更新成功');
      setIsModalVisible(false); // 关闭模态框
      setEditingAccount(null); // 清空编辑状态
      form.resetFields(); // 重置表单字段
      fetchData(); // 重新获取数据刷新列表

    } catch (error) {
      console.error('更新失败:', error);
      message.error('更新失败');
    }
  };

  // *** 新增函数：处理模态框的取消按钮点击或关闭 ***
  const handleModalCancel = () => {
    setIsModalVisible(false); // 关闭模态框
    setEditingAccount(null); // 清空编辑状态
    form.resetFields(); // 重置表单字段
  };

  // 用户组选项
  const userGroupOptions = [
    { value: '超级管理员', label: '超级管理员' },
    { value: '普通用户', label: '普通用户' },
  ];


  return (
    <div>
      <Title left={'账号列表'} />
      {/* 表格展示，添加 loading 属性 */}
      <Table
        columns={columns} // 表格列
        dataSource={data} // 分页后的数据
        rowKey="id" // *** 确保使用数据中唯一的标识字段作为 rowKey，这里假设是 'id' ***
        pagination={false} // 禁用内置分页，使用自定义分页
        loading={loading} // 显示加载状态
      />
      {/* 分页组件 */}
      <Pagination
        total={total} // 数据总条数
        current={currentPage} // 当前页码
        pageSize={pageSize} // 每页条数
        onChange={handlePageChange} // 分页变化的回调
        showSizeChanger // 显示选择每页条数的控件
        showQuickJumper // 显示快速跳转到页码的控件
        pageSizeOptions={['5', '10', '15', '20']} // 可选的每页条数
        showTotal={(total) => `Total ${total} items`} // 显示数据总条数
      />

      {/* *** 新增：编辑账号信息的模态框 *** */}
      <Modal
        title="修改账号信息" // 模态框标题，与图片一致
        visible={isModalVisible} // 控制显示/隐藏
        onOk={handleModalOk} // 点击确认按钮的回调
        onCancel={handleModalCancel} // 点击取消按钮或关闭的回调
        destroyOnClose={true} // 可选：关闭时销毁子元素，确保每次打开表单是新的
      >
        {/* *** 模态框内的表单 *** */}
        <Form
          form={form} // 绑定 form 实例
          layout="vertical" // 表单布局，可选 'horizontal', 'inline'
          name="edit_account_form" // 表单名称
        >
          <Form.Item
            name="account" // 字段名，对应数据中的 key
            label="账号名" // 标签文本，与图片一致
            rules={[{ required: true, message: '请输入账号名!' }]} // 添加验证规则
          >
            <Input /> {/* 输入框 */}
          </Form.Item>
          <Form.Item
            name="userGroup" // 字段名
            label="用户组" // 标签文本
            rules={[{ required: true, message: '请选择用户组!' }]} // 添加验证规则
          >
             {/* 使用 Select 组件作为用户组选择器 */}
             <Select options={userGroupOptions} />
  
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;
