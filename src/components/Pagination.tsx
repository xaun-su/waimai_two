import React from 'react';
import { Pagination as AntdPagination } from 'antd';

// 定义组件的属性类型
interface PaginationProps {
  total: number;  // 数据总条数
  current: number;  // 当前页码
  pageSize: number;  // 每页显示的条数
  onChange: (page: number, pageSize: number) => void;  // 分页变化时的回调函数
  showSizeChanger: boolean;  // 是否显示选择每页条数的控件
  showQuickJumper: boolean;  // 是否显示快速跳转到页码的控件
  pageSizeOptions: string[];  // 可选的每页条数
  showTotal: (total: number) => string;  // 总条数的显示格式
}

const Pagination: React.FC<PaginationProps> = ({
  total,
  current,
  pageSize,
  onChange,
  showSizeChanger,
  showQuickJumper,
  pageSizeOptions,
  showTotal
}) => {
  return (
    <AntdPagination
      total={total}  // 数据总条数
      current={current}  // 当前页码
      pageSize={pageSize}  // 每页条数
      onChange={onChange}  // 分页变化时的回调
      showSizeChanger={showSizeChanger}  // 是否显示每页条数选择控件
      showQuickJumper={showQuickJumper}  // 是否显示快速跳转到页码的控件
      pageSizeOptions={pageSizeOptions}  // 每页条数的选项
      showTotal={showTotal}  // 显示总条数的格式
    />
  );
};

export default Pagination;
