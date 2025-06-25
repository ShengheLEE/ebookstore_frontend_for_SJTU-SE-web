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

const { Title, Text, Paragraph } = Typography;

const BookDetail = ({ appData }) => {
  const { books, cart, updateCart, favorites, updateFavorites, services } = appData;
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // 设置页面标题
  useEffect(() => {
    if (book) {
      document.title = `${book.title} - 书香世界在线图书商城`;
    } else {
      document.title = '图书详情 - 书香世界在线图书商城';
    }
  }, [book]);

  // 加载图书信息 - 使用API
  useEffect(() => {
    const loadBook = async () => {
      setLoading(true);
      try {
        // 首先尝试从本地books数组中找到
        const localBook = books.find(b => b.id === parseInt(id));
        if (localBook) {
          setBook(localBook);
          setLoading(false);
          return;
        }
        
        // 如果本地没有，调用API获取
        console.log(`📖 [BookDetail] 从API加载图书详情 - ID: ${id}`);
        const bookData = await services.bookService.getBookById(parseInt(id));
        
        if (bookData) {
          setBook(bookData);
        } else {
          console.warn(`📖 [BookDetail] 未找到图书 - ID: ${id}`);
        }
      } catch (error) {
        console.error('加载图书详情失败:', error);
        message.error('加载图书详情失败');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadBook();
    }
  }, [id, books, services.bookService]);

  // 添加到购物车 - 使用API
  const handleAddToCart = async () => {
    if (!book) return;
    
    try {
      console.log(`🛒 [BookDetail] 添加到购物车 - 图书: ${book.title}, 数量: ${quantity}`);
      
      // 检查库存
      if (quantity > book.stock) {
        message.warning(`添加数量超过库存限制！当前库存: ${book.stock}`);
        return;
      }
      
      // 检查是否已在购物车中
      const existingItem = cart.find(item => 
        (item.book && item.book.id === book.id) || item.id === book.id
      );
      
      if (existingItem) {
        // 更新数量
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > book.stock) {
          message.warning(`添加数量超过库存限制！当前库存: ${book.stock}`);
          return;
        }
        
        await updateCart('update', {
          cartItemId: existingItem.id,
          quantity: newQuantity
        });
      } else {
        // 添加新项目
        await updateCart('add', {
          bookId: book.id,
          quantity: quantity
        });
      }
      
      message.success(`已将 ${quantity} 本《${book.title}》添加到购物车`);
    } catch (error) {
      console.error('添加到购物车失败:', error);
      message.error('添加到购物车失败');
    }
  };

  // 切换收藏状态 - 使用API
  const toggleFavorite = async () => {
    if (!book) return;
    
    try {
      const isFavorite = favorites.some(item => item.id === book.id || item.bookId === book.id);
      
      if (isFavorite) {
        // 从收藏中移除
        console.log(`💔 [BookDetail] 取消收藏 - ${book.title}`);
        await updateFavorites('remove', book.id);
        message.success(`已将《${book.title}》从收藏中移除`);
      } else {
        // 添加到收藏
        console.log(`💖 [BookDetail] 添加收藏 - ${book.title}`);
        await updateFavorites('add', book.id);
        message.success(`已将《${book.title}》添加到收藏`);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      message.error('收藏操作失败');
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
                    ¥{(book.price || 0).toFixed(2)}
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