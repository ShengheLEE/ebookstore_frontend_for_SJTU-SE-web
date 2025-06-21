import React from 'react';
import { Card, Avatar, Typography, List, Button, Tabs, Badge, Empty } from 'antd';
import { UserOutlined, HeartOutlined, HistoryOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import store from '../data/store';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const User = () => {
  const favorites = store.favorites || [];
  
  // 模拟订单数据
  const orders = [
    { id: 1, date: '2023-05-15', status: '已完成', total: 158.0, items: 3 },
    { id: 2, date: '2023-06-20', status: '已发货', total: 99.8, items: 2 },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar size={80} icon={<UserOutlined />} />
          <div style={{ marginLeft: 20 }}>
            <Title level={4} style={{ margin: 0 }}>游客用户</Title>
            <Text type="secondary">欢迎来到书城</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary">编辑资料</Button>
              <Button style={{ marginLeft: 8 }} icon={<SettingOutlined />}>设置</Button>
              <Button type="link" danger icon={<LogoutOutlined />}>退出登录</Button>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultActiveKey="favorites">
        <TabPane 
          tab={
            <span>
              <HeartOutlined />
              我的收藏
            </span>
          } 
          key="favorites"
        >
          <Card>
            {favorites.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={favorites}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Link to={`/book/${item.id}`}>
                        <Button type="link">查看详情</Button>
                      </Link>,
                      <Button type="text" danger onClick={() => {}}>
                        取消收藏
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={<Link to={`/book/${item.id}`}>{item.title}</Link>}
                      description={item.author}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="您还没有收藏任何图书" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <HistoryOutlined />
              订单历史
            </span>
          } 
          key="orders"
        >
          <Card>
            {orders.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={orders}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button type="link">查看详情</Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={`订单 #${item.id}`}
                      description={`下单日期: ${item.date} · ${item.items} 件商品`}
                    />
                    <div>
                      <Badge status={item.status === '已完成' ? 'success' : 'processing'} text={item.status} style={{ marginRight: 16 }} />
                      <Text type="danger" strong>¥{item.total.toFixed(2)}</Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="您还没有任何订单" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default User; 