import books from './books';

// 默认用户信息
const defaultUserInfo = {
  name: '张三',
  email: 'zhang@example.com',
  phone: '13812345678',
  address: '北京市海淀区'
};

// 收藏的书籍
const defaultFavorites = [
  { id: 2, title: '三体', author: '刘慈欣' },
  { id: 5, title: '平凡的世界', author: '路遥' },
];

/**
 * 从localStorage加载数据，如果不存在则使用默认值
 * @param {string} key - localStorage的键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 加载的数据
 */
const loadFromStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`解析${key}数据失败:`, e);
      return defaultValue;
    }
  }
  return defaultValue;
};

/**
 * 保存数据到localStorage
 * @param {string} key - localStorage的键名
 * @param {any} data - 要保存的数据
 */
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`保存${key}数据失败:`, e);
  }
};

// 初始化商店数据
const initializeStore = () => {
  // 获取用户信息
  const userInfo = loadFromStorage('userInfo', defaultUserInfo);
  
  // 获取购物车 - 添加一些初始数据
  const defaultCart = [
    { 
      id: 1,
      title: '红楼梦',
      author: '曹雪芹',
      price: 59.9,
      coverImage: 'https://img9.doubanio.com/view/subject/l/public/s1070959.jpg',
      stock: 10,
      quantity: 2
    },
    {
      id: 2,
      title: '三体',
      author: '刘慈欣',
      price: 69.8,
      coverImage: 'https://img9.doubanio.com/view/subject/l/public/s2768378.jpg',
      stock: 5,
      quantity: 1
    },
    {
      id: 4,
      title: '人类简史',
      author: '尤瓦尔·赫拉利',
      price: 68.0,
      coverImage: 'https://img3.doubanio.com/view/subject/l/public/s27814883.jpg',
      stock: 15,
      quantity: 1
    }
  ];

  // 确保localStorage中有初始购物车数据
  const storedCart = localStorage.getItem('cart');
  if (!storedCart) {
    localStorage.setItem('cart', JSON.stringify(defaultCart));
  }
  
  const cart = loadFromStorage('cart', defaultCart);
  
  // 获取订单
  const orders = loadFromStorage('orders', []);
  
  // 获取收藏
  const favorites = loadFromStorage('favorites', defaultFavorites);
  
  return {
    books,
    userInfo,
    cart,
    orders,
    favorites,
    
    // 保存用户信息
    saveUserInfo: (data) => {
      saveToStorage('userInfo', data);
    },
    
    // 保存购物车
    saveCart: (data) => {
      if (data && Array.isArray(data)) {
        saveToStorage('cart', data);
      }
    },
    
    // 保存订单
    saveOrders: (data) => {
      saveToStorage('orders', data);
    },
    
    // 保存收藏
    saveFavorites: (data) => {
      saveToStorage('favorites', data);
    },
    
    // 创建订单
    createOrder: (cartItems) => {
      // 生成订单号
      const orderId = 'ORD' + Date.now().toString().slice(-8);
      const orderTime = new Date().toLocaleString('zh-CN');
      const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      // 创建新订单
      const newOrder = {
        id: orderId,
        orderTime: orderTime,
        totalAmount: totalAmount,
        status: '待发货',
        items: [...cartItems]
      };
      
      // 更新订单列表
      const currentOrders = loadFromStorage('orders', []);
      const updatedOrders = [newOrder, ...currentOrders];
      saveToStorage('orders', updatedOrders);
      
      return newOrder;
    }
  };
};

// 导出数据存储
const store = initializeStore();
export default store; 