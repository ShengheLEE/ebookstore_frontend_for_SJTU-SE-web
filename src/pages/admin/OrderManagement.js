import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, message, Card, Typography, DatePicker, Select, Row, Col } from 'antd';
import { SearchOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/dateUtils';

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const OrderManagement = ({ appData }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  // 页面初始化
  useEffect(() => {
    document.title = '订单管理 - 管理员控制台';
    loadAllOrders();
  }, []);

  // 当搜索条件变化时重新加载数据
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAllOrders();
    }, 500); // 500ms防抖
    
    return () => clearTimeout(timer);
  }, [searchText, statusFilter, dateRange]);

  // 加载所有订单
  const loadAllOrders = async () => {
    try {
      setLoading(true);
      console.log('📋 [OrderManagement] 加载所有订单...');
      
      // 构建查询参数
      const params = {};
      if (searchText) params.keyword = searchText;
      if (statusFilter) params.status = statusFilter;
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      // 调用后端API获取所有订单（管理员权限）
      const result = await appData.services.orderService.getAllOrdersForAdmin(params);
      
      setOrders(result || []);
      console.log('✅ [OrderManagement] 订单列表加载成功，数量:', (result || []).length);
    } catch (error) {
      console.error('❌ [OrderManagement] 加载订单列表失败:', error);
      message.error('加载订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 过滤订单
  const filteredOrders = orders.filter(order => {
    // 文本搜索过滤
    const textMatch = !searchText || 
      (order.id || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (order.userName || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (order.userEmail || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (order.items || []).some(item => (item.title || '').toLowerCase().includes(searchText.toLowerCase()));

    // 状态过滤
    const statusMatch = !statusFilter || order.status === statusFilter;

    // 日期范围过滤
    let dateMatch = true;
    if (dateRange && dateRange.length === 2) {
      const orderDate = new Date(order.orderTime);
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      dateMatch = orderDate >= startDate && orderDate <= endDate;
    }

    return textMatch && statusMatch && dateMatch;
  });

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <Link to={`/admin/orders/${id}`} style={{ fontWeight: 'bold' }}>
          {id}
        </Link>
      ),
    },
    {
      title: '用户信息',
      key: 'user',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.userName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'orderTime',
      key: 'orderTime',
      render: (orderTime) => {
        console.log('🔍 [OrderManagement] 下单时间原始值:', orderTime);
        return formatDateTime(orderTime);
      },
      sorter: (a, b) => new Date(a.orderTime) - new Date(b.orderTime),
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                          ¥{(amount || 0).toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: '商品数量',
      key: 'itemCount',
      render: (_, record) => (
        <span>{record.items.reduce((total, item) => total + item.quantity, 0)} 件</span>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        if (status === '已完成') color = 'green';
        else if (status === '已取消') color = 'red';
        else if (status === '已发货') color = 'orange';
        
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '收货信息',
      key: 'receiver',
      render: (_, record) => (
        <div>
          <div>{record.receiverName} {record.receiverPhone}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.receiverAddress}
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewOrder(record)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  // 查看订单详情
  const handleViewOrder = (order) => {
    console.log('👁️ [OrderManagement] 查看订单详情:', order);
    // TODO: 实现订单详情查看功能
    message.info('订单详情查看功能开发中...');
  };

  // 重置过滤条件
  const handleResetFilters = () => {
    setSearchText('');
    setDateRange([]);
    setStatusFilter('');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0, marginBottom: 16 }}>
            <FileTextOutlined /> 订单管理
          </Title>
          
          {/* 搜索和过滤区域 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Search
                placeholder="搜索订单号、用户或商品"
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={setSearchText}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
                value={dateRange}
                onChange={setDateRange}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="选择订单状态"
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Select.Option value="待发货">待发货</Select.Option>
                <Select.Option value="已发货">已发货</Select.Option>
                <Select.Option value="已完成">已完成</Select.Option>
                <Select.Option value="已取消">已取消</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Button onClick={handleResetFilters}>
                重置筛选
              </Button>
            </Col>
          </Row>
        </div>

        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {filteredOrders.length}
                </div>
                <div>总订单数</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  ¥{filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
                </div>
                <div>总金额</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {filteredOrders.filter(order => order.status === '待发货').length}
                </div>
                <div>待发货</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {filteredOrders.filter(order => order.status === '已完成').length}
                </div>
                <div>已完成</div>
              </div>
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个订单`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default OrderManagement; 