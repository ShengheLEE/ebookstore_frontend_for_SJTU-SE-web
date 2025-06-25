// 导入所有服务
import apiClient from './api';
import bookService from './bookService';
import cartService from './cartService';
import orderService from './orderService';
import userService from './userService';
import authService from './authService';
import statisticsService from './statisticsService';

// 统一导出所有服务
export {
  apiClient,
  bookService,
  cartService,
  orderService,
  userService,
  authService,
  statisticsService
};

// 便于解构导入
export default {
  apiClient,
  bookService,
  cartService,
  orderService,
  userService,
  authService,
  statisticsService
}; 