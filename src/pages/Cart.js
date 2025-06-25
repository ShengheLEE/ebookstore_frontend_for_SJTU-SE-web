import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Typography, Card, Empty, Space, message, Avatar, Divider, Badge, Steps, Row, Col, Breadcrumb } from 'antd';
import { DeleteOutlined, ShoppingOutlined, BookOutlined, HomeOutlined, CheckOutlined, ShoppingCartOutlined, CreditCardOutlined, GiftOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Step } = Steps;

const Cart = ({ appData }) => {
  const { cart, updateCart, createOrder, services } = appData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // 设置页面标题
  useEffect(() => {
    document.title = '购物车 - 书香世界在线图书商城';
    
    // 调试：打印购物车数据
    console.log('🛒 [Cart] 购物车数据更新:', cart);
    console.log('🛒 [Cart] 购物车数据类型:', typeof cart);
    console.log('🛒 [Cart] 是否为数组:', Array.isArray(cart));
    if (Array.isArray(cart)) {
      console.log('🛒 [Cart] 购物车商品数量:', cart.length);
    }
  }, [cart]);

  // 手动刷新购物车数据
  const handleRefreshCart = async () => {
    try {
      setRefreshing(true);
      console.log('🔄 [Cart] 手动刷新购物车数据');
      
      if (appData.refreshCart) {
        await appData.refreshCart();
      } else {
        message.warning('刷新功能不可用');
      }
    } catch (error) {
      console.error('❌ [Cart] 刷新购物车失败:', error);
      message.error('刷新购物车失败');
    } finally {
      setRefreshing(false);
    }
  };

  // 更新商品数量 - 使用API
  const updateQuantity = async (record, value) => {
    try {
      const book = record.book || record;
      if (value > book.stock) {
        message.warning(`数量不能超过库存限制！最大库存: ${book.stock}`);
        return;
      }

      await updateCart('update', {
        cartItemId: record.id,
        quantity: value
      });
      
      message.success('数量更新成功');
    } catch (error) {
      console.error('更新数量失败:', error);
      message.error('更新数量失败');
    }
  };

  // 删除商品 - 使用API
  const removeItem = async (id) => {
    try {
      await updateCart('remove', {
        cartItemId: id
      });
      
      setSelectedRowKeys(selectedRowKeys.filter(key => key !== id));
      message.success('商品已从购物车移除');
    } catch (error) {
      console.error('删除商品失败:', error);
      message.error('删除商品失败');
    }
  };

  // 清空购物车 - 使用API
  const clearCartItems = async () => {
    try {
      await updateCart('clear', {});
      setSelectedRowKeys([]);
      message.success('购物车已清空');
    } catch (error) {
      console.error('清空购物车失败:', error);
      message.error('清空购物车失败');
    }
  };

  // 提交订单 - 使用API
  const handleCheckout = async () => {
    try {
      // 获取选中的商品
      const selectedItems = cart.filter(item => selectedRowKeys.includes(item.id));
      
      if (selectedItems.length === 0) {
        message.warning('请至少选择一件商品');
        return;
      }
      
      console.log('📦 [Cart] 开始创建订单...', selectedItems);
      console.log('📦 [Cart] 选中的商品ID:', selectedItems.map(item => item.id));
      
      // 使用API创建订单
      const result = await createOrder(selectedItems);
      
      console.log('📦 [Cart] 创建订单返回结果:', result);
      
      if (result) {
        console.log('📦 [Cart] 订单创建成功，清空选中状态');
        // 清空选中状态
        setSelectedRowKeys([]);
        
        // 延迟跳转，确保数据更新完成
        setTimeout(() => {
          console.log('📦 [Cart] 跳转到订单页面');
          navigate('/orders');
        }, 1000);
      } else {
        console.error('📦 [Cart] 订单创建失败，result为空');
        message.error('订单创建失败，请重试');
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      message.error('创建订单失败，请重试');
    }
  };



  // 计算选中商品的总价
  const getSelectedTotalPrice = () => {
    return cart
      .filter(item => selectedRowKeys.includes(item.id))
      .reduce((total, item) => {
        const book = item.book || item;
        const price = book.price || 0;
        const quantity = item.quantity || 1;
        return total + (price * quantity);
      }, 0);
  };

  // 计算所有商品的总价
  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const book = item.book || item;
      const price = book.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  // 获取所选商品数量
  const getSelectedItemsCount = () => {
    return cart
      .filter(item => selectedRowKeys.includes(item.id))
      .reduce((total, item) => total + (item.quantity || 1), 0);
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
      render: (text, record) => {
        const book = record.book || record;
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              shape="square" 
              size={64} 
              src={book.coverImage} 
              icon={<BookOutlined />} 
              style={{ marginRight: 16 }}
            />
            <div>
              <Link to={`/book/${book.id}`} style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {book.title || text}
              </Link>
              <div style={{ color: '#888', fontSize: '12px', marginTop: 4 }}>
                {book.author}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (price, record) => {
        const book = record.book || record;
        const bookPrice = book.price || price || 0;
        return (
          <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
                              ￥{(bookPrice || 0).toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (_, record) => {
        const book = record.book || record;
        return (
          <InputNumber
            min={1}
            max={book.stock}
            value={record.quantity}
            onChange={(value) => updateQuantity(record, value)}
            style={{ width: 100 }}
          />
        );
      },
    },
    {
      title: '小计',
      key: 'subtotal',
      align: 'center',
      render: (_, record) => {
        const book = record.book || record;
        const price = book.price || 0;
        const quantity = record.quantity || 1;
        return (
          <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
            ￥{((price || 0) * (quantity || 1)).toFixed(2)}
          </Text>
        );
      },
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
        <Button 
          icon={<ReloadOutlined />}
          loading={refreshing}
          onClick={handleRefreshCart}
          style={{ marginLeft: 16 }}
          title="刷新购物车数据"
        >
          刷新购物车
        </Button>
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
                  <Button onClick={clearCartItems} danger>清空购物车</Button>
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