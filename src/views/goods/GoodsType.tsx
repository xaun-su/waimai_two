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
import { ColumnsType } from 'antd/es/table';
import Title from '../../components/Title';
import Pagination from '../../components/Pagination';
import {
  getGoodsCategoryList,
  addGoodsCategory,
  updateGoodsCategory,
  deleteGoodsCategory,
} from '../../api/goods';

interface GoodsCategory {
  id: number;
  cateName: string;
  state: number;
  key: React.Key;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: keyof GoodsCategory;
  title: string;
  inputType: 'text' | 'number' | 'switch';
  record: GoodsCategory;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  let inputNode: React.ReactNode;
  if (inputType === 'number') {
    inputNode = <InputNumber style={{ width: '100%' }} />;
  } else if (inputType === 'switch') {
    inputNode = <Switch />;
  } else {
    inputNode = <Input />;
  }

  const valuePropName = inputType === 'switch' ? 'checked' : 'value';
  const requiredRule =
    inputType !== 'switch'
      ? [{ required: true, message: `请输入${title}!` }]
      : [];

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={requiredRule}
          valuePropName={valuePropName}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

interface AddCategoryFormValues {
  cateName: string;
  state: boolean;
}

const GoodsType: React.FC = () => {
  const [form] = Form.useForm<GoodsCategory>();
  const [addCategoryForm] = Form.useForm<AddCategoryFormValues>();

  const [data, setData] = useState<GoodsCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingKey, setEditingKey] = useState<React.Key>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
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

  const isEditing = (record: GoodsCategory): boolean => record.key === editingKey;

  const fetchCategories = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const result: any = await getGoodsCategoryList(`?currentPage=${page}&pageSize=${pageSize}`);
      console.log('获取商品分类数据', result);

      if (result && result.data && result.data.code === 0) {
        const formattedData: GoodsCategory[] = result.data.data.map((item: any) => ({
          ...item,
          key: item.id,
        }));
        setData(formattedData);
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

  useEffect(() => {
    fetchCategories(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const edit = (record: GoodsCategory) => {
    form.setFieldsValue({
      ...record,
      state: record.state ? 1:0,
    });
    setEditingKey(record.key);
  };

  const cancelEdit = () => {
    setEditingKey('');
  };

  const save = async (key: React.Key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const updatedItem = {
          ...item,
          cateName: row.cateName,
          state: row.state ? 1 : 0,
        };

        const updateResult: any = await updateGoodsCategory({
          id: typeof key === 'number' ? key : Number(key),
          cateName: updatedItem.cateName,
          state: updatedItem.state,
        });

        if (updateResult && updateResult.data && updateResult.data.code === 0) {
          newData.splice(index, 1, updatedItem);
          setData(newData);
          message.success('分类更新成功');
          setEditingKey('');
        } else {
          message.error(updateResult?.message || '分类更新失败');
          fetchCategories(pagination.current, pagination.pageSize);
        }
      } else {
        message.warning('未找到对应分类，尝试刷新');
        setEditingKey('');
        fetchCategories(pagination.current, pagination.pageSize);
      }
    } catch (errInfo) {
      console.error('Validate Failed:', errInfo);
      message.error('请检查输入项');
    }
  };

  const deleteCategory = async (key: React.Key) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分类吗？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const deleteResult: any = await deleteGoodsCategory(typeof key === 'number' ? key : Number(key));

          if (deleteResult && deleteResult.status === 200) {
            message.success('分类删除成功');

            const newData = data.filter((item) => item.key !== key);
            const newTotal = pagination.total > 0 ? pagination.total - 1 : 0;
            setData(newData);
            setPagination((prev) => ({ ...prev, total: newTotal }));

            if (newData.length === 0 && pagination.current > 1) {
              fetchCategories(pagination.current - 1, pagination.pageSize);
            } else {
              fetchCategories(pagination.current, pagination.pageSize);
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

  const showAddModal = () => {
    setIsModalVisible(true);
    addCategoryForm.resetFields();
  };

  const handleAddModalOk = async () => {
    try {
      const values = await addCategoryForm.validateFields();

      const categoryDataToSend = {
        cateName: values.cateName,
        state: values.state ? 1 : 0,
      };

      const addResult: any = await addGoodsCategory(categoryDataToSend);

      if (addResult && addResult.status === 200) {
        message.success('分类添加成功');
        setIsModalVisible(false);
        setPagination((prev) => ({ ...prev, current: 1 }));
      } else {
        message.error(addResult?.message || '分类添加失败');
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      message.error('请求添加分类失败');
    }
  };

  const handleAddModalCancel = () => {
    setIsModalVisible(false);
  };

  const columns: ColumnsType<GoodsCategory> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },
    {
      title: '分类名',
      dataIndex: 'cateName',
      key: 'cateName',
      width: '30%',
      render: (text, record) => {
        const isEditable = isEditing(record);
        return isEditable ? (
          <EditableCell
            editing={isEditable}
            dataIndex="cateName"
            title="分类名"
            inputType="text"
            record={record}
            index={record.id}
          >
            {text}
          </EditableCell>
        ) : (
          text
        );
      },
    },
    {
      title: '是否启用',
      dataIndex: 'state',
      key: 'state',
      width: '15%',
      render: (state, record) => {
        const isEditable = isEditing(record);
        if (!isEditable) {
          return <Switch checked={state === 1} disabled={true} />;
        }
        return (
          <EditableCell
            editing={isEditable}
            dataIndex="state"
            title="是否启用"
            inputType="switch"
            record={record}
            index={record.id}
          />
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: '20%',
      render: (_, record) => {
        const isEditable = isEditing(record);
        return isEditable ? (
          <Space size="middle">
            <Button type="link" onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              完成
            </Button>
            <Button type="link" onClick={cancelEdit}>
              取消
            </Button>
          </Space>
        ) : (
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

  const components = {
    body: {
      cell: EditableCell,
    },
  };

  const mergedColumns = columns.map((col) => ({
    ...col,
    onCell: (record: GoodsCategory) => ({
      record,
      inputType:
        col.dataIndex === 'cateName'
          ? 'text'
          : col.dataIndex === 'state'
          ? 'switch'
          : 'text',
      dataIndex: col.dataIndex,
      title: col.title,
      editing: isEditing(record),
    }),
  }));

  return (
    <div style={{ padding: '20px' }}>
      <Title
        left="商品分类"
        right={
          <Button type="primary" onClick={showAddModal}>
            添加分类
          </Button>
        }
      />

      <Form form={form} component={false}>
        <Table
          components={components}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName={(record) => (isEditing(record) ? 'editable-row' : '')}
          loading={loading}
          pagination={false}
          rowKey="id"
        />
      </Form>

      <Pagination
        style={{ marginTop: 16, textAlign: 'right' }}
        {...pagination}
        onChange={(page, pageSize) => {
          if (editingKey !== '') {
            message.warning('请先完成或取消当前行的编辑');
            return;
          }
          setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
        }}
      />

      <Modal
        title="添加商品分类"
        visible={isModalVisible}
        onOk={handleAddModalOk}
        onCancel={handleAddModalCancel}
        destroyOnClose={true}
        confirmLoading={loading}
      >
        <Form
          form={addCategoryForm}
          layout="vertical"
          name="addCategoryForm"
          initialValues={{ state: true }}
        >
          <Form.Item
            name="cateName"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称!' }]}
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