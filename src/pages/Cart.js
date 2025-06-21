import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Typography, Card, Empty, Space, message, Avatar, Divider, Badge, Steps, Row, Col, Breadcrumb } from 'antd';
import { DeleteOutlined, ShoppingOutlined, BookOutlined, HomeOutlined, CheckOutlined, ShoppingCartOutlined, CreditCardOutlined, GiftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import store from '../data/store';

const { Title, Text } = Typography;
const { Step } = Steps;

const Cart = () => {
  // 从store中获取初始购物车数据
  const [cart, setCart] = useState(() => {
    const cartData = store.cart;
    return Array.isArray(cartData) ? cartData : [];
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const navigate = useNavigate();

  // 监听购物车数据变化
  useEffect(() => {
    const cartData = store.cart;
    if (!cart.length && Array.isArray(cartData) && cartData.length) {
      setCart(cartData);
    }
  }, []);

  useEffect(() => {
    if (cart && Array.isArray(cart) && cart.length > 0) {
      store.saveCart(cart);
    }
  }, [cart]);

  // 更新商品数量
  const updateQuantity = (record, value) => {
    if (value > record.stock) {
      message.warning(`数量不能超过库存限制！最大库存: ${record.stock}`);
      return;
    }

    const updatedCart = cart.map(item => 
      item.id === record.id ? { ...item, quantity: value } : item
    );
    setCart(updatedCart);
  };

  // 删除商品
  const removeItem = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    setSelectedRowKeys(selectedRowKeys.filter(key => key !== id));
    message.success('商品已从购物车移除');
  };

  // 清空购物车
  const clearCart = () => {
    setCart([]);
    setSelectedRowKeys([]);
    message.success('购物车已清空');
  };

  // 提交订单
  const handleCheckout = () => {
    // 获取选中的商品
    const selectedItems = cart.filter(item => selectedRowKeys.includes(item.id));
    
    if (selectedItems.length === 0) {
      message.warning('请至少选择一件商品');
      return;
    }
    
    // 使用集中存储的createOrder方法创建订单
    store.createOrder(selectedItems);
    
    // 从购物车中移除已下单的商品
    setCart(cart.filter(item => !selectedRowKeys.includes(item.id)));
    
    // 清空选中状态
    setSelectedRowKeys([]);
    
    message.success('订单已创建成功！');
    
    // 跳转到订单页面
    navigate('/orders');
  };

  // 计算选中商品的总价
  const getSelectedTotalPrice = () => {
    return cart
      .filter(item => selectedRowKeys.includes(item.id))
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // 计算所有商品的总价
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // 获取所选商品数量
  const getSelectedItemsCount = () => {
    return cart
      .filter(item => selectedRowKeys.includes(item.id))
      .reduce((total, item) => total + item.quantity, 0);
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    }
  };

  const columns = [
    {
      title: '图书',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            shape="square" 
            size={64} 
            src={record.coverImage} 
            icon={<BookOutlined />} 
            style={{ marginRight: 16 }}
          />
          <div>
            <Link to={`/book/${record.id}`} style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {text}
            </Link>
            <div style={{ color: '#888', fontSize: '12px', marginTop: 4 }}>
              {record.author}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (price) => (
        <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
          ￥{price.toFixed(2)}
        </Text>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.stock}
          value={record.quantity}
          onChange={(value) => updateQuantity(record, value)}
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      align: 'center',
      render: (_, record) => (
        <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
          ￥{(record.price * record.quantity).toFixed(2)}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 面包屑导航 */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/"><HomeOutlined /> 首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <ShoppingCartOutlined /> 购物车
        </Breadcrumb.Item>
      </Breadcrumb>
      
      {/* 购物流程步骤 */}
      <Card style={{ marginBottom: 24 }}>
        <Steps current={0} size="small">
          <Step title="购物车" icon={<ShoppingCartOutlined />} />
          <Step title="确认订单" icon={<CreditCardOutlined />} />
          <Step title="付款" icon={<GiftOutlined />} />
          <Step title="完成" icon={<CheckOutlined />} />
        </Steps>
      </Card>
      
      <Title level={2} style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <ShoppingCartOutlined style={{ marginRight: 8 }} />
        购物车 {cart.length > 0 && <Badge count={cart.length} style={{ marginLeft: 8 }} />}
      </Title>

      {cart.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>购物车是空的，去添加一些商品吧！</span>
            }
          >
            <Button type="primary" onClick={() => navigate('/')}>
              继续购物
            </Button>
          </Empty>
        </Card>
      ) : (
        <>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={cart}
            rowKey="id"
            pagination={false}
            style={{ marginBottom: 24 }}
          />
          
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Button onClick={clearCart} danger>清空购物车</Button>
                  <Button onClick={() => navigate('/')}>继续购物</Button>
                </Space>
              </Col>
              <Col>
                <Space size="large">
                  <Text>已选择 {getSelectedItemsCount()} 件商品</Text>
                  <Text strong>
                    合计：<span style={{ color: '#ff4d4f', fontSize: '20px' }}>
                      ￥{getSelectedTotalPrice().toFixed(2)}
                    </span>
                  </Text>
                  <Button type="primary" size="large" onClick={handleCheckout}>
                    结算
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
};

export default Cart;