import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Title from '../../components/Title';
import Pagination from '../../components/Pagination';
import { getGoodsList, deleteGoods } from '../../api/goods';
import { baseURL } from '../../api/config';
import { useNavigate } from 'react-router-dom';

interface Goods {
 id: number;
 name: string;
 category: string;
 price: number;
 imgUrl: string;
 goodsDesc: string;
 ctime: string;
}

const GoodsList: React.FC = () => {
 const [data, setData] = useState<Goods[]>([]);
 const [total, setTotal] = useState<number>(0);
 const [currentPage, setCurrentPage] = useState<number>(1);
 const [pageSize, setPageSize] = useState<number>(5);
 const [loading, setLoading] = useState<boolean>(false);
 const navigate = useNavigate();

 const fetchGoodsList = async (page: number, size: number) => {
   setLoading(true);
   console.log(`Fetching goods data for page ${page} with pageSize ${size}`);
   try {
     const res: any = await getGoodsList(`?currentPage=${page}&pageSize=${size}`);
     console.log(res);
     if (res.data.code === 0) {
       const formattedData = res.data.data.map((item: any) => ({
         ...item,
         ctime: item.ctime.substring(0, 10),
         imgUrl: baseURL + item.imgUrl,
       }));
       setData(formattedData);
       setTotal(res.data.total);
       setLoading(false);
       message.success('数据加载成功!');
     } else {
       message.error('数据加载失败!');
       setLoading(false);
     }
   } catch (error) {
     console.error('Error fetching goods list:', error);
     message.error('数据加载失败!');
     setLoading(false);
   }
 };

 useEffect(() => {
   fetchGoodsList(currentPage, pageSize);
 }, [currentPage, pageSize]);

 const handlePageChange = (page: number, size: number) => {
   console.log('Pagination changed:', page, size);
   setCurrentPage(page);
   setPageSize(size);
 };

 const handleEdit = (record: Goods) => {
   console.log('Edit clicked for record:', record);
   navigate(`/goodsEdit/${record.id}`);
 };

 const handleDelete = (record: Goods) => {
   console.log('Delete clicked for record:', record);
   message.info(`点击了删除按钮，商品ID: ${record.id}`);
   Modal.confirm({
     title: '确认删除',
     content: '确定要删除这个商品吗？',
     okText: '确定',
     okType: 'danger',
     cancelText: '取消',
     onOk: async () => {
       try {
         const res: any = await deleteGoods(record.id);
         console.log(res);
         if (res.data.code === 0) {
           message.success('删除成功!');
           fetchGoodsList(currentPage, pageSize);
         } else {
           message.error('删除失败!');
         }
       } catch (error) {
         console.error('Error deleting goods:', error);
         message.error('删除失败!');
       }
     },
   });
 };

 const columns: ColumnsType<Goods> = [
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
       <img src={text} alt={record.name} style={{ width: 50, height: 50, objectFit: 'cover' }} />
     ),
   },
   {
     title: '商品描述',
     dataIndex: 'goodsDesc',
     key: 'goodsDesc',
     width: '25%',
   },
   {
     title: '操作',
     key: 'operation',
     width: '20%',
     render: (_, record) => (
       <Space size="middle">
         <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
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
       dataSource={data}
       loading={loading}
       pagination={false}
       rowKey="id"
       expandable={{
         expandedRowRender: record => (
           <div>
             <p style={{ margin: 0 }}>商品ID: {record.id}</p>
             <p style={{ margin: 0 }}>商品名称: {record.name}</p>
           </div>
         ),
       }}
       bordered
     />
     <Pagination
       style={{ marginTop: 16, textAlign: 'right' }}
       total={total}
       current={currentPage}
       pageSize={pageSize}
       onChange={handlePageChange}
       showSizeChanger
       showQuickJumper
       pageSizeOptions={['5', '10', '20', '50']}
       showTotal={(total) => `共 ${total} 条`}
     />
   </div>
 );
};

export default GoodsList;
