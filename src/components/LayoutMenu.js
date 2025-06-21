import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { HomeOutlined, ShoppingCartOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import logo from '../logo.svg';

const { Sider } = Layout;

const LayoutMenu = () => {
  return (
    <Sider 
      width={200} 
      style={{ 
        background: '#fff',
        overflow: 'hidden',
        height: '100vh',
        position: 'fixed',
        left: 0,
        zIndex: 10
      }}
    >
      <div style={{ height: '64px', margin: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src={logo} alt="书香世界" style={{ maxHeight: '64px', maxWidth: '100%' }} />
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        style={{ height: '100%' }}
      >
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link to="/">首页</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<ShoppingCartOutlined />}>
          <Link to="/cart">购物车</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<FileTextOutlined />}>
          <Link to="/orders">我的订单</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<UserOutlined />}>
          <Link to="/profile">个人中心</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default LayoutMenu;