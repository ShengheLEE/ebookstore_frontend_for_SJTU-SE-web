import apiClient from './api';

// 认证服务类
class AuthService {
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 登录结果
   */
  async login(username, password) {
    try {
      console.log('🔐 [AuthService] 用户登录:', { username });
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // 包含cookies以维持session
      });

      const result = await response.json();
      
      console.log('🔍 [AuthService] 响应状态:', response.status);
      console.log('🔍 [AuthService] 响应成功:', response.ok);
      console.log('🔍 [AuthService] 结果成功:', result.success);
      console.log('🔍 [AuthService] 结果消息:', result.message);
      console.log('🔍 [AuthService] 完整结果:', result);
      
      if (response.ok && result.success) {
        // 存储用户信息到localStorage，注意：用户数据在result.data中
        const userData = result.data || result.user; // 兼容不同的响应格式
        
        console.log('🔍 [AuthService] 用户数据:', userData);
        
        // 检查用户状态
        if (userData && (userData.status === 'INACTIVE' || userData.status === 'DISABLED')) {
          console.log('✅ [AuthService] 检测到用户状态禁用:', userData.status);
          const error = new Error('账户已被禁用，请联系管理员');
          error.isAccountDisabled = true; // 添加特殊标记
          throw error;
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        console.log('✅ [AuthService] 登录成功:', userData);
        return result;
      } else {
        // 处理登录失败的情况
        const errorMessage = result.message || '';
        console.log('❌ [AuthService] 登录失败，错误信息:', errorMessage);
        
        // 检查是否为账户禁用错误（多种方式检查）
        const isDisabledAccount = response.status === 403 || 
                                  errorMessage.includes('禁用') || 
                                  errorMessage.includes('disabled') || 
                                  errorMessage.includes('DISABLED') || 
                                  errorMessage.includes('INACTIVE') ||
                                  errorMessage.includes('管理员');
        
        if (isDisabledAccount) {
          console.log('✅ [AuthService] 确认为禁用账户错误');
          const error = new Error(errorMessage || '账户已被禁用，请联系管理员');
          error.isAccountDisabled = true; // 添加特殊标记
          throw error;
        } else {
          console.log('❌ [AuthService] 确认为普通登录错误');
          throw new Error('用户名或密码不正确，请检查输入');
        }
      }
    } catch (error) {
      console.error('❌ [AuthService] 登录失败:', error);
      throw error;
    }
  }

  /**
   * 用户注册
   * @param {Object} registerData - 注册信息
   * @returns {Promise<Object>} 注册结果
   */
  async register(registerData) {
    try {
      console.log('📝 [AuthService] 用户注册:', { username: registerData.username, email: registerData.email });
      
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(registerData),
        credentials: 'include'
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ [AuthService] 注册成功:', result.message);
        return result;
      } else {
        throw new Error(result.message || '注册失败');
      }
    } catch (error) {
      console.error('❌ [AuthService] 注册失败:', error);
      throw error;
    }
  }

  /**
   * 用户登出
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      console.log('🚪 [AuthService] 用户登出');
      
      // 调用后端登出API
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // 清除本地存储
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      
      console.log('✅ [AuthService] 登出成功');
    } catch (error) {
      console.error('❌ [AuthService] 登出失败:', error);
      // 即使API调用失败，也要清除本地存储
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
    }
  }

  /**
   * 检查用户是否已登录
   * @returns {boolean}
   */
  isAuthenticated() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = this.getCurrentUser();
    return isLoggedIn && user !== null;
  }

  /**
   * 获取当前登录用户信息
   * @returns {Object|null}
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ [AuthService] 获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 验证当前session是否有效
   * @returns {Promise<boolean>}
   */
  async validateSession() {
    try {
      console.log('🔍 [AuthService] 验证session');
      
      const response = await fetch('http://localhost:8080/api/auth/validate', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // 更新本地用户信息，兼容不同的响应格式
          const userData = result.data || result.user;
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            return true;
          }
        }
      }
      
      // session无效，清除本地存储
      this.clearLocalAuth();
      return false;
    } catch (error) {
      console.error('❌ [AuthService] session验证失败:', error);
      this.clearLocalAuth();
      return false;
    }
  }

  /**
   * 清除本地认证信息
   */
  clearLocalAuth() {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  }

  /**
   * 获取认证头部
   * @returns {Object}
   */
  getAuthHeaders() {
    const user = this.getCurrentUser();
    return user ? {
      'X-User-Id': user.id.toString()
    } : {};
  }
}

// 创建服务实例
const authService = new AuthService();

export default authService; 