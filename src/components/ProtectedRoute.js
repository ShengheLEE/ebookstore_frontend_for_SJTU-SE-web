import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin, Layout } from 'antd';
import authService from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null表示检查中
  const [isValidating, setIsValidating] = useState(true);
  const location = useLocation();

  useEffect(() => {
    validateAuth();
    
    // 监听localStorage变化
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'isLoggedIn') {
        console.log('🔐 [ProtectedRoute] 检测到认证状态变化，重新验证...');
        validateAuth();
      }
    };

    // 监听自定义登录事件
    const handleLoginSuccess = () => {
      console.log('🔐 [ProtectedRoute] 收到登录成功事件，重新验证...');
      setTimeout(() => {
        validateAuth();
      }, 200); // 稍微延迟确保localStorage已更新
    };

    // 添加事件监听器
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('loginSuccess', handleLoginSuccess);

    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);

  const validateAuth = async () => {
    try {
      setIsValidating(true);
      console.log('🔐 [ProtectedRoute] 开始验证认证状态...');
      
      // 首先检查本地存储
      const localAuth = authService.isAuthenticated();
      console.log('🔐 [ProtectedRoute] 本地认证状态:', localAuth);
      
      if (!localAuth) {
        // 本地没有认证信息，直接跳转登录
        console.log('🔐 [ProtectedRoute] 本地无认证信息，跳转登录');
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // 尝试验证session是否有效
      try {
        const sessionValid = await authService.validateSession();
        console.log('🔐 [ProtectedRoute] Session验证结果:', sessionValid);
        setIsAuthenticated(sessionValid);
      } catch (error) {
        // 如果validateSession失败（可能是接口不存在），但本地有认证信息，仍然允许访问
        console.warn('⚠️ [ProtectedRoute] Session验证失败，使用本地认证状态:', error);
        setIsAuthenticated(localAuth);
      }
    } catch (error) {
      console.error('❌ [ProtectedRoute] 认证验证失败:', error);
      setIsAuthenticated(false);
    } finally {
      setIsValidating(false);
    }
  };

  // 正在验证中，显示加载状态
  if (isValidating || isAuthenticated === null) {
    return (
      <Layout style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, fontSize: '16px', color: '#666' }}>
            🔐 正在验证登录状态...
          </div>
        </div>
      </Layout>
    );
  }

  // 未认证，重定向到登录页
  if (!isAuthenticated) {
    console.log('🔐 [ProtectedRoute] 未认证，重定向到登录页');
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // 已认证，渲染子组件
  console.log('🔐 [ProtectedRoute] 已认证，渲染子组件');
  return children;
};

export default ProtectedRoute; 