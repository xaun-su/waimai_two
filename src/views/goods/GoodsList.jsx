import React, { useState, useEffect } from 'react';
import { Table, Button, Space,  Modal,message } from 'antd'; // 导入 Button, Space, message
import Title from '../../components/Title';
import Pagination from '../../components/Pagination'; // 假设这是你自己的 Pagination 组件
import { getGoodsList,deleteGoods } from '../../api/goods'; // 导入商品列表 API
import { baseURL} from '../../api/config';
import { useNavigate } from 'react-router-dom';


const GoodsList = () => {
  // 将状态变量移到组件内部
  const [data, setData] = useState([]); // 用于存储当前页的数据
  const [total, setTotal] = useState(0); // 用于存储数据总条数
  const [currentPage, setCurrentPage] = useState(1); // 当前页码，默认为 1
  const [pageSize, setPageSize] = useState(5); // 每页条数，默认为 10
  const [loading, setLoading] = useState(false); // 加载状态
  const navigate = useNavigate();

  // 模拟数据获取函数 (在真实应用中替换为 API 调用)
  const fetchGoodsList = async (page, size) => {
    setLoading(true);
    console.log(`Fetching goods data for page ${page} with pageSize ${size}`);
    const res=await getGoodsList(`?currentPage=${page}&pageSize=${size}`);
    console.log(res);
    if(res.data.code===0){
      res.data.data.forEach((item)=>{
        item.ctime=item.ctime.substring(0,10);
        item.imgUrl=baseURL+item.imgUrl;
      })
      setData(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
      message.success('数据加载成功!');
    }else{
      message.error('数据加载失败!');

    }
  };

  // useEffect Hook，在组件挂载和 currentPage 或 pageSize 变化时触发数据获取
  useEffect(() => {
    fetchGoodsList(currentPage, pageSize);
  }, [currentPage, pageSize]); // 依赖 currentPage 和 pageSize

  // 分页变化处理函数
  const handlePageChange = (page, size) => {
    console.log('Pagination changed:', page, size);
    // 更新分页状态，useEffect 会自动触发数据获取
    setCurrentPage(page);
    setPageSize(size);
  };

  // 处理编辑按钮点击 (占位函数)
  const handleEdit = (record) => {
    console.log('Edit clicked for record:', record);
    navigate(`/goodsEdit/${record.id}`); // <-- 实现跳转逻辑
  };

  // 处理删除按钮点击 (占位函数)
  const handleDelete = (record) => {
     console.log('Delete clicked for record:', record);
     message.info(`点击了删除按钮，商品ID: ${record.id}`);
     Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分类吗？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const res=await deleteGoods(record.id);
          console.log(res);
        if(res.data.code===0){
            message.success('删除成功!');
            fetchGoodsList(currentPage, pageSize);
          }else{
            message.error('删除失败!');
          }     
      },
    });
  };


  // 表格列配置，匹配图片中的列
  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: '商品分类',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
    },
    {
      title: '商品价格',
      dataIndex: 'price',
      key: 'price',
      width: '10%',
    },
    {
      title: '商品图片',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
      width: '10%',
      render: (text, record) => (
        // 使用 img 标签显示图片，text 就是 goodsImage 的值 (图片 URL)
        // 可以添加一些样式控制图片大小
        <img src={text} alt={record.goodsName} style={{ width: 50, height: 50, objectFit: 'cover' }} />
      ),
    },
    {
      title: '商品描述',
      dataIndex: 'goodsDesc',
      key: 'goodsDesc',
      width: '25%',
      // 如果描述可能很长，可以考虑截断或只在展开行显示
      // render: text => <span>{text.length > 50 ? text.substring(0, 50) + '...' : text}</span>
    },
    {
      title: '操作',
      key: 'operation',
      width: '20%',
      render: (_, record) => ( // 使用 _ 忽略第一个参数
        <Space size="middle">
          {/* 编辑按钮 */}
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          {/* 删除按钮 */}
          <Button type="link" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];


  return (
    <div style={{ padding: '20px' }}>
      <Title left={'商品列表'} />
      <Table
        columns={columns}
        // 使用从状态获取的数据
        dataSource={data}
        // 添加 loading 状态
        loading={loading}
        // Table 内部不处理分页，使用外部 Pagination
        pagination={false}
        // 指定行的 key
        rowKey="id" // 确保数据中有 id 字段作为唯一 key
        // 配置可展开行
        expandable={{
          // 展开后渲染的内容，显示商品描述

          expandedRowRender: record => <div><p style={{ margin: 0 }}>商品ID: {record.id}</p>
          <p style={{ margin: 0 }}>商品名称: {record.name}</p> </div>,
          // 移除 rowExpandable 条件，让所有行都可展开
          // rowExpandable: record => record.name !== 'Not Expandable',
        }}
        bordered // 添加边框，使表格更清晰
      />
      {/* 使用你自己的 Pagination 组件 */}
      <Pagination
        style={{ marginTop: 16, textAlign: 'right' }}
        total={total} // 绑定总条数状态
        current={currentPage} // 绑定当前页码状态
        pageSize={pageSize} // 绑定每页条数状态
        onChange={handlePageChange} // 绑定分页变化处理函数
        showSizeChanger // 显示选择每页条数的控件
        showQuickJumper // 显示快速跳转到页码的控件
        pageSizeOptions={['5', '10', '20', '50']} // 可选的每页条数
        showTotal={(total) => `共 ${total} 条`} // 显示数据总条数
      />
    </div>
  );
};

export default GoodsList;
