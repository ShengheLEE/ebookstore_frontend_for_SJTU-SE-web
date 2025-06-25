import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, message, Modal, Form, Select, Card, Typography, Popconfirm } from 'antd';
import { SearchOutlined, UserOutlined, LockOutlined, UnlockOutlined, EditOutlined } from '@ant-design/icons';
import { formatDateTime, formatRelativeTime } from '../../utils/dateUtils';

const { Title } = Typography;
const { Search } = Input;

const UserManagement = ({ appData }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // 页面初始化
  useEffect(() => {
    document.title = '用户管理 - 管理员控制台';
    loadUsers();
  }, []);

  // 加载用户列表
  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('👥 [UserManagement] 加载用户列表...');
      
      // 调用后端API获取用户列表
      const result = await appData.services.userService.getAllUsers();
      
      // 调试：检查用户数据结构
      console.log('🔍 [UserManagement] 原始用户数据:', result);
      if (result && result.length > 0) {
        console.log('🔍 [UserManagement] 第一个用户数据示例:', result[0]);
        console.log('🔍 [UserManagement] 用户字段:', Object.keys(result[0] || {}));
      }
      
      setUsers(result || []);
      console.log('✅ [UserManagement] 用户列表加载成功，数量:', (result || []).length);
    } catch (error) {
      console.error('❌ [UserManagement] 加载用户列表失败:', error);
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换用户状态（禁用/启用）
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const action = newStatus === 'INACTIVE' ? '禁用' : '启用';
      
      console.log(`🔄 [UserManagement] ${action}用户:`, userId);
      
      // 调用后端API更新用户状态
      await appData.services.userService.updateUserStatus(userId, newStatus);
      
      // 重新加载用户列表以获取最新数据
      await loadUsers();
      
      message.success(`用户${action}成功`);
    } catch (error) {
      console.error('❌ [UserManagement] 更新用户状态失败:', error);
      message.error('操作失败');
    }
  };

  // 编辑用户
  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  // 保存用户编辑
  const handleSaveUser = async () => {
    try {
      const values = await form.validateFields();
      console.log('💾 [UserManagement] 保存用户:', values);
      
      // 调用后端API更新用户信息
      await appData.services.userService.updateUser(editingUser.id, values);
      
      // 重新加载用户列表以获取最新数据
      await loadUsers();
      
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      message.success('用户信息更新成功');
    } catch (error) {
      console.error('❌ [UserManagement] 保存用户失败:', error);
      message.error('保存失败');
    }
  };

  // 过滤用户
  const filteredUsers = users.filter(user =>
    (user.username || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (user.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'ascend',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
          {role === 'ADMIN' ? '管理员' : '顾客'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (createTime) => {
        console.log('🔍 [UserManagement] 注册时间原始值:', createTime);
        return formatDateTime(createTime);
      },
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      render: (lastLoginTime) => {
        console.log('🔍 [UserManagement] 最后登录时间原始值:', lastLoginTime);
        return lastLoginTime ? formatRelativeTime(lastLoginTime) : '从未登录';
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title={`确定要${record.status === 'ACTIVE' ? '禁用' : '启用'}此用户吗？`}
            onConfirm={() => handleToggleUserStatus(record.id, record.status)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger={record.status === 'ACTIVE'}
              icon={record.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />}
            >
              {record.status === 'ACTIVE' ? '禁用' : '启用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            <UserOutlined /> 用户管理
          </Title>
          <Search
            placeholder="搜索用户名、姓名或邮箱"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个用户`,
          }}
        />
      </Card>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户信息"
        open={isModalVisible}
        onOk={handleSaveUser}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Select.Option value="USER">顾客</Select.Option>
              <Select.Option value="ADMIN">管理员</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 