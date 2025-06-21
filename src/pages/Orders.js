import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Space, Button, Card, Row, Col, Empty } from 'antd';
import { ShoppingOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import store from '../data/store';

const { Title } = Typography;

const Orders = () => {
  const [orders, setOrders] = useState(store.orders);
  const [loading, setLoading] = useState(false);

  // 更新订单状态
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    store.saveOrders(updatedOrders);
  };

  // 取消订单
  const handleCancelOrder = (orderId) => {
    handleUpdateOrderStatus(orderId, '已取消');
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
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `¥${amount.toFixed(2)}`,
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
          <Button type="link">查看详情</Button>
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

  // 备用演示数据
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

  const dataSource = orders.length > 0 ? orders : mockOrders;

  return (
    <div>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Title level={2}>我的订单</Title>
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
                            render: (price) => `¥${price.toFixed(2)}`
                          },
                          { 
                            title: '小计', 
                            key: 'subtotal',
                            render: (_, item) => `¥${(item.price * item.quantity).toFixed(2)}`
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
    </div>
  );
};

export default Orders; 