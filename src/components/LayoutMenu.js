import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, Divider } from 'antd';
import { HomeOutlined, ShoppingCartOutlined, UserOutlined, FileTextOutlined, LogoutOutlined, SettingOutlined, BookOutlined, BarChartOutlined, TeamOutlined } from '@ant-design/icons';
// logo现在在public目录中，直接使用public路径

const { Sider } = Layout;
const { Text } = Typography;

const LayoutMenu = ({ appData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, onLogout } = appData || {};
  
  // 管理菜单展开状态
  const [openKeys, setOpenKeys] = useState([]);
  
  // 根据用户角色和当前路径自动设置展开的菜单组
  useEffect(() => {
    const path = location.pathname;
    const isAdmin = currentUser?.role === 'ADMIN';
    
    if (isAdmin) {
      // 如果是管理员，始终展开管理员菜单组，方便访问
      setOpenKeys(['admin']);
    } else {
      // 非管理员用户不展开任何菜单组
      setOpenKeys([]);
    }
  }, [location.pathname, currentUser]);
  
  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['1'];
    if (path === '/cart') return ['2'];
    if (path === '/orders') return ['3'];
    if (path === '/profile') return ['4'];
    if (path === '/statistics') return ['5'];
    // 管理员菜单
    if (path === '/admin/users') return ['admin-1'];
    if (path === '/admin/books') return ['admin-2'];
    if (path === '/admin/orders') return ['admin-3'];
    if (path.startsWith('/book/')) return ['1']; // 图书详情页也高亮首页
    return ['1']; // 默认选中首页
  };
  
  // 处理菜单展开/收起
  const handleOpenChange = (keys) => {
    // 确保管理员菜单组只能有一个同时展开
    const isAdmin = currentUser?.role === 'ADMIN';
    if (isAdmin) {
      // 对于管理员，只保留最新打开的菜单组
      const newOpenKeys = keys.filter(key => key === 'admin');
      setOpenKeys(newOpenKeys);
    } else {
      setOpenKeys(keys);
    }
  };

  // 根据用户角色生成菜单项
  const getMenuItems = () => {
    const isAdmin = currentUser?.role === 'ADMIN';
    
    const baseMenuItems = [
      {
        key: '1',
        icon: <HomeOutlined />,
        label: <Link to="/">首页</Link>
      },
      {
        key: '2',
        icon: <ShoppingCartOutlined />,
        label: <Link to="/cart">购物车</Link>
      },
      {
        key: '3',
        icon: <FileTextOutlined />,
        label: <Link to="/orders">我的订单</Link>
      },
      {
        key: '4',
        icon: <UserOutlined />,
        label: <Link to="/profile">个人中心</Link>
      },
      {
        key: '5',
        icon: <BarChartOutlined />,
        label: <Link to="/statistics">数据统计</Link>
      }
    ];

    if (isAdmin) {
      return [
        ...baseMenuItems,
        {
          type: 'divider'
        },
        {
          key: 'admin',
          icon: <SettingOutlined />,
          label: '管理员功能',
          children: [
            {
              key: 'admin-1',
              icon: <TeamOutlined />,
              label: <Link to="/admin/users">用户管理</Link>
            },
            {
              key: 'admin-2',
              icon: <BookOutlined />,
              label: <Link to="/admin/books">书籍管理</Link>
            },
            {
              key: 'admin-3',
              icon: <FileTextOutlined />,
              label: <Link to="/admin/orders">订单管理</Link>
            }
          ]
        }
      ];
    }

    return baseMenuItems;
  };

  // 处理登出
  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    navigate('/login');
  };

  // 用户下拉菜单
  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: (
          <Link to="/profile">个人中心</Link>
        ),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

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
        <img src="/logo.svg" alt="书香世界" style={{ maxHeight: '64px', maxWidth: '100%' }} />
      </div>

      {currentUser && (
        <div style={{ 
          padding: '16px', 
          textAlign: 'center',
          background: '#f5f5f5',
          margin: '0 16px 16px',
          borderRadius: '8px'
        }}>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer' }}>
              <Avatar 
                size={40} 
                icon={<UserOutlined />} 
                style={{ marginBottom: 8 }}
              />
              <div>
                <Text strong style={{ fontSize: '14px' }}>
                  {currentUser.name || currentUser.username}
                </Text>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {currentUser.role === 'ADMIN' ? '管理员' : '用户'}
                  </Text>
                </div>
              </div>
            </div>
          </Dropdown>
        </div>
      )}

      <Divider style={{ margin: '0 16px 16px' }} />

      <Menu
        mode="inline"
        selectedKeys={getSelectedKey()}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        style={{ height: '100%', borderRight: 0 }}
        items={getMenuItems()}
      />
    </Sider>
  );
};

export default LayoutMenu;