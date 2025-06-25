import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col, Divider, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const { Title, Text } = Typography;

const Login = ({ onLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 设置页面标题
  useEffect(() => {
    document.title = '用户登录 - 书香世界在线图书商城';
  }, []);

  // 处理登录
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      // 清除之前的错误信息
      setLoginError(null);
      
      console.log('🔐 [Login] 开始登录...', { username: values.username });
      
      // 调用登录服务
      const result = await authService.login(values.username, values.password);
      console.log('🔐 [Login] 登录响应:', result);

      if (result.success) {
        message.success('登录成功！');
        
        // 调用父组件的登录回调，注意：用户数据在result.data中
        if (onLogin && result.data) {
          console.log('🔐 [Login] 调用onLogin回调...');
          await onLogin(result.data);  // 等待onLogin完成
          console.log('🔐 [Login] onLogin回调完成');
        }
        
        // 触发自定义登录成功事件，通知ProtectedRoute
        console.log('🔐 [Login] 触发登录成功事件...');
        window.dispatchEvent(new CustomEvent('loginSuccess'));
        
        // 稍微延迟后跳转，确保所有状态都已更新
        setTimeout(() => {
          console.log('🔐 [Login] 开始页面跳转...');
          // 获取重定向地址，默认跳转到首页
          const redirectTo = location.state?.from?.pathname || '/';
          console.log('🔐 [Login] 跳转到:', redirectTo);
          navigate(redirectTo, { replace: true });
        }, 300); // 增加延迟时间，确保状态同步
      } else {
        // 处理后端返回的登录失败 - 统一显示通用错误信息
        setLoginError({
          type: 'warning',
          title: '登录失败',
          message: '用户名或密码不正确，请检查输入'
        });
      }
    } catch (error) {
      console.error('❌ [Login] 登录失败:', error);
      
      const errorMessage = error.message || '';
      console.log('🔍 [Login] 错误信息:', errorMessage);
      console.log('🔍 [Login] 是否为禁用账户错误:', error.isAccountDisabled);
      
      // 使用特殊标记检查是否为账户禁用错误
      if (error.isAccountDisabled) {
        console.log('✅ [Login] 确认为禁用账户错误');
        setLoginError({
          type: 'error',
          title: '账户状态异常',
          message: errorMessage,
          description: '如需恢复账户使用，请联系客服或管理员处理。'
        });
      } else {
        console.log('❌ [Login] 确认为普通登录错误');
        // 所有其他错误统一显示通用信息
        setLoginError({
          type: 'warning',
          title: '登录失败',
          message: '用户名或密码不正确，请检查输入'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row justify="center" style={{ width: '100%', maxWidth: '1200px' }}>
        <Col xs={24} sm={16} md={12} lg={8} xl={6}>
          <Card
            style={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Logo和标题 */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <img 
                src="/logo.svg" 
                alt="书香世界" 
                style={{ height: 60, marginBottom: 16 }} 
              />
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                书香世界
              </Title>
              <Text type="secondary">在线图书商城</Text>
            </div>

            <Divider />

            {/* 登录错误提示 */}
            {loginError && (
              <Alert
                message={loginError.title}
                description={
                  <div>
                    <p style={{ marginBottom: loginError.description ? '8px' : '0' }}>
                      {loginError.message}
                    </p>
                    {loginError.description && (
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        {loginError.description}
                      </p>
                    )}
                  </div>
                }
                type={loginError.type}
                icon={<ExclamationCircleOutlined />}
                showIcon
                closable
                onClose={() => setLoginError(null)}
                style={{ marginBottom: 24 }}
              />
            )}

            {/* 登录表单 */}
            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              onFinishFailed={(errorInfo) => {
                console.log('表单验证失败:', errorInfo);
                setLoginError({
                  type: 'warning',
                  title: '登录失败',
                  message: '用户名或密码不正确，请检查输入'
                });
              }}
              layout="vertical"
              size="large"
              autoComplete="off"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  icon={<LoginOutlined />}
                  style={{ height: 45 }}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>

          

            {/* 注册链接 */}
            <Divider plain style={{ marginTop: 24, marginBottom: 16 }}>
              <Text type="secondary">还没有账号？</Text>
            </Divider>
            
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="link" 
                onClick={() => navigate('/register')}
                style={{ fontSize: '16px' }}
              >
                立即注册
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login; 