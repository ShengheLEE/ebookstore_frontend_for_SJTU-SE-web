// API基础配置
const API_BASE_URL = 'http://localhost:8080/api';

// 通用的fetch封装函数
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // 获取默认请求头
  getDefaultHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // 动态获取用户ID
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          headers['X-User-Id'] = user.id.toString();
        }
      }
    } catch (error) {
      console.warn('⚠️ [ApiClient] 获取用户ID失败:', error);
    }

    return headers;
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers,
      },
      credentials: 'include', // 包含cookies以维持session
      ...options,
    };

    // 如果有body且不是FormData，则JSON序列化
    if (config.body && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`🌐 API请求: ${config.method || 'GET'} ${url}`);
      console.log(`📤 请求头:`, config.headers);
      
      const response = await fetch(url, config);
      
      console.log(`📥 响应状态: ${response.status} ${response.statusText}`);
      
      // 检查响应状态
      if (!response.ok) {
        // 如果是401未授权，可能需要重新登录
        if (response.status === 401) {
          console.warn('⚠️ [ApiClient] 未授权访问，可能需要重新登录');
          // 清除本地认证信息
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
          // 重定向到登录页面
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          throw new Error('未授权访问，请重新登录');
        }

        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ HTTP错误 ${response.status}:`, errorData);
        throw new Error(errorData.message || `HTTP错误: ${response.status}`);
      }

      // 如果响应为空，返回null
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`⚠️ 非JSON响应: ${contentType}`);
        return null;
      }

      const result = await response.json();
      console.log(`✅ API响应成功:`, result);
      console.log(`📊 响应数据类型:`, typeof result, `长度:`, Array.isArray(result) ? result.length : 'N/A');
      
      // 返回统一响应格式的data字段
      if (result && typeof result === 'object' && 'success' in result) {
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.message || 'API响应错误');
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ API请求失败:', error);
      throw error;
    }
  }

  // GET请求
  async get(endpoint, params = {}) {
    // 过滤掉undefined、null和空字符串的参数
    const filteredParams = {};
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        filteredParams[key] = value;
      }
    });
    
    const queryString = new URLSearchParams(filteredParams).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    console.log(`🔍 [API] GET请求URL: ${this.baseURL}${url}`);
    console.log(`🔍 [API] 原始参数:`, params);
    console.log(`🔍 [API] 过滤后参数:`, filteredParams);
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST请求
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // PUT请求
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  // DELETE请求
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// 创建API客户端实例
const apiClient = new ApiClient();

export default apiClient; 