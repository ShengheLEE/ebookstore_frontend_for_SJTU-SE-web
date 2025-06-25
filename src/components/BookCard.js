import React, { useState } from 'react';
import { Card, Typography, Button, message, Rate, Tag } from 'antd';
import { ShoppingCartOutlined, BookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Meta } = Card;

const BookCard = ({ book, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const addToCart = async () => {
    try {
      // 检查是否为售罄状态或库存为0
      if (book.status === 'OUT_OF_STOCK' || book.stock <= 0) {
        message.error('该图书已售罄');
        return;
      }
      
      await onAddToCart(book);
      // message已在onAddToCart中显示，这里不重复显示
    } catch (error) {
      console.error('添加到购物车失败:', error);
      // 错误信息已在onAddToCart中处理
    }
  };

  // 随机生成评分和销量数据（实际项目中应从后端获取）
  const rating = (3 + Math.random() * 2).toFixed(1);
  const sales = Math.floor(Math.random() * 500) + 50;

  return (
    <Card
      hoverable
      style={{ 
        width: '100%', 
        transition: 'all 0.3s',
        transform: hovered ? 'translateY(-5px)' : 'none',
        boxShadow: hovered ? '0 8px 16px rgba(0,0,0,0.09)' : '0 2px 8px rgba(0,0,0,0.06)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      cover={
        <div style={{ 
          padding: '16px 16px 8px', 
          background: '#f5f5f5',
          height: 0,
          paddingBottom: '150%', // 维持2:3的宽高比
          position: 'relative',
          overflow: 'hidden'
        }}>
          {imageError ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              background: '#f5f5f5',
              padding: '20px'
            }}>
              <BookOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
              <Text type="secondary" style={{ marginTop: 8 }}>图片加载失败</Text>
            </div>
          ) : (
            <Link to={`/book/${book.id}`}>
              <div style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
              }}>
                <img
                  className="refreshable-image"
                  src={book.coverImage}
                  alt={book.title}
                  onError={handleImageError}
                  loading="lazy"
                  style={{ 
                    width: '90%', 
                    height: 'auto',
                    objectFit: 'cover',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s',
                    transform: hovered ? 'scale(1.05)' : 'scale(1)',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </Link>
          )}
          
          {/* 标签和销量 */}
          <div style={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            zIndex: 2 
          }}>
            {book.status === 'OUT_OF_STOCK' && (
              <Tag color="red" style={{ marginBottom: 5 }}>
                售罄
              </Tag>
            )}
            {book.status !== 'OUT_OF_STOCK' && book.stock < 5 && book.stock > 0 && (
              <Tag color="orange" style={{ marginBottom: 5 }}>
                库存紧张
              </Tag>
            )}
          </div>
        </div>
      }
      actions={[
        <Rate disabled defaultValue={parseFloat(rating)} allowHalf style={{ fontSize: 12 }} />,
        <Button 
          type="primary" 
          icon={<ShoppingCartOutlined />} 
          disabled={book.status === 'OUT_OF_STOCK' || book.stock <= 0}
          onClick={addToCart}
          block
        >
          {book.status === 'OUT_OF_STOCK' || book.stock <= 0 ? '售罄' : '加入购物车'}
        </Button>
      ]}
    >
      <Meta
        title={
          <Link to={`/book/${book.id}`} style={{ color: 'inherit' }}>
            <Title level={5} ellipsis={{ rows: 2 }} style={{ marginBottom: 4 }}>
              {book.title}
            </Title>
          </Link>
        }
        description={
          <div>
            <Text type="secondary" ellipsis style={{ display: 'block' }}>
              {book.author}
            </Text>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <Text type="danger" strong>¥{(book.price || 0).toFixed(2)}</Text>
              <Text type="secondary">{sales}人已购买</Text>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default BookCard;
