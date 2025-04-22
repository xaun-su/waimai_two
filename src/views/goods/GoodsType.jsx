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
  InputNumber,
} from 'antd';
import Title from '../../components/Title';
// 导入你自己的 Pagination 组件
import Pagination from '../../components/Pagination';
// 从你的 api 文件中导入实际的 API 调用函数
import {
    getGoodsCategoryList,   // 获取列表
    addGoodsCategory,     // 添加分类
    updateGoodsCategory,  // 修改分类
    deleteGoodsCategory,  // 删除分类
} from '../../api/goods';


// 修改 EditableCell 组件，使其能够处理 Switch
const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType, // <-- 接收 inputType
  record,
  index,
  children,
  ...restProps
}) => {
  // 根据 inputType 选择渲染的节点
  let inputNode;
  if (inputType === 'number') {
    inputNode = <InputNumber style={{ width: '100%' }} />;
  } else if (inputType === 'switch') {
    inputNode = <Switch />; // Switch 不需要 style={{ width: '100%' }}
  } else { // 默认是文本
    inputNode = <Input />;
  }

  // Switch 的 valuePropName 是 'checked'，其他输入框是 'value'
  const valuePropName = inputType === 'switch' ? 'checked' : 'value';
  // Switch 通常不需要 required 验证
  const requiredRule = inputType !== 'switch' ? [{ required: true, message: `请输入${title}!` }] : [];


  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={requiredRule} // 使用根据 inputType 判断的 rules
          valuePropName={valuePropName} // 根据 inputType 设置 valuePropName
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};


const GoodsType = () => {
  // 使用同一个 Form 实例管理行内编辑的所有字段 (包括 cateName 和 state)
  const [form] = Form.useForm();
  const [addCategoryForm] = Form.useForm();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(''); // 当前正在编辑的行的 key (对应 record.id)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
    showTotal: (total) => `共 ${total} 条`,
  });

  // 判断行是否处于编辑状态
  const isEditing = (record) => record.id === editingKey;

  // 获取分类列表数据
  const fetchCategories = async (page, pageSize) => {
    setLoading(true);
    try {
      const result = await getGoodsCategoryList(`?currentPage=${page}&pageSize=${pageSize}`);
      console.log('获取商品分类数据', result);

      if (result && result.data && result.data.code === 0) {
          const formattedData = result.data.data.map(item => ({
              ...item,
              key: item.id, // 使用后端返回的 id 作为 key
              // state 字段是数字 0 或 1，直接使用即可
          }));
          setData(formattedData);
          setPagination(prev => ({ ...prev, total: result.data.total, current: page, pageSize: pageSize }));
      } else {
          message.error(result?.message || '获取分类列表失败');
          setData([]);
          setPagination(prev => ({ ...prev, total: 0 }));
      }

    } catch (error) {
      console.error('Failed to fetch categories:', error);
      message.error('请求分类列表失败');
      setData([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据，以及分页状态变化时重新加载
  useEffect(() => {
    fetchCategories(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);


  // 进入编辑状态
  const edit = (record) => {
    // 使用 record 的数据填充 Form
    // 注意：state 是数字 0 或 1，Form.Item valuePropName="checked" 需要 boolean
    // 所以这里需要将数字转换为 boolean
    form.setFieldsValue({
      ...record,
      state: record.state === 1, // 将数字 1 转换为 true，0 转换为 false
    });
    setEditingKey(record.id); // 设置当前编辑的行的 key 为 record.id
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingKey(''); // 清空编辑状态
  };

  // 保存编辑
  const save = async (key) => { // key 就是 record.id
    try {
      // 验证并获取编辑后的数据，现在会包含 cateName 和 state (boolean)
      const row = await form.validateFields();
      console.log('Saving row:', row); // row 应该包含 { cateName: '...', state: true/false }

      // 找到当前编辑的分类在本地数据中的索引
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        // 构建更新后的数据对象，将 boolean 类型的 state 转换为数字
        const updatedItem = {
            ...item, // 保留原始数据，如 id
            cateName: row.cateName, // 使用 form 验证后的 cateName
            state: row.state ? 1 : 0, // <-- 使用 form 验证后的 state (boolean)，并转换为数字 0 或 1
        };
        console.log('提交更新的数据：', updatedItem);

        // 调用实际的更新 API，发送 id, cateName 和 state (数字)
        const updateResult = await updateGoodsCategory({ id: updatedItem.id, cateName: updatedItem.cateName, state: updatedItem.state });
        console.log('更新结果：', updateResult);

        // 假设更新 API 的成功判断与获取列表 API 一致
        if (updateResult && updateResult.data && updateResult.data.code === 0) {
             // API 更新成功，更新本地数据状态
            newData.splice(index, 1, updatedItem);
            setData(newData);
            message.success('分类更新成功');
            setEditingKey(''); // 退出编辑状态
        } else {
            // API 更新失败
            message.error(updateResult?.message || '分类更新失败');
            // API 更新失败时，回滚本地乐观更新的状态，或者重新加载数据
            fetchCategories(pagination.current, pagination.pageSize); // 重新加载当前页数据以同步后端状态
        }

      } else {
        // 如果找不到，可能是数据同步问题，尝试重新加载数据
        message.warning('未找到对应分类，尝试刷新');
        setEditingKey('');
        fetchCategories(pagination.current, pagination.pageSize); // 重新加载当前页数据
      }
    } catch (errInfo) {
      console.error('Validate Failed:', errInfo);
      // errInfo 包含了验证失败的字段信息
      message.error('请检查输入项');
    }
  };

  // 删除分类
  const deleteCategory = (key) => { // key 就是 record.id
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分类吗？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          console.log('删除分类 ID:', key);

          const deleteResult = await deleteGoodsCategory(key);

          // 假设删除 API 的成功状态码是 status === 200
          if (deleteResult && deleteResult.status === 200) {
              message.success('分类删除成功');

              // 从本地数据中移除该项
              const newData = data.filter(item => item.key !== key);
              // 乐观更新总条数
              const newTotal = pagination.total > 0 ? pagination.total - 1 : 0;
              setData(newData);
              setPagination(prev => ({ ...prev, total: newTotal }));

              // 如果当前页数据删完了，且不是第一页，则回到上一页并重新加载
              if (newData.length === 0 && pagination.current > 1) {
                 fetchCategories(pagination.current - 1, pagination.pageSize);
              } else {
                 // 否则刷新当前页数据
                 fetchCategories(pagination.current, pagination.pageSize);
              }
          } else {
              // API 删除失败
              message.error(deleteResult?.message || '分类删除失败');
          }

        } catch (error) {
          console.error('Failed to delete category:', error);
          message.error('请求删除分类失败'); // 网络错误或请求异常
        }
      },
    });
  };

  // 移除独立的 handleStateChange 函数，状态变化由 Form 管理


  // 显示添加分类模态框
  const showAddModal = () => {
    setIsModalVisible(true);
    addCategoryForm.resetFields(); // 打开模态框时重置表单
  };

  // 处理添加分类模态框确认
  const handleAddModalOk = async () => {
    try {
      const values = await addCategoryForm.validateFields();
      console.log('添加分类数据:', values);

      // 将 boolean 类型的 state 转换为数字 0 或 1，以符合后端接口要求
      const categoryDataToSend = {
          cateName: values.cateName,
          state: values.state ? 1 : 0, // 将 boolean 转换为数字 0 或 1
      };

      // 调用实际的添加 API
      const addResult = await addGoodsCategory(categoryDataToSend);
      console.log('添加分类结果:', addResult);

      // 假设添加 API 的成功状态码是 status === 200
      if (addResult && addResult.status === 200) {
          message.success('分类添加成功');
          setIsModalVisible(false);
          // 添加成功后，回到第一页并重新加载，以看到新添加的数据
          setPagination(prev => ({ ...prev, current: 1 }));
          // fetchCategories 会在 useEffect 中被触发，因为 current 变化了
      } else {
          // API 添加失败
          message.error(addResult?.message || '分类添加失败');
      }


    } catch (error) {
      console.error('Failed to add category:', error);
      // errInfo 包含了验证失败的字段信息
      message.error('请求添加分类失败'); // 网络错误或请求异常
    }
  };

  // 处理添加分类模态框取消
  const handleAddModalCancel = () => {
    setIsModalVisible(false);
  };


  // 表格列配置
  const columns = [
    {
      title: '序号',
      dataIndex: 'id', // 使用 id 作为序号
      key: 'id',
      width: '10%',
    },
    {
      title: '分类名',
      dataIndex: 'cateName',
      key: 'cateName',
      width: '30%',
      editable: true, // 标记为可编辑列
      // 自定义渲染，用于在编辑状态下显示 Input，非编辑状态显示文本
      render: (text, record) => {
        const editable = isEditing(record); // 判断当前行是否在编辑
        return editable ? (
          // 如果在编辑，使用 EditableCell 渲染 Input
          <EditableCell
            editing={editable}
            dataIndex="cateName" // 绑定到 cateName 字段
            title="分类名"
            inputType="text" // 指定输入类型为文本
            record={record}
          >
            {text}
          </EditableCell>
        ) : (
          // 不在编辑，直接显示文本
          text
        );
      },
    },
    {
      title: '是否启用',
      dataIndex: 'state',
      key: 'state',
      width: '15%',
      editable: true, // <-- 标记为可编辑列
      // 移除原有的 render 函数，渲染将由 EditableCell 处理
      // render: (state, record) => { ... }
      // 非编辑状态下显示 Switch，但不可操作
      render: (state, record) => {
          const editable = isEditing(record);
          // 在非编辑状态下，我们仍然显示 Switch，但它是禁用的
          if (!editable) {
              return (
                  <Switch
                      checked={state === 1}
                      disabled={true} // 非编辑状态下禁用
                  />
              );
          }
          // 编辑状态下，渲染由 EditableCell 接管
          return <EditableCell
                    editing={editable}
                    dataIndex="state"
                    title="是否启用"
                    inputType="switch" // 指定输入类型为 switch
                    record={record}
                 >
                    {/* EditableCell 的 children 在非编辑状态下显示，但这里我们上面已经处理了非编辑状态的渲染 */}
                    {/* 所以这里的 children 不会实际渲染 */}
                 </EditableCell>;
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: '20%',
      render: (_, record) => { // 使用 _ 忽略第一个参数 (当前单元格的值)
        const editable = isEditing(record); // 判断当前行是否在编辑
        return editable ? ( // 如果在编辑
          <Space size="middle">
            <Button type="link" onClick={() => save(record.id)} style={{ marginRight: 8 }}> {/* 保存时传递 record.id */}
              完成
            </Button>
            {/* Popconfirm 可以在删除前弹出确认 */}
            {/* <Popconfirm title="确定取消编辑吗?" onConfirm={cancelEdit}> */}
              <Button type="link" onClick={cancelEdit}>取消</Button>
            {/* </Popconfirm> */}
          </Space>
        ) : ( // 不在编辑
          <Space size="middle">
            {/* 只有当没有其他行在编辑时，当前行才能被编辑 */}
            <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record)}>
              编辑
            </Button>
            <Button type="link" danger onClick={() => deleteCategory(record.id)} disabled={editingKey !== ''}> {/* 删除时传递 record.id */}
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  // 配置 Table 的 components 属性，指定自定义的 cell 渲染器
  const components = {
    body: {
      cell: EditableCell,
    },
  };

  // 处理表格数据，将可编辑列与 Form 关联
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      // 对于不可编辑的列，如果它有自定义 render，保留 render
      // 如果没有自定义 render，则不需要 onCell
      return col;
    }
    // 对于可编辑的列，添加 onCell 属性
    return {
      ...col,
      onCell: (record) => ({ // 为可编辑列添加 onCell 属性
        record,
        // 根据 dataIndex 指定 inputType
        inputType: col.dataIndex === 'cateName' ? 'text' : (col.dataIndex === 'state' ? 'switch' : 'text'), // <-- 为 state 指定 inputType: 'switch'
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record), // 传递编辑状态
      }),
    };
  });


  return (
    <div style={{ padding: '20px' }}>
      {/* Title 组件，右侧添加按钮 */}
      <Title left='商品分类' right={
        <Button type="primary" onClick={showAddModal}>
          添加分类
        </Button>
      }/>

      {/* 包裹 Table 的 Form，用于行内编辑 */}
      {/* 注意：Form 必须包裹 Table，并且 Form 的 name 属性是 Form.Item 的前缀 */}
      {/* component={false} 避免 Form 渲染额外的 DOM */}
      <Form form={form} component={false}>
        <Table
          components={components} // 使用自定义 cell 渲染器
          bordered // 显示边框
          dataSource={data} // 表格数据
          columns={mergedColumns} // 表格列配置
          rowClassName={(record) => isEditing(record) ? 'editable-row' : ''} // 给编辑行添加 class
          loading={loading} // 加载状态
          pagination={false} // Table 内部不显示分页，我们使用外部 Pagination
          rowKey="id" // 指定行的 key，使用后端返回的唯一 id
        />
      </Form>

      {/* 外部 Pagination 组件 */}
      {/* 使用你自己的 Pagination 组件 */}
      <Pagination
        style={{ marginTop: 16, textAlign: 'right' }}
        {...pagination} // 绑定分页状态
        // 将 onChange 事件处理函数传递给你的 Pagination 组件
        onChange={(page, pageSize) => {
           // 如果当前有行正在编辑，阻止分页和切换每页条数，避免数据丢失
           if (editingKey !== '') {
               message.warning('请先完成或取消当前行的编辑');
               return; // 阻止操作
           }
           // 只更新分页状态，useEffect 会监听并触发数据加载
           setPagination(prev => ({ ...prev, current: page, pageSize: pageSize }));
        }}
      />


      {/* 添加分类模态框 */}
      <Modal
        title="添加商品分类"
        visible={isModalVisible}
        onOk={handleAddModalOk}
        onCancel={handleAddModalCancel}
        destroyOnClose={true} // 关闭时销毁 Form，避免数据残留
        confirmLoading={loading} // 提交时显示加载状态
      >
        <Form
          form={addCategoryForm} // 绑定添加分类模态框的 Form 实例
          layout="vertical" // 垂直布局
          name="addCategoryForm"
          initialValues={{ state: true }} // 设置是否启用的默认值，这里仍然使用 boolean，在提交时转换为数字
        >
          <Form.Item
            name="cateName" // 字段名保持 cateName
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称!' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          {/* 是否启用 */}
        <Form.Item
            label="是否启用"
            name="state" // 字段名保持 state
            valuePropName="checked" // Switch 的值是 boolean，绑定到 checked 属性
        >
            <Switch />
        </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GoodsType;
