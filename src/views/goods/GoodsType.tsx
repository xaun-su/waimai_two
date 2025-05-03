import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Switch,
  Modal,
  Form,
  Input,
  message,
  InputNumber
} from 'antd';
// 导入 ColumnType 和 ColumnGroupType 以便在 mergedColumns 中进行类型检查
import { ColumnsType, ColumnType } from 'antd/es/table';
import Title from '../../components/Title';
import Pagination from '../../components/Pagination';
import {
  getGoodsCategoryList,
  addGoodsCategory,
  updateGoodsCategory,
  deleteGoodsCategory,
} from '../../api/goods';

// 定义商品分类的数据结构
interface GoodsCategory {
  id: number;
  cateName: string;
  state: number | boolean; // 后端返回 state 是 number (0 或 1)
  key: React.Key; // Table 组件需要的唯一 key
}

// 定义可编辑单元格的 props
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: keyof GoodsCategory;
  title: string; // 假设 title 总是 string
  inputType: 'text' | 'number' | 'switch';
  record: GoodsCategory;
  index: number; // index 属性在 EditableCell 中似乎没有使用，如果不需要可以移除
  children: React.ReactNode; // Table 会将单元格的原始内容作为 children 传递
}

// 可编辑单元格组件
const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  // index, // 如果 index 未使用，可以从 props 中移除
  children,
  ...restProps // 接收其他 HTML 属性，如 className, style 等
}) => {
  let inputNode: React.ReactNode;
  // 根据 inputType 渲染不同的输入控件
  if (inputType === 'number') {
    inputNode = <InputNumber style={{ width: '100%' }} />;
  } else if (inputType === 'switch') {
    inputNode = <Switch />;
  } else {
    inputNode = <Input />;
  }

  // 根据 inputType 设置 Form.Item 的 valuePropName
  const valuePropName = inputType === 'switch' ? 'checked' : 'value';
  // 根据 inputType 设置 Form.Item 的验证规则
  const requiredRule =
    inputType !== 'switch'
      ? [{ required: true, message: `请输入${title}!` }]
      : [];

  return (
    // 将剩余的 HTML 属性应用到 td 元素上
    <td {...restProps}>
      {editing ? (
        // 编辑状态下，渲染 Form.Item 包裹的输入控件
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={requiredRule}
          valuePropName={valuePropName}
          // initialValue 在这里设置可能导致问题，应该在 form.setFieldsValue 中设置
          // initialValue={record[dataIndex]} // 移除或谨慎使用，由 form.setFieldsValue 负责填充初始值
        >
          {inputNode}
        </Form.Item>
      ) : (
        // 非编辑状态下，渲染原始的单元格内容 (children)
        children
      )}
    </td>
  );
};

// 定义添加分类模态框表单的值类型
interface AddCategoryFormValues {
  cateName: string;
  state: boolean; // 表单中 state 是 boolean
}

const GoodsType: React.FC = () => {
  // 用于编辑行的 Form 实例
  const [form] = Form.useForm<GoodsCategory>();
  // 用于添加分类模态框的 Form 实例
  const [addCategoryForm] = Form.useForm<AddCategoryFormValues>();

  // 状态变量
  const [data, setData] = useState<GoodsCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingKey, setEditingKey] = useState<React.Key>(''); // 当前正在编辑行的 key
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // 添加分类模态框的可见性
  // 分页状态
  const [pagination, setPagination] = useState<{
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger: boolean;
    pageSizeOptions: string[];
    showTotal: (total: number) => string;
  }>({
    current: 1,
    pageSize: 5,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
    showTotal: (total) => `共 ${total} 条`,
  });

  // 判断当前记录是否处于编辑状态
  const isEditing = (record: GoodsCategory): boolean => record.key === editingKey;

  // 获取商品分类列表数据
  const fetchCategories = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const result: any = await getGoodsCategoryList(`?currentPage=${page}&pageSize=${pageSize}`);
      console.log('获取商品分类数据', result);

      if (result && result.data && result.data.code === 0) {
        // 格式化数据，将 id 作为 key，确保 state 是 number (0 或 1)
        const formattedData: GoodsCategory[] = result.data.data.map((item: any) => ({
          ...item,
          key: item.id, // 使用 id 作为 key
          state: item.state === 1 ? 1 : 0, // 确保 state 是 0 或 1
        }));
        setData(formattedData);
        // 更新分页状态
        setPagination((prev) => ({ ...prev, total: result.data.total, current: page, pageSize: pageSize }));
      } else {
        message.error(result?.message || '获取分类列表失败');
        setData([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      message.error('请求分类列表失败');
      setData([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载和分页状态改变时触发数据获取
  useEffect(() => {
    fetchCategories(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]); // 依赖项正确

  // 进入编辑状态
  const edit = (record: GoodsCategory) => {
    // 使用 form.setFieldsValue 填充表单初始值
    // *** 修改点：正确转换 state 为 boolean 填充到表单，因为 Switch 期望 boolean ***
    form.setFieldsValue({
      ...record,
      state: record.state === 1, // 将后端返回的 0/1 转换为 boolean (false/true)
    });
    setEditingKey(record.key); // 设置当前编辑行的 key
  };

  // 取消编辑状态
  const cancelEdit = () => {
    setEditingKey('');
  };

  // 保存编辑行的修改
  const save = async (key: React.Key) => {
    try {
      // 验证表单字段，获取编辑后的值
      const row = await form.validateFields();
      // row.state 现在是 boolean (来自 Switch)

      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        // 构建要发送给后端的数据，将 state boolean 转换回 number (0/1)
        const updatedItemToSend = {
          id: typeof key === 'number' ? key : Number(key), // 确保 id 是 number
          cateName: row.cateName,
          state: row.state ? 1 : 0, // 将 boolean 转换回 1/0
        };

        // 调用更新分类 API
        const updateResult: any = await updateGoodsCategory(updatedItemToSend);

        // 假设更新成功后后端返回 data.code === 0
        if (updateResult && updateResult.data && updateResult.data.code === 0) {
           // 更新前端数据，使用后端返回的或本地构建的正确格式 (state 为 number 0/1)
           const updatedItemInState = {
             ...item, // 保留原有 id, key 等
             cateName: row.cateName,
             state: row.state ? 1 : 0, // 更新 state 为 number (0/1)
           };
          newData.splice(index, 1, updatedItemInState); // 更新 data 数组中的对应项
          setData(newData);
          message.success('分类更新成功');
          setEditingKey(''); // 退出编辑状态
        } else {
          message.error(updateResult?.message || '分类更新失败');
          // 更新失败时，可能需要重新获取数据以保证数据一致性
          fetchCategories(pagination.current, pagination.pageSize);
        }
      } else {
        message.warning('未找到对应分类，尝试刷新');
        setEditingKey('');
        fetchCategories(pagination.current, pagination.pageSize);
      }
    } catch (errInfo:any) {
      console.error('Validate Failed:', errInfo);
      // 如果是字段验证错误，错误信息已经在表单字段旁显示
      // 对于其他错误，显示通用错误
      if (!errInfo.errorFields) {
         message.error('保存失败，请检查输入或稍后再试');
      }
    }
  };

  // 删除分类
  const deleteCategory = async (key: React.Key) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分类吗？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 调用删除分类 API
          const deleteResult: any = await deleteGoodsCategory(typeof key === 'number' ? key : Number(key));

          // 假设删除成功后后端返回 status 200 或 data.code 0
          if (deleteResult && (deleteResult.status === 200 || (deleteResult.data && deleteResult.data.code === 0))) {
            message.success('分类删除成功');

            // 计算新的总数
            const newTotal = pagination.total > 0 ? pagination.total - 1 : 0;

            // 如果当前页只有一条数据且不是第一页，删除后跳到上一页
            if (data.length === 1 && pagination.current > 1) {
               fetchCategories(pagination.current - 1, pagination.pageSize);
            } else {
               // 否则，在当前页过滤掉被删除的数据
               const newData = data.filter((item) => item.key !== key);
               setData(newData);
               // 更新总数
               setPagination((prev) => ({ ...prev, total: newTotal }));
               // 删除当前页的最后一条后，如果总数减少导致当前页超出范围，也会自动触发分页组件的 onChange
            }

          } else {
            message.error(deleteResult?.message || '分类删除失败');
          }
        } catch (error) {
          console.error('Failed to delete category:', error);
          message.error('请求删除分类失败');
        }
      },
    });
  };

  // 显示添加分类模态框
  const showAddModal = () => {
    setIsModalVisible(true);
    addCategoryForm.resetFields(); // 打开模态框时重置表单
  };

  // 处理添加分类模态框的确定按钮点击
  const handleAddModalOk = async () => {
    setLoading(true); // 添加加载状态
    try {
      // 验证模态框表单字段
      const values = await addCategoryForm.validateFields();
      // values.state 是 boolean (来自 Switch)

      // 构建要发送给后端的数据，将 state boolean 转换回 number (0/1)
      const categoryDataToSend = {
        cateName: values.cateName,
        state: values.state ? 1 : 0, // 转换 boolean 为 number
      };

      // 调用添加分类 API
      const addResult: any = await addGoodsCategory(categoryDataToSend);

       // 假设添加成功后后端返回 status 200 或 data.code 0
      if (addResult && (addResult.status === 200 || (addResult.data && addResult.data.code === 0))) {
        message.success('分类添加成功');
        setIsModalVisible(false);
        // 添加成功后，重新获取第一页数据以显示新添加的分类
        fetchCategories(1, pagination.pageSize);
      } else {
        message.error(addResult?.message || '分类添加失败');
      }
    } catch (error:any) {
      console.error('Failed to add category:', error);
       // 如果是字段验证错误，错误信息已经在表单字段旁显示
      // 对于其他错误，显示通用错误
      if (!error.errorFields) {
         message.error('添加失败，请检查输入或稍后再试');
      }
    } finally {
      setLoading(false); // 移除加载状态
    }
  };

  // 处理添加分类模态框的取消按钮点击
  const handleAddModalCancel = () => {
    setIsModalVisible(false);
    addCategoryForm.resetFields(); // 关闭模态框时重置表单
  };

  // 定义表格列
  const columns: ColumnsType<GoodsCategory> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      // *** 修改点：序号列的 render 函数只返回文本，不应用 EditableCell ***
      render: (text) => text,
    },
    {
      title: '分类名',
      dataIndex: 'cateName',
      key: 'cateName',
      width: '30%',
      // *** 修改点：分类名列的 render 函数只返回文本，EditableCell 通过 onCell 应用 ***
      render: (text) => text,
    },
    {
      title: '是否启用',
      dataIndex: 'state',
      key: 'state',
      width: '15%',
      // *** 修改点：状态列的 render 函数只返回非编辑状态的 Switch，EditableCell 通过 onCell 应用 ***
      render: (state) => <Switch checked={state === 1} disabled={true} />,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: '20%',
      render: (_, record) => {
        const isEditable = isEditing(record);
        return isEditable ? (
          // 编辑状态下显示 完成/取消 按钮
          <Space size="middle">
            <Button type="link" onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              完成
            </Button>
            <Button type="link" onClick={cancelEdit}>
              取消
            </Button>
          </Space>
        ) : (
          // 非编辑状态下显示 编辑/删除 按钮
          <Space size="middle">
            <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record)}>
              编辑
            </Button>
            <Button
              type="link"
              danger
              onClick={() => deleteCategory(record.key)}
              disabled={editingKey !== ''}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  // 定义 Table 组件使用的 components，将 EditableCell 应用到 body.cell
  const components = {
    body: {
      cell: EditableCell,
    },
  };

  // 合并 columns 并为需要编辑的列添加 onCell 属性
  const mergedColumns = columns.map((col) => {
    // 检查当前列是否是需要编辑的列 (根据 dataIndex)
    // 并且确保 col 是一个普通列 (有 dataIndex 属性且 dataIndex 有值)，排除列组
    if (('dataIndex' in col) && col.dataIndex && (col.dataIndex === 'cateName' || col.dataIndex === 'state')) {
      return {
        ...col,
        onCell: (record: GoodsCategory) => ({
          record,
          // 根据 dataIndex 确定 inputType
          inputType: col.dataIndex === 'cateName' ? 'text' : 'switch',
          dataIndex: col.dataIndex,
          // 确保 title 是 string 类型，如果 col.title 是 ReactNode 或 function 需要处理
          title: col.title as string, // 类型断言为 string
          editing: isEditing(record), // 传递 editing 状态
          // children 会由 Table 组件自动传递
        }),
      } as ColumnType<GoodsCategory>; // 断言返回类型为普通列类型
    }
    // 对于不需要编辑的列，直接返回原始列定义
    return col;
  });


  return (
    <div style={{ padding: '20px' }}>
      <Title
        left="商品分类"
        right={
          <Button type="primary" onClick={showAddModal}>
            添加分类
          </Button>
        }
        // 如果 Title 组件的 props 定义不包含 className，这里可能会报错
        // 如果需要 className，请检查并修改 TitleProps 类型定义
        // className="your-title-class" // 示例：如果 Title 支持 className
      />

      {/* Form 组件包裹 Table，用于处理可编辑行的表单 */}
      <Form form={form} component={false}>
        <Table
          components={components} // 应用自定义的可编辑单元格组件
          bordered // 显示边框
          dataSource={data} // 表格数据源
          columns={mergedColumns as ColumnsType<GoodsCategory>} // 应用合并后的列定义，断言类型
          rowClassName={(record) => (isEditing(record) ? 'editable-row' : '')} // 根据编辑状态添加 class
          loading={loading} // 显示加载状态
          pagination={false} // 关闭 Table 内置分页，使用自定义分页
          rowKey="id" // 使用 id 作为 rowKey，提高性能和稳定性
        />
      </Form>

      {/* 将 style 应用到包裹 Pagination 的 div，解决 style 属性的类型错误 */}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Pagination
        showQuickJumper={false} {...pagination} // 传递分页状态
        onChange={(page, pageSize) => {
          // 如果有正在编辑的行，阻止分页跳转
          if (editingKey !== '') {
            message.warning('请先完成或取消当前行的编辑');
            return;
          }
          // 只有当页码或每页条数实际改变时才更新状态并触发数据获取
          if (page !== pagination.current || pageSize !== pagination.pageSize) {
            setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
          }
        } }        />
      </div>

      {/* 添加商品分类模态框 */}
      <Modal
        title="添加商品分类"
        visible={isModalVisible} // 控制模态框可见性
        onOk={handleAddModalOk} // 确定按钮回调
        onCancel={handleAddModalCancel} // 取消按钮回调
        destroyOnClose={true} // 关闭时销毁子组件，避免表单状态残留
        confirmLoading={loading} // 确定按钮加载状态
      >
        {/* 添加分类的表单 */}
        <Form
          form={addCategoryForm} // 使用添加分类的 Form 实例
          layout="vertical" // 垂直布局
          name="addCategoryForm" // 表单名称
          initialValues={{ state: true }} // 添加分类时默认启用
        >
          <Form.Item
            name="cateName"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称!' }]} // 验证规则
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item label="是否启用" name="state" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GoodsType;
