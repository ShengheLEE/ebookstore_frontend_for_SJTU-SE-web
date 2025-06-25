import apiClient from './api';
import authService from './authService';

// 订单服务类
class OrderService {
  // 获取当前用户ID
  getCurrentUserId() {
    const user = authService.getCurrentUser();
    return user ? user.id : null;
  }

  /**
   * 创建订单
   * @param {Array<number>} cartItemIds - 选中的购物车项ID数组
   * @param {Object} receiverInfo - 收货信息
   * @param {string} receiverInfo.receiverName - 收货人姓名
   * @param {string} receiverInfo.receiverPhone - 收货人电话
   * @param {string} receiverInfo.receiverAddress - 收货地址
   * @param {string} receiverInfo.remark - 订单备注
   * @returns {Promise<Object>} 创建结果
   */
  async createOrder(cartItemIds, receiverInfo = {}) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }
      
      console.log(`📦 [OrderService] 创建订单 - 用户ID: ${userId}, 商品数量: ${cartItemIds.length}`);
      console.log(`📦 [OrderService] 购物车项ID:`, cartItemIds);
      console.log(`📦 [OrderService] 收货信息:`, receiverInfo);
      
      // 构建完整的请求数据，包含必需的收货信息
      const requestData = {
        cartItemIds,
        receiverName: receiverInfo.receiverName || '默认收货人',
        receiverPhone: receiverInfo.receiverPhone || '13800000000',
        receiverAddress: receiverInfo.receiverAddress || '默认地址',
        remark: receiverInfo.remark || ''
      };
      console.log(`📦 [OrderService] 完整请求数据:`, requestData);
      
      const result = await apiClient.post(`/users/${userId}/orders`, requestData);
      
      console.log(`📦 [OrderService] API返回原始结果:`, result);
      console.log(`📦 [OrderService] 结果类型:`, typeof result);
      console.log(`📦 [OrderService] 结果是否为空:`, result == null);
      
      // 如果result是null或undefined，返回一个默认的成功对象
      if (result == null) {
        console.log(`📦 [OrderService] API返回空值，假设创建成功`);
        return { success: true, message: '订单创建成功' };
      }
      
      // 如果result是对象，检查其属性
      if (typeof result === 'object') {
        console.log(`📦 [OrderService] 结果对象属性:`, Object.keys(result));
        
        // 如果有success字段，使用它
        if ('success' in result) {
          console.log(`📦 [OrderService] 使用success字段:`, result.success);
          return result;
        }
        
        // 如果没有success字段但有data字段，包装一下
        if ('data' in result) {
          console.log(`📦 [OrderService] 从data字段提取数据:`, result.data);
          return { success: true, data: result.data, message: '订单创建成功' };
        }
        
        // 如果是非空对象，假设成功
        if (Object.keys(result).length > 0) {
          console.log(`📦 [OrderService] 非空对象，假设成功`);
          return { success: true, data: result, message: '订单创建成功' };
        }
      }
      
      // 如果result是字符串或数字，假设成功
      if (typeof result === 'string' || typeof result === 'number') {
        console.log(`📦 [OrderService] 原始类型结果，假设成功:`, result);
        return { success: true, data: result, message: '订单创建成功' };
      }
      
      // 其他情况，假设成功（因为没有抛出异常）
      console.log(`📦 [OrderService] 其他情况，假设创建成功`);
      return { success: true, message: '订单创建成功' };
      
    } catch (error) {
      console.error('创建订单失败:', error);
      throw error;
    }
  }

  /**
   * 获取订单列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页数量
   * @param {string} params.status - 订单状态筛选
   * @returns {Promise<Array>} 订单列表
   */
  async getOrders(params = {}) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }
      
      console.log('📋 [OrderService] 获取订单列表 - 用户ID:', userId);
      console.log('📋 [OrderService] 查询参数:', params);
      
      const result = await apiClient.get(`/users/${userId}/orders`, params);
      
      console.log('📋 [OrderService] API返回原始结果:', result);
      console.log('📋 [OrderService] 结果类型:', typeof result);
      console.log('📋 [OrderService] 是否为数组:', Array.isArray(result));
      
      if (Array.isArray(result)) {
        console.log('📋 [OrderService] 订单数量:', result.length);
        if (result.length > 0) {
          console.log('📋 [OrderService] 第一个订单示例:', result[0]);
          console.log('📋 [OrderService] 订单字段:', Object.keys(result[0]));
        }
        return result;
             } else if (result && typeof result === 'object') {
         // 如果返回的是对象，可能包含在data字段中
         console.log('📋 [OrderService] 返回对象，检查data字段');
         console.log('📋 [OrderService] 对象键:', Object.keys(result));
         console.log('📋 [OrderService] 完整对象结构:', JSON.stringify(result, null, 2));
         
         // 检查所有可能的字段名
         const possibleArrayFields = ['data', 'orders', 'orderList', 'items', 'content', 'list', 'results'];
         let foundArray = null;
         let foundFieldName = null;
         
         for (const fieldName of possibleArrayFields) {
           if (result[fieldName] && Array.isArray(result[fieldName])) {
             foundArray = result[fieldName];
             foundFieldName = fieldName;
             console.log(`📋 [OrderService] 在字段 "${fieldName}" 中找到订单数组，数量:`, foundArray.length);
             break;
           }
         }
         
         if (foundArray) {
           return foundArray;
         } else {
           // 检查每个字段的类型和值
           Object.keys(result).forEach(key => {
             const value = result[key];
             console.log(`📋 [OrderService] 字段 "${key}": 类型=${typeof value}, 是否为数组=${Array.isArray(value)}, 值=`, value);
           });
           
           console.warn('📋 [OrderService] 未找到订单数组，返回空数组');
           console.warn('📋 [OrderService] 尝试的字段名:', possibleArrayFields);
           return [];
         }
      } else {
        console.warn('📋 [OrderService] 返回数据格式异常:', result);
        return [];
      }
      
      // 旧的模拟数据代码（已注释）
      /*
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('📋 [OrderService] 获取订单列表 - 使用模拟数据');
          resolve([]);
        }, 100);
      });
      */
    } catch (error) {
      console.error('📋 [OrderService] 获取订单列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取订单详情
   * @param {string} orderId - 订单ID
   * @returns {Promise<Object>} 订单详情
   */
  async getOrderById(orderId) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }
      
      console.log(`📄 [OrderService] 获取订单详情 - 用户ID: ${userId}, 订单号: ${orderId}`);
      return await apiClient.get(`/users/${userId}/orders/${orderId}`);
      
      // 旧的模拟数据代码（已注释）
      /*
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`📄 [OrderService] 获取订单详情 - 订单号: ${orderId} - 使用模拟数据`);
          resolve(null);
        }, 100);
      });
      */
    } catch (error) {
      console.error(`获取订单详情失败 (订单号: ${orderId}):`, error);
      throw error;
    }
  }

  /**
   * 更新订单状态
   * @param {string} orderId - 订单ID
   * @param {string} status - 新状态 (待发货/已发货/已完成/已取消)
   * @returns {Promise<Object>} 操作结果
   */
  async updateOrderStatus(orderId, status) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }
      
      console.log(`🔄 [OrderService] 更新订单状态 - 用户ID: ${userId}, 订单号: ${orderId}, 新状态: ${status}`);
      return await apiClient.put(`/users/${userId}/orders/${orderId}/status`, { status });
      
      // 旧的模拟数据代码（已注释）
      /*
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`🔄 [OrderService] 更新订单状态 - 订单号: ${orderId}, 新状态: ${status} - 使用模拟数据`);
          resolve({ 
            success: true, 
            message: '订单状态更新成功' 
          });
        }, 100);
      });
      */
    } catch (error) {
      console.error(`更新订单状态失败 (订单号: ${orderId}):`, error);
      throw error;
    }
  }

  /**
   * 取消订单
   * @param {string} orderId - 订单ID
   * @returns {Promise<Object>} 操作结果
   */
  async cancelOrder(orderId) {
    try {
      return await this.updateOrderStatus(orderId, '已取消');
    } catch (error) {
      console.error(`取消订单失败 (订单号: ${orderId}):`, error);
      throw error;
    }
  }

  /**
   * 确认收货
   * @param {string} orderId - 订单ID
   * @returns {Promise<Object>} 操作结果
   */
  async confirmOrder(orderId) {
    try {
      return await this.updateOrderStatus(orderId, '已完成');
    } catch (error) {
      console.error(`确认收货失败 (订单号: ${orderId}):`, error);
      throw error;
    }
  }

  /**
   * 获取订单统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getOrderStats() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }
      
      console.log('📊 [OrderService] 获取订单统计 - 用户ID:', userId);
      return await apiClient.get(`/users/${userId}/orders/stats`);
      
      // 旧的模拟数据代码（已注释）
      /*
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('📊 [OrderService] 获取订单统计 - 使用模拟数据');
          resolve({
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0,
            totalAmount: 0
          });
        }, 100);
      });
      */
    } catch (error) {
      console.error('获取订单统计失败:', error);
      throw error;
    }
  }

  // =================== 管理员专用方法 ===================

  /**
   * 获取所有订单（管理员权限）
   * @param {Object} params - 查询参数
   * @param {string} params.startDate - 开始日期 (yyyy-MM-dd)
   * @param {string} params.endDate - 结束日期 (yyyy-MM-dd)
   * @param {string} params.status - 订单状态
   * @param {string} params.keyword - 搜索关键词
   * @returns {Promise<Array>} 订单列表
   */
  async getAllOrdersForAdmin(params = {}) {
    try {
      console.log('📋 [OrderService] 获取所有订单（管理员）', params);
      return await apiClient.get('/admin/orders', params);
    } catch (error) {
      console.error('获取所有订单失败:', error);
      throw error;
    }
  }

  /**
   * 获取订单详情（管理员权限）
   * @param {string} orderId - 订单ID
   * @returns {Promise<Object>} 订单详情
   */
  async getOrderByIdForAdmin(orderId) {
    try {
      console.log(`📄 [OrderService] 获取订单详情（管理员） - 订单号: ${orderId}`);
      return await apiClient.get(`/admin/orders/${orderId}`);
    } catch (error) {
      console.error(`获取订单详情失败 (订单号: ${orderId}):`, error);
      throw error;
    }
  }

  /**
   * 更新订单状态（管理员权限）
   * @param {string} orderId - 订单ID
   * @param {string} status - 新状态
   * @returns {Promise<Object>} 操作结果
   */
  async updateOrderStatusForAdmin(orderId, status) {
    try {
      console.log(`🔄 [OrderService] 更新订单状态（管理员） - 订单号: ${orderId}, 新状态: ${status}`);
      return await apiClient.put(`/admin/orders/${orderId}/status`, { status });
    } catch (error) {
      console.error(`更新订单状态失败 (订单号: ${orderId}):`, error);
      throw error;
    }
  }
}

// 创建服务实例
const orderService = new OrderService();

export default orderService; 