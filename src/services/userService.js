import apiClient from './api';
import authService from './authService';

// 用户服务类
class UserService {
  // 获取当前用户ID
  getCurrentUserId() {
    const user = authService.getCurrentUser();
    return user ? user.id : null;
  }

  /**
   * 获取用户个人资料
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户资料
   */
  async getUserProfile(userId) {
    try {
      console.log(`👤 [UserService] 获取用户资料 - 用户ID: ${userId}`);
      return await apiClient.get(`/users/${userId}`);
    } catch (error) {
      console.error('获取用户资料失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户个人资料
   * @param {number} userId - 用户ID
   * @param {Object} profileData - 用户资料数据
   * @returns {Promise<Object>} 操作结果
   */
  async updateUserProfile(userId, profileData) {
    try {
      console.log(`✏️ [UserService] 更新用户资料 - 用户ID: ${userId}`, profileData);
      return await apiClient.put(`/users/${userId}`, profileData);
    } catch (error) {
      console.error('更新用户资料失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户收藏列表
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 收藏列表
   */
  async getUserFavorites(userId) {
    try {
      console.log(`❤️ [UserService] 获取用户收藏 - 用户ID: ${userId}`);
      return await apiClient.get(`/users/${userId}/favorites`);
    } catch (error) {
      console.error('获取用户收藏失败:', error);
      throw error;
    }
  }

  /**
   * 添加到收藏
   * @param {number} userId - 用户ID
   * @param {number} bookId - 图书ID
   * @returns {Promise<Object>} 操作结果
   */
  async addToFavorites(userId, bookId) {
    try {
      console.log(`➕ [UserService] 添加收藏 - 用户ID: ${userId}, 图书ID: ${bookId}`);
      return await apiClient.post(`/users/${userId}/favorites`, { bookId });
    } catch (error) {
      console.error('添加收藏失败:', error);
      throw error;
    }
  }

  /**
   * 从收藏中移除
   * @param {number} userId - 用户ID
   * @param {number} bookId - 图书ID
   * @returns {Promise<Object>} 操作结果
   */
  async removeFromFavorites(userId, bookId) {
    try {
      console.log(`➖ [UserService] 移除收藏 - 用户ID: ${userId}, 图书ID: ${bookId}`);
      return await apiClient.delete(`/users/${userId}/favorites/${bookId}`);
    } catch (error) {
      console.error('移除收藏失败:', error);
      throw error;
    }
  }

  /**
   * 获取个人购书统计
   * @param {number} userId - 用户ID
   * @param {Object} params - 查询参数
   * @param {string} params.startDate - 开始日期 (yyyy-MM-dd)
   * @param {string} params.endDate - 结束日期 (yyyy-MM-dd)
   * @returns {Promise<Object>} 个人统计数据
   */
  async getPersonalStats(userId, params = {}) {
    try {
      console.log(`📊 [UserService] 获取个人统计 - 用户ID: ${userId}`, params);
      return await apiClient.get(`/users/${userId}/statistics`, params);
    } catch (error) {
      console.error('获取个人统计失败:', error);
      throw error;
    }
  }

  // =================== 管理员专用方法 ===================

  /**
   * 获取所有用户（管理员权限）
   * @param {Object} params - 查询参数
   * @returns {Promise<Array>} 用户列表
   */
  async getAllUsers(params = {}) {
    try {
      console.log('👥 [UserService] 获取所有用户（管理员）', params);
      const result = await apiClient.get('/admin/users', params);
      
      // 调试：检查返回的用户数据结构
      console.log('🔍 [UserService] 获取用户列表原始响应:', result);
      if (result && Array.isArray(result) && result.length > 0) {
        console.log('🔍 [UserService] 用户数据字段:', Object.keys(result[0]));
        console.log('🔍 [UserService] 第一个用户完整数据:', result[0]);
      }
      
      return result;
    } catch (error) {
      console.error('获取所有用户失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户状态（管理员权限）
   * @param {number} userId - 用户ID
   * @param {string} status - 新状态 (ACTIVE | INACTIVE | SUSPENDED)
   * @returns {Promise<Object>} 操作结果
   */
  async updateUserStatus(userId, status) {
    try {
      console.log(`🔄 [UserService] 更新用户状态 - 用户ID: ${userId}, 状态: ${status}`);
      return await apiClient.put(`/admin/users/${userId}/status`, { status });
    } catch (error) {
      console.error('更新用户状态失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息（管理员权限）
   * @param {number} userId - 用户ID
   * @param {Object} userData - 用户数据
   * @param {string} userData.name - 姓名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.role - 角色 (USER | ADMIN)
   * @returns {Promise<Object>} 操作结果
   */
  async updateUser(userId, userData) {
    try {
      console.log(`✏️ [UserService] 更新用户信息（管理员） - 用户ID: ${userId}`, userData);
      return await apiClient.put(`/admin/users/${userId}`, userData);
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }
}

// 创建服务实例
const userService = new UserService();

export default userService; 