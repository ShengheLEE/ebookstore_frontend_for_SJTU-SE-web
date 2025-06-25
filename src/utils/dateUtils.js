/**
 * 日期时间格式化工具函数
 */

/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 日期时间字符串或Date对象
 * @param {string} format - 格式类型 ('datetime' | 'date' | 'time')
 * @returns {string} 格式化后的时间字符串
 */
export const formatDateTime = (dateTime, format = 'datetime') => {
  if (!dateTime) return '-';
  
  try {
    const date = new Date(dateTime);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    switch (format) {
      case 'date':
        return `${year}-${month}-${day}`;
      case 'time':
        return `${hours}:${minutes}:${seconds}`;
      case 'datetime':
      default:
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  } catch (error) {
    console.error('日期格式化失败:', error);
    return '-';
  }
};

/**
 * 格式化日期时间为友好显示
 * @param {string|Date} dateTime - 日期时间
 * @returns {string} 友好的时间显示
 */
export const formatDateTimeFriendly = (dateTime) => {
  if (!dateTime) return '-';
  
  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天 ' + formatDateTime(dateTime, 'time');
    } else if (diffDays === 1) {
      return '昨天 ' + formatDateTime(dateTime, 'time');
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return formatDateTime(dateTime, 'datetime');
    }
  } catch (error) {
    return formatDateTime(dateTime);
  }
};

/**
 * 格式化相对时间
 * @param {string|Date} dateTime - 日期时间
 * @returns {string} 相对时间显示
 */
export const formatRelativeTime = (dateTime) => {
  if (!dateTime) return '-';
  
  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return '刚刚';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 30) {
      return `${diffDays}天前`;
    } else {
      return formatDateTime(dateTime, 'date');
    }
  } catch (error) {
    return formatDateTime(dateTime);
  }
}; 