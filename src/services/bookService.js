import apiClient from './api';

// 图书服务类
class BookService {
  /**
   * 获取所有图书列表（不使用分页）
   * @returns {Promise<Array>} 图书列表
   */
  async getAllBooks() {
    try {
      console.log('📚 [BookService] 获取所有图书列表（无分页参数）');
      
      const result = await apiClient.get('/books');
      
      // 调试：打印原始数据
      console.log('📚 [BookService] 原始图书数据（无分页）:', result);
      console.log('📚 [BookService] 数据类型:', typeof result);
      console.log('📚 [BookService] 是否为数组:', Array.isArray(result));
      
      // 如果是数组，直接返回
      if (Array.isArray(result)) {
        console.log('📚 [BookService] 图书数量:', result.length);
        return result;
      }
      
      // 如果不是数组，尝试从不同字段提取
      if (result && typeof result === 'object') {
        if (result.data && Array.isArray(result.data)) {
          console.log('📚 [BookService] 从data字段获取图书数据:', result.data);
          return result.data;
        }
        if (result.content && Array.isArray(result.content)) {
          console.log('📚 [BookService] 从content字段获取图书数据:', result.content);
          return result.content;
        }
        if (result.list && Array.isArray(result.list)) {
          console.log('📚 [BookService] 从list字段获取图书数据:', result.list);
          return result.list;
        }
      }
      
      console.warn('📚 [BookService] 未知的图书数据格式，返回空数组');
      return [];
    } catch (error) {
      console.error('获取所有图书列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取图书列表
   * @param {Object} params - 查询参数
   * @param {string} params.search - 搜索关键词
   * @param {string} params.category - 分类筛选
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页数量
   * @returns {Promise<Array>} 图书列表
   */
  async getBooks(params = {}) {
    try {
      console.log('📚 [BookService] 获取图书列表', params);
      return await apiClient.get('/books', params);
    } catch (error) {
      console.error('获取图书列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取图书详情
   * @param {number} bookId - 图书ID
   * @returns {Promise<Object>} 图书详情
   */
  async getBookById(bookId) {
    try {
      console.log(`📖 [BookService] 获取图书详情 - 图书ID: ${bookId}`);
      return await apiClient.get(`/books/${bookId}`);
    } catch (error) {
      console.error(`获取图书详情失败 (图书ID: ${bookId}):`, error);
      throw error;
    }
  }

  /**
   * 搜索图书
   * @param {string} keyword - 搜索关键词
   * @param {Object} params - 其他查询参数
   * @returns {Promise<Array>} 搜索结果
   */
  async searchBooks(keyword, params = {}) {
    try {
      console.log(`🔍 [BookService] 搜索图书 - 关键词: ${keyword}`, params);
      return await apiClient.get('/books/search', { keyword, ...params });
    } catch (error) {
      console.error(`搜索图书失败 (关键词: ${keyword}):`, error);
      throw error;
    }
  }

  /**
   * 按分类获取图书
   * @param {string} category - 分类名称
   * @returns {Promise<Array>} 分类图书列表
   */
  async getBooksByCategory(category) {
    try {
      console.log(`📚 [BookService] 获取分类图书: "${category}"`);
      return await apiClient.get('/books', { category });
      
      // 旧的模拟数据代码（已注释）
      /*
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`📚 [BookService] 获取分类图书: "${category}" - 使用模拟数据`);
          resolve([]);
        }, 100);
      });
      */
    } catch (error) {
      console.error(`获取分类图书失败 (分类: ${category}):`, error);
      throw error;
    }
  }

  /**
   * 获取有库存的图书
   * @returns {Promise<Array>} 有库存的图书列表
   */
  async getAvailableBooks() {
    try {
      console.log('📚 [BookService] 获取有库存的图书');
      return await apiClient.get('/books/available');
    } catch (error) {
      console.error('获取有库存图书失败:', error);
      throw error;
    }
  }

  /**
   * 获取图书分类
   * @returns {Promise<Array>} 分类列表
   */
  async getCategories() {
    try {
      console.log('📂 [BookService] 获取图书分类');
      return await apiClient.get('/books/categories');
    } catch (error) {
      console.error('获取图书分类失败:', error);
      throw error;
    }
  }

  /**
   * 获取热门图书
   * @param {number} limit - 数量限制
   * @returns {Promise<Array>} 热门图书列表
   */
  async getPopularBooks(limit = 10) {
    try {
      console.log(`🔥 [BookService] 获取热门图书 - 限制: ${limit}`);
      return await apiClient.get('/books/popular', { limit });
    } catch (error) {
      console.error('获取热门图书失败:', error);
      throw error;
    }
  }

  // =================== 管理员专用方法 ===================

  /**
   * 创建图书（管理员权限）
   * @param {Object} bookData - 图书数据
   * @param {string} bookData.title - 书名
   * @param {string} bookData.author - 作者
   * @param {string} bookData.isbn - ISBN编号
   * @param {number} bookData.price - 价格
   * @param {number} bookData.stock - 库存
   * @param {string} bookData.publisher - 出版社
   * @param {string} bookData.coverImage - 封面图片URL
   * @param {string} bookData.description - 书籍简介
   * @param {number} bookData.categoryId - 分类ID
   * @returns {Promise<Object>} 创建结果
   */
  async createBook(bookData) {
    try {
      console.log('📝 [BookService] 创建图书（管理员）', bookData);
      return await apiClient.post('/admin/books', bookData);
    } catch (error) {
      console.error('创建图书失败:', error);
      throw error;
    }
  }

  /**
   * 更新图书（管理员权限）
   * @param {number} bookId - 图书ID
   * @param {Object} bookData - 图书数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateBook(bookId, bookData) {
    try {
      console.log(`✏️ [BookService] 更新图书（管理员） - 图书ID: ${bookId}`, bookData);
      return await apiClient.put(`/admin/books/${bookId}`, bookData);
    } catch (error) {
      console.error(`更新图书失败 (图书ID: ${bookId}):`, error);
      throw error;
    }
  }

  /**
   * 删除图书（管理员权限）- 保留原有方法，但建议使用软删除
   * @param {number} bookId - 图书ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteBook(bookId) {
    try {
      console.log(`🗑️ [BookService] 删除图书（管理员） - 图书ID: ${bookId}`);
      return await apiClient.delete(`/admin/books/${bookId}`);
    } catch (error) {
      console.error(`删除图书失败 (图书ID: ${bookId}):`, error);
      throw error;
    }
  }

  /**
   * 更新图书状态（管理员权限）
   * @param {number} bookId - 图书ID
   * @param {string} status - 新状态 (AVAILABLE | OUT_OF_STOCK | DISCONTINUED)
   * @returns {Promise<Object>} 更新结果
   */
  async updateBookStatus(bookId, status) {
    try {
      console.log(`🔄 [BookService] 更新图书状态（管理员） - 图书ID: ${bookId}, 状态: ${status}`);
      
      // 验证状态值
      const validStatuses = ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'];
      if (!validStatuses.includes(status)) {
        throw new Error(`无效的状态值: ${status}，有效状态: ${validStatuses.join(', ')}`);
      }
      
      return await apiClient.put(`/admin/books/${bookId}/status`, { status });
    } catch (error) {
      console.error(`更新图书状态失败 (图书ID: ${bookId}):`, error);
      throw error;
    }
  }

  /**
   * 检查并自动更新售罄状态（管理员权限）
   * @param {number} bookId - 图书ID
   * @returns {Promise<Object>} 检查结果
   */
  async checkAndUpdateStockStatus(bookId) {
    try {
      console.log(`📦 [BookService] 检查库存状态 - 图书ID: ${bookId}`);
      
      // 获取图书信息
      const book = await this.getBookById(bookId);
      
      if (book.stock === 0 && book.status === 'AVAILABLE') {
        // 如果库存为0且当前状态为可用，自动标记为售罄
        await this.updateBookStatus(bookId, 'OUT_OF_STOCK');
        console.log(`📦 [BookService] 自动标记为售罄 - 图书ID: ${bookId}`);
        return { autoUpdated: true, newStatus: 'OUT_OF_STOCK' };
      }
      
      return { autoUpdated: false, currentStatus: book.status };
    } catch (error) {
      console.error(`检查库存状态失败 (图书ID: ${bookId}):`, error);
      throw error;
    }
  }

  /**
   * 检查ISBN是否已存在（管理员权限）
   * @param {string} isbn - ISBN编号
   * @param {number} excludeBookId - 排除的图书ID（用于编辑时检查）
   * @returns {Promise<boolean>} 是否已存在
   */
  async checkIsbnExists(isbn, excludeBookId = null) {
    try {
      console.log(`🔍 [BookService] 检查ISBN是否存在 - ISBN: ${isbn}`);
      const params = { isbn };
      if (excludeBookId) {
        params.excludeBookId = excludeBookId;
      }
      const result = await apiClient.get('/admin/books/check-isbn', params);
      return result.exists || false;
    } catch (error) {
      console.error(`检查ISBN失败 (ISBN: ${isbn}):`, error);
      throw error;
    }
  }

  /**
   * 批量更新图书库存（管理员权限）
   * @param {Array} updates - 库存更新数组
   * @param {number} updates[].bookId - 图书ID
   * @param {number} updates[].stock - 新库存
   * @returns {Promise<Object>} 更新结果
   */
  async batchUpdateStock(updates) {
    try {
      console.log('📦 [BookService] 批量更新库存（管理员）', updates);
      return await apiClient.put('/admin/books/batch-stock', { updates });
    } catch (error) {
      console.error('批量更新库存失败:', error);
      throw error;
    }
  }
}

// 创建服务实例
const bookService = new BookService();

export default bookService; 