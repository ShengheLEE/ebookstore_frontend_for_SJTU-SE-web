import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Typography, Divider, Carousel, Card, Space, Tag, Button, Affix } from 'antd';
import { SearchOutlined, BookOutlined, FireOutlined, CrownOutlined, RightOutlined } from '@ant-design/icons';
import BookCard from '../components/BookCard';
import store from '../data/store';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Search } = Input;

const Home = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState(store.cart);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // 模拟分类数据
  const categories = [
    { key: 'all', name: '全部', icon: <BookOutlined /> },
    { key: 'novel', name: '小说', icon: null },
    { key: 'literature', name: '文学', icon: null },
    { key: 'history', name: '历史', icon: null },
    { key: 'scifi', name: '科幻', icon: null },
  ];

  // 初始化加载所有图书
  useEffect(() => {
    setFilteredBooks(store.books);
  }, []);

  // 保存购物车到存储
  useEffect(() => {
    store.saveCart(cart);
  }, [cart]);

  // 处理搜索
  const handleSearch = (value) => {
    setSearchQuery(value);
    filterBooks(value, categoryFilter);
  };

  // 处理分类筛选
  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
    filterBooks(searchQuery, category);
  };

  // 过滤图书
  const filterBooks = (query, category) => {
    let filtered = store.books;
    
    // 按搜索词过滤
    if (query) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) || 
        book.author.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // 按分类过滤（模拟）
    if (category && category !== 'all') {
      // 真实项目中这里应该有实际的分类逻辑
      // 这里只是模拟一些分类效果
      if (category === 'novel') {
        filtered = filtered.filter(book => 
          book.title.includes('红楼梦') || 
          book.title.includes('活着') || book.title.includes('围城') || book.title.includes('三体') || book.title.includes('平凡的世界')
        );
      } else if (category === 'literature') {
        filtered = filtered.filter(book => 
          book.title.includes('围城') || book.title.includes('红楼梦') || book.title.includes('活着')
        );
      } else if (category === 'scifi') {
        filtered = filtered.filter(book => 
          book.title.includes('三体')
        );
      } else if (category === 'history') {
        filtered = filtered.filter(book => 
          book.title.includes('人类简史')
        );
      }
    }
    
    setFilteredBooks(filtered);
  };

  // 添加到购物车
  const handleAddToCart = (book) => {
    const existingItem = cart.find(item => item.id === book.id);
    
    if (existingItem) {
      // 如果图书已经在购物车，增加数量
      if (existingItem.quantity < book.stock) {
        const updatedCart = cart.map(item => 
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCart(updatedCart);
      } else {
        // 超出库存提示已在BookCard组件中处理
      }
    } else {
      // 如果图书不在购物车，添加新条目
      setCart([...cart, { ...book, quantity: 1 }]);
    }
  };

  // 轮播图内容
  const carouselContent = [
    {
      image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      fallbackImage: 'https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&w=1350',
      title: '文学经典',
      description: '探索经典文学作品的无限魅力',
      books: store.books.filter(book => 
        book.title.includes('红楼梦') || book.title.includes('活着') || book.title.includes('围城')
      ),
      category: 'literature'
    },
    {
      image: 'https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      fallbackImage: 'https://images.pexels.com/photos/2908984/pexels-photo-2908984.jpeg?auto=compress&cs=tinysrgb&w=1350',
      title: '科幻世界',
      description: '踏上前所未有的科幻之旅',
      books: store.books.filter(book => 
        book.title.includes('三体')
      ),
      category: 'scifi'
    },
    {
      image: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
      fallbackImage: 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=1350',
      title: '历史人文',
      description: '了解人类历史的演变与智慧',
      books: store.books.filter(book => 
        book.title.includes('人类简史')
      ),
      category: 'history'
    }
  ];

  // 图片错误处理状态
  const [carouselImageErrors, setCarouselImageErrors] = useState({});

  // 处理轮播图背景图片加载错误
  const handleCarouselImageError = (index) => {
    setCarouselImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // 处理轮播图点击
  const handleCarouselClick = (item) => {
    if (item.category) {
      setCategoryFilter(item.category);
      filterBooks('', item.category);
      
      // 滚动到图书列表区域
      const booksListElement = document.getElementById('books-list');
      if (booksListElement) {
        booksListElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // 获取推荐图书（前3本）
  const recommendedBooks = store.books.slice(0, 3);

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* 轮播图 */}
      <div style={{ marginBottom: 24 }}>
        <Carousel autoplay effect="fade">
          {carouselContent.map((item, index) => (
            <div key={index}>
              <div 
                style={{ 
                  position: 'relative',
                  height: '400px',
                  background: `url(${carouselImageErrors[index] ? item.fallbackImage : item.image}) center center / cover no-repeat`,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => handleCarouselClick(item)}
              >
                <img
                  src={item.image}
                  className="refreshable-image"
                  style={{ display: 'none' }}
                  onError={() => handleCarouselImageError(index)}
                  alt=""
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                  padding: '80px 24px 24px',
                  borderRadius: '0 0 8px 8px'
                }}>
                  <Title level={2} style={{ color: 'white', margin: 0 }}>{item.title}</Title>
                  <Text style={{ color: 'white', display: 'block', marginBottom: 16 }}>{item.description}</Text>
                  
                  {/* 显示相关图书封面 */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: 16 }}>
                    {item.books.slice(0, 3).map((book) => (
                      <Link to={`/book/${book.id}`} key={book.id}>
                        <div 
                          className="refreshable-image"
                          style={{ 
                            width: 80, 
                            height: 110, 
                            backgroundImage: `url(${book.coverImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }} 
                        />
                      </Link>
                    ))}
                    <Button 
                      type="primary" 
                      ghost 
                      icon={<RightOutlined />} 
                      style={{ 
                        height: 'auto', 
                        marginLeft: 16,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      查看更多
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 搜索和分类 - 使用Affix固定 */}
      <Affix offsetTop={0}>
        <div style={{ 
          padding: '16px 24px', 
          marginBottom: 24, 
          background: '#fff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          zIndex: 5
        }}>
          <Row gutter={24} align="middle">
            <Col xs={24} sm={8}>
              <Input.Search
                placeholder="搜索图书或作者"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={value => handleSearch(value)}
                onChange={e => handleSearch(e.target.value)}
                value={searchQuery}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={16}>
              <Space wrap size="middle">
                {categories.map(category => (
                  <Button 
                    key={category.key}
                    type={categoryFilter === category.key ? 'primary' : 'default'}
                    icon={category.icon}
                    onClick={() => handleCategoryFilter(category.key)}
                    style={{ borderRadius: '16px' }}
                  >
                    {category.name}
                  </Button>
                ))}
              </Space>
            </Col>
          </Row>
        </div>
      </Affix>

      {/* 推荐图书 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <FireOutlined style={{ color: '#ff4d4f', fontSize: 24, marginRight: 8 }} />
          <Title level={4} style={{ margin: 0 }}>热门推荐</Title>
        </div>
        <Row gutter={[24, 16]}>
          {recommendedBooks.map(book => (
            <Col xs={24} sm={12} md={8} key={book.id}>
              <BookCard book={book} onAddToCart={handleAddToCart} />
            </Col>
          ))}
        </Row>
      </div>

      <Divider />

      {/* 图书列表 */}
      <div id="books-list">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <CrownOutlined style={{ color: '#faad14', fontSize: 24, marginRight: 8 }} />
          <Title level={4} style={{ margin: 0 }}>
            {categoryFilter !== 'all' 
              ? categories.find(c => c.key === categoryFilter)?.name || '全部图书' 
              : '全部图书'
            }
          </Title>
          <Text type="secondary" style={{ marginLeft: 16 }}>
            {filteredBooks.length} 种图书
          </Text>
        </div>
        <Row gutter={[24, 24]}>
          {filteredBooks.map(book => (
            <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
              <BookCard book={book} onAddToCart={handleAddToCart} />
            </Col>
          ))}
          {filteredBooks.length === 0 && (
            <Col span={24} style={{ textAlign: 'center', padding: '40px 0' }}>
              <BookOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <div style={{ marginTop: 16 }}>
                <Text>没有找到符合条件的图书</Text>
              </div>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default Home;