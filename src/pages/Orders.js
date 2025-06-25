import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Space, Button, Card, Row, Col, Empty, message, Modal, Descriptions, Divider, Input, DatePicker, Form } from 'antd';
import { ShoppingOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, CloseOutlined, ReloadOutlined, SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/dateUtils';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Orders = ({ appData }) => {
  const { orders, services } = appData;
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // 搜索和过滤状态
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // 设置页面标题
  useEffect(() => {
    document.title = '我的订单 - 书香世界在线图书商城';
    
    // 调试：输出订单数据
    console.log('📋 [Orders] 页面加载，订单数据:', orders);
    console.log('📋 [Orders] 订单数据类型:', typeof orders);
    console.log('📋 [Orders] 是否为数组:', Array.isArray(orders));
    if (Array.isArray(orders)) {
      console.log('📋 [Orders] 订单数量:', orders.length);
      if (orders.length > 0) {
        console.log('📋 [Orders] 第一个订单:', orders[0]);
      }
    }
  }, [orders]);

  // 初始化过滤后的订单列表
  useEffect(() => {
    if (orders && orders.length > 0) {
      setFilteredOrders(orders);
    }
  }, [orders]);

  // 过滤订单
  const filterOrders = () => {
    let filtered = [...(orders || [])];
    let hasFilter = false;

    // 按书籍名称搜索
    if (searchKeyword && searchKeyword.trim()) {
      hasFilter = true;
      filtered = filtered.filter(order => {
        // 在订单的商品列表中搜索书籍名称
        const hasMatchingBook = order.items?.some(item => 
          item.title?.toLowerCase().includes(searchKeyword.toLowerCase())
        );
        // 也可以按订单号搜索
        const matchesOrderId = order.id?.toString().toLowerCase().includes(searchKeyword.toLowerCase());
        return hasMatchingBook || matchesOrderId;
      });
    }

    // 按时间范围过滤
    if (dateRange && dateRange.length === 2) {
      hasFilter = true;
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(order => {
        if (!order.orderTime) return false;
        const orderDate = dayjs(order.orderTime);
        return orderDate.isAfter(startDate.startOf('day')) && orderDate.isBefore(endDate.endOf('day'));
      });
    }

    setFilteredOrders(filtered);
    setIsFiltering(hasFilter);
  };

  // 重置搜索条件
  const resetFilters = () => {
    setSearchKeyword('');
    setDateRange([]);
    setFilteredOrders(orders || []);
    setIsFiltering(false);
  };

  // 当搜索条件改变时触发过滤
  useEffect(() => {
    filterOrders();
  }, [searchKeyword, dateRange, orders]);

  // 查看订单详情
  const handleViewOrderDetail = async (orderId) => {
    try {
      setLoading(true);
      console.log(`👁️ [Orders] 查看订单详情 - 订单: ${orderId}`);
      
      // 如果订单数据中已经包含详细信息，直接使用
      const orderFromList = orders.find(order => order.id === orderId);
      if (orderFromList && orderFromList.items && orderFromList.items.length > 0) {
        setSelectedOrder(orderFromList);
        setIsModalVisible(true);
        setLoading(false);
        return;
      }
      
      // 否则从API获取详细信息
      const orderDetail = await services.orderService.getOrderById(orderId);
      if (orderDetail) {
        setSelectedOrder(orderDetail);
        setIsModalVisible(true);
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      message.error('获取订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 关闭订单详情弹窗
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  // 更新订单状态 - 使用API
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      console.log(`🔄 [Orders] 更新订单状态 - 订单: ${orderId}, 状态: ${newStatus}`);
      await services.orderService.updateOrderStatus(orderId, newStatus);
      
      // 重新加载订单数据
      await appData.refreshData();
      message.success('订单状态更新成功');
    } catch (error) {
      console.error('更新订单状态失败:', error);
      message.error('更新订单状态失败');
    } finally {
      setLoading(false);
    }
  };

  // 取消订单 - 使用API
  const handleCancelOrder = async (orderId) => {
    console.log(`🎯 [Orders] handleCancelOrder 被调用 - 订单ID: ${orderId}`);
    console.log(`🎯 [Orders] services 对象:`, services);
    console.log(`🎯 [Orders] orderService 存在:`, !!services?.orderService);
    console.log(`🎯 [Orders] cancelOrder 方法存在:`, !!services?.orderService?.cancelOrder);
    
    try {
      setLoading(true);
      console.log(`❌ [Orders] 开始取消订单流程 - 订单: ${orderId}`);
      
      // 调用取消订单API
      console.log(`📞 [Orders] 调用 cancelOrder API...`);
      const result = await services.orderService.cancelOrder(orderId);
      console.log(`📞 [Orders] cancelOrder API 返回结果:`, result);
      
      // 重新加载订单数据
      console.log(`🔄 [Orders] 开始刷新订单数据...`);
      await handleRefreshOrders();
      console.log(`✅ [Orders] 订单取消成功！`);
      message.success('订单已取消');
    } catch (error) {
      console.error('❌ [Orders] 取消订单失败:', error);
      console.error('❌ [Orders] 错误类型:', typeof error);
      console.error('❌ [Orders] 错误消息:', error.message);
      console.error('❌ [Orders] 错误堆栈:', error.stack);
      message.error('取消订单失败：' + (error.message || '未知错误'));
    } finally {
      console.log(`🏁 [Orders] 取消订单流程结束，设置 loading = false`);
      setLoading(false);
    }
  };

  // 手动刷新订单列表
  const handleRefreshOrders = async () => {
    try {
      setLoading(true);
      console.log('🔄 [Orders] 手动刷新订单列表');
      
      // 直接调用orderService获取最新数据
      const updatedOrders = await services.orderService.getOrders();
      console.log('🔄 [Orders] 刷新后的订单数据:', updatedOrders);
      
      if (appData.setOrders) {
        appData.setOrders(updatedOrders || []);
        console.log('🔄 [Orders] 订单数据已更新到全局状态');
      }
      
      message.success('订单列表已刷新');
    } catch (error) {
      console.error('🔄 [Orders] 刷新订单列表失败:', error);
      message.error('刷新订单列表失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '下单时间',
      dataIndex: 'orderTime',
      key: 'orderTime',
      render: (orderTime) => {
        console.log('🔍 [Orders] 下单时间原始值:', orderTime);
        return formatDateTime(orderTime);
      },
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `¥${(amount || 0).toFixed(2)}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '已完成' ? 'green' : (status === '已取消' ? 'red' : 'blue')}>
          {status === '已完成' ? <CheckCircleOutlined /> : <ClockCircleOutlined />} {status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewOrderDetail(record.id)}
          >
            查看详情
          </Button>
          {record.status !== '已完成' && record.status !== '已取消' && (
            <Button 
              type="link" 
              danger
              onClick={() => handleCancelOrder(record.id)}
            >
              取消订单
            </Button>
          )}
        </Space>
      ),
    },
  ];

  /*
  // 备用演示数据（已注释 - 改为使用API数据）
  const mockOrders = [
    {
      id: 'ORD20240409001',
      orderTime: '2024-04-09 14:30:25',
      totalAmount: 128.70,
      status: '待发货',
      items: [
        { id: 1, title: '红楼梦', quantity: 1, price: 59.9 },
        { id: 3, title: '活着', quantity: 1, price: 68.8 }
      ]
    },
    {
      id: 'ORD20240405002',
      orderTime: '2024-04-05 10:15:43',
      totalAmount: 69.80,
      status: '已完成',
      items: [
        { id: 2, title: '三体', quantity: 1, price: 69.8 }
      ]
    }
  ];
  */

  const dataSource = filteredOrders || [];

  return (
    <div>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>我的订单</Title>
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={handleRefreshOrders}
                type="primary"
              >
                刷新订单
              </Button>
            </Space>
          </div>
        </Col>

        {/* 搜索和过滤区域 */}
        <Col span={24}>
          <Card style={{ marginBottom: 16 }}>
            <Form layout="horizontal">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder="搜索订单号或书籍名称"
                    prefix={<SearchOutlined />}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <RangePicker
                    placeholder={['开始日期', '结束日期']}
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates || [])}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <Space>
                    {isFiltering && (
                      <Button 
                        icon={<ClearOutlined />}
                        onClick={resetFilters}
                      >
                        清除筛选
                      </Button>
                    )}
                    <Tag color={isFiltering ? 'blue' : 'default'} icon={<FilterOutlined />}>
                      {isFiltering 
                        ? `已筛选 ${dataSource.length}/${orders?.length || 0} 条` 
                        : `共 ${orders?.length || 0} 条订单`
                      }
                    </Tag>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        <Col span={24}>
          <Card>
            {dataSource.length > 0 ? (
              <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                loading={loading}
                expandable={{
                  expandedRowRender: (record) => (
                    <div style={{ padding: '10px 20px' }}>
                      <Title level={5}>订单商品</Title>
                      <Table
                        columns={[
                          { title: '商品名称', dataIndex: 'title', key: 'title',
                            render: (text, item) => (
                              <Link to={`/book/${item.id}`}>{text}</Link>
                            )
                          },
                          { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                          { 
                            title: '单价', 
                            dataIndex: 'price', 
                            key: 'price',
                            render: (price) => `¥${(price || 0).toFixed(2)}`
                          },
                          { 
                            title: '小计', 
                            key: 'subtotal',
                            render: (_, item) => `¥${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
                          }
                        ]}
                        dataSource={record.items}
                        pagination={false}
                        rowKey="id"
                      />
                    </div>
                  )
                }}
              />
            ) : (
              <Empty
                image={<ShoppingOutlined style={{ fontSize: 60 }} />}
                description="暂无订单记录"
              >
                <Button type="primary">
                  <Link to="/">去购物</Link>
                </Button>
              </Empty>
            )}
          </Card>
        </Col>
      </Row>

      {/* 订单详情弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EyeOutlined style={{ marginRight: 8 }} />
            订单详情
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            {/* 订单基本信息 */}
            <Descriptions title="订单信息" bordered column={2}>
              <Descriptions.Item label="订单号">{selectedOrder.id}</Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={selectedOrder.status === '已完成' ? 'green' : (selectedOrder.status === '已取消' ? 'red' : 'blue')}>
                  {selectedOrder.status === '已完成' ? <CheckCircleOutlined /> : <ClockCircleOutlined />} {selectedOrder.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">{formatDateTime(selectedOrder.orderTime)}</Descriptions.Item>
              <Descriptions.Item label="订单金额">
                <span style={{ color: '#ff4d4f', fontSize: '16px', fontWeight: 'bold' }}>
                  ¥{selectedOrder.totalAmount?.toFixed(2)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* 订单商品列表 */}
            <div>
              <Typography.Title level={5}>商品清单</Typography.Title>
              <Table
                columns={[
                  { 
                    title: '商品名称', 
                    dataIndex: 'title', 
                    key: 'title',
                    render: (text, item) => (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>
                          <Link to={`/book/${item.bookId || item.id}`} style={{ fontWeight: 'bold' }}>
                            {text}
                          </Link>
                          {item.author && (
                            <div style={{ color: '#888', fontSize: '12px' }}>
                              作者：{item.author}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  },
                  { 
                    title: '数量', 
                    dataIndex: 'quantity', 
                    key: 'quantity',
                    align: 'center',
                    render: (quantity) => <span style={{ fontWeight: 'bold' }}>{quantity}</span>
                  },
                  { 
                    title: '单价', 
                    dataIndex: 'price', 
                    key: 'price',
                    align: 'right',
                    render: (price) => `¥${price?.toFixed(2)}`
                  },
                  { 
                    title: '小计', 
                    key: 'subtotal',
                    align: 'right',
                    render: (_, item) => (
                      <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                        ¥{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    )
                  }
                ]}
                dataSource={selectedOrder.items || []}
                pagination={false}
                rowKey="id"
                size="small"
              />
            </div>

            {/* 订单总计 */}
            <div style={{ 
              marginTop: 16, 
              padding: 16, 
              background: '#f5f5f5', 
              borderRadius: 6,
              textAlign: 'right'
            }}>
              <Space direction="vertical" size="small">
                <div>
                  商品数量：
                  <span style={{ fontWeight: 'bold' }}>
                    {(selectedOrder.items || []).reduce((total, item) => total + (item.quantity || 0), 0)} 件
                  </span>
                </div>
                <div style={{ fontSize: '16px' }}>
                  订单总额：
                  <span style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
                    ¥{selectedOrder.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders; 