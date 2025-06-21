import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, InputNumber, Row, Col, Image, Divider, message, Rate, Tag, Breadcrumb, Affix, Space } from 'antd';
import { 
  ShoppingCartOutlined, 
  ArrowLeftOutlined, 
  BookOutlined, 
  HeartOutlined, 
  HeartFilled, 
  HomeOutlined,
  ShareAltOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import store from '../data/store';

const { Title, Text, Paragraph } = Typography;

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState(store.cart);
  const [favorites, setFavorites] = useState(store.favorites);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // 加载图书信息
  useEffect(() => {
    setLoading(true);
    const bookData = store.books.find(b => b.id === parseInt(id));
    if (bookData) {
      setBook(bookData);
      // 模拟加载延迟
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } else {
      setLoading(false);
    }
  }, [id]);

  // 保存购物车到存储
  useEffect(() => {
    store.saveCart(cart);
  }, [cart]);

  // 保存收藏到存储
  useEffect(() => {
    store.saveFavorites(favorites);
  }, [favorites]);

  // 添加到购物车
  const handleAddToCart = () => {
    if (!book) return;
    
    const existingItem = cart.find(item => item.id === book.id);
    
    if (existingItem) {
      // 检查是否超过库存
      if (existingItem.quantity + quantity > book.stock) {
        message.warning(`添加数量超过库存限制！当前库存: ${book.stock}`);
        return;
      }
      
      // 更新购物车中的数量
      const updatedCart = cart.map(item => 
        item.id === book.id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      );
      setCart(updatedCart);
    } else {
      // 检查是否超过库存
      if (quantity > book.stock) {
        message.warning(`添加数量超过库存限制！当前库存: ${book.stock}`);
        return;
      }
      
      // 添加新商品到购物车
      setCart([...cart, { ...book, quantity }]);
    }
    
    message.success(`已将 ${quantity} 本《${book.title}》添加到购物车`);
  };

  // 切换收藏状态
  const toggleFavorite = () => {
    if (!book) return;
    
    const isFavorite = favorites.some(item => item.id === book.id);
    
    if (isFavorite) {
      // 从收藏中移除
      const updatedFavorites = favorites.filter(item => item.id !== book.id);
      setFavorites(updatedFavorites);
      message.success(`已将《${book.title}》从收藏中移除`);
    } else {
      // 添加到收藏
      const { id, title, author } = book;
      setFavorites([...favorites, { id, title, author }]);
      message.success(`已将《${book.title}》添加到收藏`);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // 立即购买
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  // 随机生成评分和销量数据（实际项目中应从后端获取）
  const rating = book ? (3 + Math.random() * 2).toFixed(1) : 0;
  const sales = book ? Math.floor(Math.random() * 500) + 50 : 0;

  if (!book && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <BookOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
        <Title level={3}>图书不存在</Title>
        <Button type="primary" onClick={() => navigate('/')}>返回首页</Button>
      </div>
    );
  }

  const isFavorite = favorites.some(item => book && item.id === book.id);

  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined /> 首页
        </Breadcrumb.Item>
        <Breadcrumb.Item>图书详情</Breadcrumb.Item>
        {book && <Breadcrumb.Item>{book.title}</Breadcrumb.Item>}
      </Breadcrumb>
      
      <Card loading={loading} bordered={false} bodyStyle={{ padding: '24px' }}>
        {book && (
          <Row gutter={[32, 24]}>
            <Col xs={24} md={8}>
              <div style={{ position: 'sticky', top: '24px' }}>
                {imageError ? (
                  <div 
                    style={{ 
                      height: 400, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5',
                      flexDirection: 'column',
                      borderRadius: '8px'
                    }}
                  >
                    <BookOutlined style={{ fontSize: 80, color: '#999' }} />
                    <Text style={{ marginTop: 16, fontSize: 18 }}>{book.title}</Text>
                  </div>
                ) : (
                  <Image
                    className="refreshable-image"
                    src={book.coverImage}
                    alt={book.title}
                    style={{ 
                      width: '100%', 
                      maxHeight: '500px', 
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                    onError={handleImageError}
                    preview={{ mask: '查看大图' }}
                  />
                )}
                
                {/* 社交分享按钮 */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginTop: 16,
                  gap: '8px'
                }}>
                  <Button 
                    icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
                    onClick={toggleFavorite}
                  >
                    {isFavorite ? '已收藏' : '收藏'}
                  </Button>
                  <Button icon={<ShareAltOutlined />}>
                    分享
                  </Button>
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={16}>
              <div>
                <Title level={2} style={{ marginBottom: 8 }}>{book.title}</Title>
                <Title level={4} type="secondary" style={{ marginTop: 0, fontWeight: 'normal' }}>{book.author}</Title>
                
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                  <Rate disabled defaultValue={parseFloat(rating)} allowHalf />
                  <Text style={{ marginLeft: 8 }}>{rating}</Text>
                  <Divider type="vertical" />
                  <Text type="secondary">月销 {sales} 本</Text>
                </div>
                
                <Card 
                  style={{ 
                    marginTop: 24, 
                    backgroundColor: '#fafafa', 
                    borderRadius: '8px' 
                  }}
                  bodyStyle={{ padding: '16px' }}
                  bordered={false}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text type="secondary">出版社:</Text> {book.publisher || '未知'}
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">出版日期:</Text> {book.publishDate || '未知'}
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">ISBN:</Text> {book.isbn || '未知'}
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">库存:</Text> {' '}
                      {book.stock > 10 ? (
                        <Text type="success">{book.stock} 本 <CheckCircleOutlined /></Text>
                      ) : book.stock > 0 ? (
                        <Text type="warning">{book.stock} 本（库存紧张）</Text>
                      ) : (
                        <Text type="danger">暂时缺货</Text>
                      )}
                    </Col>
                  </Row>
                </Card>
                
                <div style={{ 
                  marginTop: 24, 
                  padding: '24px',
                  background: 'linear-gradient(to right, #fffbe6, #fff)',
                  borderRadius: '8px'
                }}>
                  <Title level={2} style={{ color: '#f5222d', margin: 0 }}>
                    ¥{book.price.toFixed(2)}
                  </Title>
                  
                  <div style={{ marginTop: 24 }}>
                    <Row align="middle" gutter={16}>
                      <Col>
                        <Text strong>数量:</Text>
                      </Col>
                      <Col>
                        <InputNumber 
                          min={1} 
                          max={book.stock} 
                          value={quantity} 
                          onChange={setQuantity} 
                          disabled={book.stock <= 0}
                          size="large"
                          style={{ width: '100px' }}
                        />
                      </Col>
                      <Col>
                        <Text type="secondary">
                          {book.stock > 0 ? `库存 ${book.stock} 本` : '暂时缺货'}
                        </Text>
                      </Col>
                    </Row>
                    
                    <div style={{ marginTop: 24, display: 'flex', gap: '16px' }}>
                      <Button 
                        type="primary" 
                        icon={<ShoppingCartOutlined />} 
                        size="large"
                        onClick={handleAddToCart}
                        disabled={book.stock <= 0}
                        style={{ minWidth: '150px' }}
                      >
                        加入购物车
                      </Button>
                      <Button 
                        type="primary" 
                        danger
                        size="large"
                        onClick={handleBuyNow}
                        disabled={book.stock <= 0}
                        style={{ minWidth: '150px' }}
                      >
                        立即购买
                      </Button>
                    </div>
                    
                    {/* 服务保障 */}
                    <div style={{ marginTop: 24 }}>
                      <Space>
                        <Tag icon={<SafetyCertificateOutlined />} color="green">
                          正品保障
                        </Tag>
                        <Tag icon={<SafetyCertificateOutlined />} color="green">
                          七天无理由退换
                        </Tag>
                        <Tag icon={<SafetyCertificateOutlined />} color="green">
                          满88元包邮
                        </Tag>
                      </Space>
                    </div>
                  </div>
                </div>
                
                <Divider orientation="left">图书简介</Divider>
                
                <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                  {book.description || '暂无简介'}
                </Paragraph>
              </div>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  );
};

export default BookDetail;