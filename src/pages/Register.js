import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Divider, Radio } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '用户注册 - 书香世界';
  }, []);

  const handleRegister = async (values) => {
    try {
      setLoading(true);
      
      // 构建注册数据
      const registerData = {
        username: values.username,
        password: values.password,
        confirmPassword: values.confirmPassword,
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        gender: values.gender || null
      };
      
      // 调用注册服务
      const result = await authService.register(registerData);
      
      message.success(result.message || '注册成功！请登录');
      
      // 延迟跳转到登录页
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      message.error(error.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入密码'));
    }
    if (value.length < 6) {
      return Promise.reject(new Error('密码长度至少6位'));
    }
    if (value.length > 20) {
      return Promise.reject(new Error('密码长度不能超过20位'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('两次输入的密码不一致'));
    },
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            创建新账户
          </Title>
          <Text type="secondary">
            加入书香世界，开启您的阅读之旅
          </Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={handleRegister}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码（6-20位）"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              validateConfirmPassword
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请再次输入密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="真实姓名"
            rules={[
              { required: true, message: '请输入真实姓名' },
              { max: 50, message: '姓名最多50个字符' }
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="请输入真实姓名"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="请输入邮箱地址"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号码（选填）"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="请输入手机号码"
              autoComplete="tel"
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="性别（选填）"
          >
            <Radio.Group>
              <Radio value="MALE">男</Radio>
              <Radio value="FEMALE">女</Radio>
              <Radio value="OTHER">其他</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              style={{ height: 45 }}
            >
              立即注册
            </Button>
          </Form.Item>

          <Divider plain>或</Divider>

          <div style={{ textAlign: 'center' }}>
            <Space>
              <Text>已有账户？</Text>
              <Link to="/login">立即登录</Link>
            </Space>
          </div>
        </Form>

        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            注册即表示您同意我们的
            <a href="#terms" style={{ margin: '0 4px' }}>服务条款</a>
            和
            <a href="#privacy" style={{ margin: '0 4px' }}>隐私政策</a>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register; 