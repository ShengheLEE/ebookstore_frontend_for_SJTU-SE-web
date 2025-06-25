import apiClient from './api';
import authService from './authService';

// 统计服务类
class StatisticsService {
  // 获取当前用户ID
  getCurrentUserId() {
    const user = authService.getCurrentUser();
    return user ? user.id : null;
  }

  /**
   * 获取图书销量统计（管理员权限）
   * @param {Object} params - 查询参数
   * @param {string} params.startDate - 开始日期 (yyyy-MM-dd)
   * @param {string} params.endDate - 结束日期 (yyyy-MM-dd)
   * @returns {Promise<Array>} 图书销量统计数据
   */
  async getBookSalesStats(params = {}) {
    try {
      console.log('📊 [StatisticsService] 获取图书销量统计', params);
      return await apiClient.get('/admin/statistics/book-sales', params);
    } catch (error) {
      console.error('获取图书销量统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户消费统计（管理员权限）
   * @param {Object} params - 查询参数
   * @param {string} params.startDate - 开始日期 (yyyy-MM-dd)
   * @param {string} params.endDate - 结束日期 (yyyy-MM-dd)
   * @returns {Promise<Array>} 用户消费统计数据
   */
  async getUserConsumptionStats(params = {}) {
    try {
      console.log('📊 [StatisticsService] 获取用户消费统计', params);
      return await apiClient.get('/admin/statistics/user-consumption', params);
    } catch (error) {
      console.error('获取用户消费统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取订单统计信息（管理员权限）
   * @param {Object} params - 查询参数
   * @param {string} params.startDate - 开始日期 (yyyy-MM-dd)
   * @param {string} params.endDate - 结束日期 (yyyy-MM-dd)
   * @returns {Promise<Object>} 订单统计数据
   */
  async getOrderStats(params = {}) {
    try {
      console.log('📊 [StatisticsService] 获取订单统计', params);
      return await apiClient.get('/admin/statistics/orders', params);
    } catch (error) {
      console.error('获取订单统计失败:', error);
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
      console.log(`📊 [StatisticsService] 获取个人统计 - 用户ID: ${userId}`, params);
      return await apiClient.get(`/users/${userId}/statistics`, params);
    } catch (error) {
      console.error('获取个人统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取平台总体统计（管理员权限）
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 平台统计数据
   */
  async getPlatformStats(params = {}) {
    try {
      console.log('📊 [StatisticsService] 获取平台统计', params);
      return await apiClient.get('/admin/statistics/platform', params);
    } catch (error) {
      console.error('获取平台统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取销售趋势数据（管理员权限）
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期 (day|week|month|year)
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise<Array>} 销售趋势数据
   */
  async getSalesTrends(params = {}) {
    try {
      console.log('📊 [StatisticsService] 获取销售趋势', params);
      return await apiClient.get('/admin/statistics/sales-trends', params);
    } catch (error) {
      console.error('获取销售趋势失败:', error);
      throw error;
    }
  }
}

// 创建服务实例
const statisticsService = new StatisticsService();

export default statisticsService; 