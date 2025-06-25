import apiClient from './api';
import authService from './authService';

// 购物车服务类
class CartService {
  // 获取当前用户ID
  getCurrentUserId() {
    const user = authService.getCurrentUser();
    return user ? user.id : null;
  }

  /**
   * 获取购物车列表
   * @returns {Promise<Array>} 购物车商品列表
   */
  async getCart() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }
      
      console.log('🛒 [CartService] 获取购物车 - 用户ID:', userId);
      const result = await apiClient.get(`/users/${userId}/cart`);
      
      // 调试：打印原始数据
      console.log('🛒 [CartService] 原始购物车数据:', result);
      console.log('🛒 [CartService] 数据类型:', typeof result);
      console.log('🛒 [CartService] 是否为数组:', Array.isArray(result));
      
      // 如果是数组，直接返回
      if (Array.isArray(result)) {
        console.log('🛒 [CartService] 购物车商品数量:', result.length);
        if (result.length > 0) {
          console.log('🛒 [CartService] 第一个商品结构:', result[0]);
        }
        return result;
      }
      
      // 如果不是数组，可能是包装在data字段中
      if (result && result.data && Array.isArray(result.data)) {
        console.log('🛒 [CartService] 从data字段获取购物车数据:', result.data);
        return result.data;
      }
      
      // 如果都不是，返回空数组
      console.warn('🛒 [CartService] 未知的购物车数据格式，返回空数组');
      return [];
    } catch (error) {
      console.error('获取购物车失败:', error);
      throw error;
    }
  }

  /**
   * 添加商品到购物车
   * @param {number} bookId - 图书ID
   * @param {number} quantity - 数量
   * @returns {Promise<Object>} 操作结果
   */
  async addToCart(bookId, quantity = 1) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }
      
      console.log(`➕ [CartService] 添加到购物车 - 用户ID: ${userId}, 图书ID: ${bookId}, 数量: ${quantity}`);
      return await apiClient.post(`/users/${userId}/cart`, { bookId, quantity });
      
      // 旧的模拟数据代码（已注释）
      /*
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`➕ [CartService] 添加到购物车 - 图书ID: ${bookId}, 数量: ${quantity} - 使用模拟数据`);
          resolve({ 
            success: true, 
            message: '添加到购物车成功' 
          });
        }, 100);
      });
      */
    } catch (error) {
      console.error(`添加到购物车失败 (图书ID: ${bookId}):`, error);
      throw error;
    }
  }

  /**
   * 更新购物车商品数量
   * @param {number} cartItemId - 购物车项ID
   * @param {number} quantity - 新数量
   * @returns {Promise<Object>} 操作结果
   */
  async updateCartItemQuantity(cartItemId, quantity) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }
      
      console.log(`🔄 [CartService] 更新购物车数量 - 用户ID: ${userId}, 项目ID: ${cartItemId}, 新数量: ${quantity}`);
      return await apiClient.put(`/users/${userId}/cart/${cartItemId}`, { quantity });
      
      // 旧的模拟数据代码（已注释）
      /*
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`🔄 [CartService] 更新购物车数量 - 项目ID: ${cartItemId}, 新数量: ${quantity} - 使用模拟数据`);
          resolve({ 
            success: true, 
            message: '更新数量成功' 
          });
        }, 100);
      });
      */
    } catch (error) {
      console.error(`更新购物车数量失败 (项目ID: ${cartItemId}):`, error);
      throw error;
    }
  }

  /**
   * 删除购物车商品
   * @param {number} cartItemId - 购物车项ID
   * @returns {Promise<Object>} 操作结果
   */
  async removeFromCart(cartItemId) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }
      
      console.log(`🗑️ [CartService] 删除购物车项 - 用户ID: ${userId}, 项目ID: ${cartItemId}`);
      return await apiClient.delete(`/users/${userId}/cart/${cartItemId}`);
      
      // 旧的模拟数据代码（已注释）
      /*
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`🗑️ [CartService] 删除购物车项 - 项目ID: ${cartItemId} - 使用模拟数据`);
          resolve({ 
            success: true, 
            message: '删除成功' 
          });
        }, 100);
      });
      */
    } catch (error) {
      console.error(`删除购物车项失败 (项目ID: ${cartItemId}):`, error);
      throw error;
    }
  }

  /**
   * 清空购物车
   * @returns {Promise<Object>} 操作结果
   */
  async clearCart() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }
      
      console.log('🧹 [CartService] 清空购物车 - 用户ID:', userId);
      return await apiClient.delete(`/users/${userId}/cart`);
      
      // 旧的模拟数据代码（已注释）
      /*
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('🧹 [CartService] 清空购物车 - 使用模拟数据');
          resolve({ 
            success: true, 
            message: '购物车已清空' 
          });
        }, 100);
      });
      */
    } catch (error) {
      console.error('清空购物车失败:', error);
      throw error;
    }
  }

  /**
   * 批量删除购物车项
   * @param {Array<number>} cartItemIds - 购物车项ID数组
   * @returns {Promise<Object>} 操作结果
   */
  async removeMultipleItems(cartItemIds) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }
      
      console.log(`🗑️ [CartService] 批量删除购物车项 - 用户ID: ${userId}, 数量: ${cartItemIds.length}`);
      return await apiClient.post(`/users/${userId}/cart/batch-delete`, { cartItemIds });
      
      // 旧的模拟数据代码（已注释）
      /*
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`🗑️ [CartService] 批量删除购物车项 - 数量: ${cartItemIds.length} - 使用模拟数据`);
          resolve({ 
            success: true, 
            message: `成功删除${cartItemIds.length}个商品` 
          });
        }, 100);
      });
      */
    } catch (error) {
      console.error('批量删除购物车项失败:', error);
      throw error;
    }
  }
}

// 创建服务实例
const cartService = new CartService();

export default cartService; 