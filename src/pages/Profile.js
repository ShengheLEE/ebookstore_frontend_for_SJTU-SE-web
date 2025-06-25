import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, Typography, Avatar, List, Tag, message, Empty } from 'antd';
import { UserOutlined, LockOutlined, HistoryOutlined, HeartOutlined, ShoppingOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/dateUtils';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Profile = ({ appData }) => {
  const { userInfo, favorites, updateUserInfo, updateFavorites, orders, services, userId } = appData;
  const [activeTab, setActiveTab] = useState('profile');
  const [form] = Form.useForm();

  // 设置页面标题
  useEffect(() => {
    document.title = '个人中心 - 书香世界在线图书商城';
  }, []);

  const handleUpdateProfile = async (values) => {
    try {
      console.log('✏️ [Profile] 更新用户信息', values);
      await updateUserInfo({ ...userInfo, ...values });
      message.success('个人信息已更新');
    } catch (error) {
      console.error('更新用户信息失败:', error);
      message.error('更新个人信息失败');
    }
  };

  const handleUpdatePassword = async (values) => {
    try {
      console.log('🔐 [Profile] 修改密码');
      await services.userService.changePassword(userId, values.oldPassword, values.newPassword);
      message.success('密码已更新');
    } catch (error) {
      console.error('修改密码失败:', error);
      message.error('修改密码失败');
    }
  };

  const handleRemoveFavorite = async (id) => {
    try {
      console.log(`💔 [Profile] 移除收藏 - ID: ${id}`);
      await updateFavorites('remove', id);
      message.success('已从收藏中移除');
    } catch (error) {
      console.error('移除收藏失败:', error);
      message.error('移除收藏失败');
    }
  };

  return (
    <div>
      <Title level={2}>个人中心</Title>
      
      <Card style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', marginBottom: 24 }}>
          <Avatar size={64} icon={<UserOutlined />} />
          <div style={{ marginLeft: 16 }}>
            <Title level={4}>{userInfo.name}</Title>
            <Text type="secondary">{userInfo.email}</Text>
          </div>
        </div>
        
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                个人信息
              </span>
            }
            key="1"
          >
            <Form
              layout="vertical"
              initialValues={userInfo}
              onFinish={handleUpdateProfile}
            >
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="电子邮箱"
                rules={[
                  { required: true, message: '请输入电子邮箱' },
                  { type: 'email', message: '电子邮箱格式不正确' }
                ]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="phone"
                label="手机号码"
                rules={[{ required: true, message: '请输入手机号码' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="address"
                label="收货地址"
              >
                <Input.TextArea rows={3} />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  更新信息
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <LockOutlined />
                修改密码
              </span>
            }
            key="2"
          >
            <Form
              layout="vertical"
              onFinish={handleUpdatePassword}
            >
              <Form.Item
                name="oldPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[{ required: true, message: '请输入新密码' }]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  更新密码
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                订单历史
              </span>
            }
            key="3"
          >
            {orders.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={orders}
                renderItem={order => (
                  <List.Item
                    key={order.id}
                    extra={
                      <Tag color={order.status === '已完成' ? 'green' : 'blue'}>
                        {order.status === '已完成' ? 
                          <CheckCircleOutlined /> : 
                          <ClockCircleOutlined />
                        } {order.status}
                      </Tag>
                    }
                  >
                    <List.Item.Meta
                      title={`订单 ${order.id}`}
                      description={`下单时间: ${formatDateTime(order.orderTime)} | 总价: ￥${(order.totalAmount || 0).toFixed(2)}`}
                    />
                    <div>
                      {order.items.map(item => (
                        <div key={item.id} style={{ margin: '8px 0' }}>
                          <Link to={`/book/${item.id}`}>{item.title}</Link> x {item.quantity} (￥{(item.price || 0).toFixed(2)}/本)
                        </div>
                      ))}
                    </div>
                  </List.Item>
                )}
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
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <HeartOutlined />
                我的收藏
              </span>
            }
            key="4"
          >
            <List
              itemLayout="horizontal"
              dataSource={favorites}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button key="view" type="link">
                      <Link to={`/book/${item.id}`}>查看</Link>
                    </Button>,
                    <Button 
                      key="remove" 
                      type="link" 
                      danger
                      onClick={() => handleRemoveFavorite(item.id)}
                    >
                      移除
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<HeartOutlined />} style={{ backgroundColor: '#ff4d4f' }} />}
                    title={item.title}
                    description={`作者: ${item.author}`}
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;