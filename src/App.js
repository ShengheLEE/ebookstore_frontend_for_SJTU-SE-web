import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout, message } from 'antd';
import { useState, useEffect } from 'react';
import LayoutMenu from './components/LayoutMenu';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Statistics from './pages/admin/Statistics';
import UserManagement from './pages/admin/UserManagement';
import BookManagement from './pages/admin/BookManagement';
import OrderManagement from './pages/admin/OrderManagement';

// 导入API服务
import { bookService, cartService, orderService, userService, statisticsService } from './services';
import authService from './services/authService';

/*
// 硬编码数据已注释 - 改为使用API调用
const booksData = [
  {
    id: 1,
    title: '红楼梦',
    author: '曹雪芹',
    price: 59.9,
    coverImage: 'https://img9.doubanio.com/view/subject/l/public/s1070959.jpg',
    description: '《红楼梦》是一部百科全书式的长篇小说。以宝黛爱情悲剧为主线，以四大家族的荣辱兴衰为背景，描绘了封建社会末期的方方面面。',
    stock: 10
  },
  {
    id: 2,
    title: '三体',
    author: '刘慈欣',
    price: 69.8,
    coverImage: 'https://img9.doubanio.com/view/subject/l/public/s2768378.jpg',
    description: '《三体》是刘慈欣创作的系列科幻小说，讲述了地球人类与三体文明的信息交流、三体人入侵及人类文明的反抗的故事。小说揭示了宇宙中的黑暗森林法则，以及智慧生命在残酷宇宙中的生存策略。',
    stock: 5
  },
  {
    id: 3,
    title: '活着',
    author: '余华',
    price: 45.0,
    coverImage: 'https://img2.doubanio.com/view/subject/l/public/s29053580.jpg',
    description: '《活着》是余华的代表作，讲述了农村人福贵悲惨的人生遭遇。福贵本是个阔少爷，因赌博而败家，一贫如洗后被迫靠给人家佣工维持生计。',
    stock: 8
  },
  {
    id: 4,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    price: 68.0,
    coverImage: 'https://img3.doubanio.com/view/subject/l/public/s27814883.jpg',
    description: '十万年前，地球上至少有六个人种，为何只有智人活了下来？从认知革命、农业革命到科学革命，我们如何塑造了现代社会？',
    stock: 15
  },
  {
    id: 5,
    title: '平凡的世界',
    author: '路遥',
    price: 88.0,
    coverImage: 'https://img9.doubanio.com/view/subject/l/public/s1144911.jpg',
    description: '《平凡的世界》是一部全景式地表现中国当代城乡社会生活的长篇小说。这是一部关于普通人命运的书，塑造了社会各阶层普通人的形象。',
    stock: 12
  },
  {
    id: 6,
    title: '围城',
    author: '钱钟书',
    price: 39.5,
    coverImage: 'https://img1.doubanio.com/view/subject/l/public/s1070222.jpg',
    description: '《围城》是钱钟书所著的长篇小说，是中国现代文学史上一部风格独特的讽刺小说。被誉为中国现代文学史上的经典。',
    stock: 6
  }
];

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

// 默认购物车数据
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
*/

function App() {
  // 应用状态 - 改为从API获取
  const [books, setBooks] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // 获取当前用户ID
  const getCurrentUserId = () => {
    const user = authService.getCurrentUser();
    return user ? user.id : 1; // 默认用户ID为1
  };

  // 初始化数据加载
  useEffect(() => {
    // 获取当前用户信息
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // 只有在用户已登录时才加载数据
    if (user) {
      initializeData();
    } else {
      setLoading(false);
    }
  }, []);

  // 初始化应用数据
  const initializeData = async (specificUserId = null, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log('🚀 [App] 开始初始化应用数据...');

      // 优先使用传入的userId，否则使用getCurrentUserId
      const userId = specificUserId || getCurrentUserId();
      console.log('🚀 [App] 使用用户ID:', userId);
      
      // 先尝试获取图书数据（两种方式）
      let booksData;
      try {
        console.log('📚 [App] 尝试获取图书数据（无分页参数）...');
        booksData = { status: 'fulfilled', value: await bookService.getAllBooks() };
      } catch (error) {
        console.log('📚 [App] 无分页参数失败，尝试带分页参数...');
        try {
          booksData = { status: 'fulfilled', value: await bookService.getBooks() };
        } catch (error2) {
          console.error('📚 [App] 两种方式都失败:', error2);
          booksData = { status: 'rejected', reason: error2 };
        }
      }

      // 并行加载其他数据
      const [cartData, ordersData, userInfoData, favoritesData] = await Promise.allSettled([
        cartService.getCart(),
        orderService.getOrders(),
        userService.getUserProfile(userId),
        userService.getUserFavorites(userId)
      ]);

      // 处理图书数据
      if (booksData.status === 'fulfilled') {
        setBooks(booksData.value || []);
        console.log('✅ [App] 图书数据加载成功');
      } else {
        console.error('❌ [App] 图书数据加载失败:', booksData.reason);
        if (showLoading) {
          message.error('图书数据加载失败');
        }
      }

      // 处理购物车数据
      if (cartData.status === 'fulfilled') {
        setCart(cartData.value || []);
        console.log('✅ [App] 购物车数据加载成功');
      } else {
        console.error('❌ [App] 购物车数据加载失败:', cartData.reason);
        if (showLoading) {
          message.error('购物车数据加载失败');
        }
      }

      // 处理订单数据
      if (ordersData.status === 'fulfilled') {
        setOrders(ordersData.value || []);
        console.log('✅ [App] 订单数据加载成功');
      } else {
        console.error('❌ [App] 订单数据加载失败:', ordersData.reason);
        if (showLoading) {
          message.error('订单数据加载失败');
        }
      }

      // 处理用户信息
      if (userInfoData.status === 'fulfilled') {
        setUserInfo(userInfoData.value || {
          name: '张三',
          email: 'zhang@example.com',
          phone: '13812345678',
          address: '北京市海淀区'
        });
        console.log('✅ [App] 用户信息加载成功');
      } else {
        console.error('❌ [App] 用户信息加载失败:', userInfoData.reason);
        // 设置默认用户信息
        setUserInfo({
          name: '张三',
          email: 'zhang@example.com',
          phone: '13812345678',
          address: '北京市海淀区'
        });
      }

      // 处理收藏数据
      if (favoritesData.status === 'fulfilled') {
        setFavorites(favoritesData.value || []);
        console.log('✅ [App] 收藏数据加载成功');
      } else {
        console.error('❌ [App] 收藏数据加载失败:', favoritesData.reason);
        if (showLoading) {
          message.error('收藏数据加载失败');
        }
      }

      console.log('🎉 [App] 应用数据初始化完成');
    } catch (error) {
      console.error('💥 [App] 应用数据初始化失败:', error);
      if (showLoading) {
        message.error('应用初始化失败，请刷新页面重试');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // 创建订单函数 - 使用API
  const createOrder = async (cartItems) => {
    try {
      console.log('📦 [App] 开始创建订单...');
      console.log('📦 [App] 传入的购物车项:', cartItems);
      
      // 获取购物车项ID
      const cartItemIds = cartItems.map(item => item.id);
      console.log('📦 [App] 提取的购物车项ID:', cartItemIds);
      
      // 构建收货信息
      const receiverInfo = {
        receiverName: userInfo?.name || currentUser?.name || currentUser?.username || '默认收货人',
        receiverPhone: userInfo?.phone || '13800000000',
        receiverAddress: userInfo?.address || '北京市海淀区中关村大街1号',
        remark: '前端系统自动生成订单'
      };
      console.log('📦 [App] 收货信息:', receiverInfo);
      
      // 调用API创建订单
      console.log('📦 [App] 调用API创建订单...');
      const result = await orderService.createOrder(cartItemIds, receiverInfo);
      
      console.log('📦 [App] API返回结果:', result);
      console.log('📦 [App] 返回结果类型:', typeof result);
      console.log('📦 [App] 返回结果布尔值:', !!result);
      
      // 检查不同的成功条件
      let isSuccess = false;
      if (result) {
        // 如果result是对象，检查success字段
        if (typeof result === 'object' && result.success !== undefined) {
          isSuccess = result.success;
          console.log('📦 [App] 从success字段判断结果:', isSuccess);
        } 
        // 如果result是非空对象或数组，认为成功
        else if (typeof result === 'object') {
          isSuccess = true;
          console.log('📦 [App] 返回对象，认为成功');
        }
        // 如果result是真值，认为成功
        else {
          isSuccess = !!result;
          console.log('📦 [App] 根据真值判断成功');
        }
      }
      
      if (isSuccess) {
        console.log('📦 [App] 订单创建成功，开始刷新数据...');
        
        // 强制显示成功消息
        message.success('订单创建成功！');
        
        // 重新加载订单列表
        try {
          console.log('📦 [App] 开始刷新订单列表...');
          const updatedOrders = await orderService.getOrders();
          console.log('📦 [App] 新的订单列表:', updatedOrders);
          console.log('📦 [App] 订单列表类型:', typeof updatedOrders);
          console.log('📦 [App] 是否为数组:', Array.isArray(updatedOrders));
          console.log('📦 [App] 订单数量:', Array.isArray(updatedOrders) ? updatedOrders.length : 'N/A');
          
          setOrders(updatedOrders || []);
          console.log('✅ [App] 订单列表刷新成功');
          
          // 等待一小段时间确保状态更新完成
          setTimeout(() => {
            console.log('📦 [App] 当前orders状态:', orders);
          }, 100);
          
        } catch (error) {
          console.error('⚠️ [App] 订单列表刷新失败:', error);
        }
        
        // 重新加载购物车（后端会自动移除已下单的商品）
        try {
          console.log('📦 [App] 开始刷新购物车...');
          const updatedCart = await cartService.getCart();
          console.log('📦 [App] 新的购物车数据:', updatedCart);
          setCart(updatedCart || []);
          console.log('✅ [App] 购物车数据刷新成功');
        } catch (error) {
          console.error('⚠️ [App] 购物车数据刷新失败:', error);
        }
        
        // 重新加载图书数据以更新库存信息
        try {
          console.log('📦 [App] 开始刷新图书数据...');
          let updatedBooks;
          try {
            updatedBooks = await bookService.getAllBooks();
          } catch (error) {
            updatedBooks = await bookService.getBooks();
          }
          console.log('📦 [App] 新的图书数据:', updatedBooks);
          setBooks(updatedBooks || []);
          console.log('✅ [App] 图书库存数据刷新成功');
          
          // 检查是否有书籍库存变为0，自动更新状态为售罄
          try {
            console.log('📦 [App] 检查库存为0的书籍...');
            const booksToMarkOutOfStock = (updatedBooks || []).filter(book => 
              book.stock === 0 && (!book.status || book.status === 'AVAILABLE')
            );
            
            if (booksToMarkOutOfStock.length > 0) {
              console.log('📦 [App] 发现需要标记为售罄的书籍:', booksToMarkOutOfStock.map(b => b.title));
              
              // 批量更新状态为售罄
              for (const book of booksToMarkOutOfStock) {
                try {
                  await bookService.updateBookStatus(book.id, 'OUT_OF_STOCK');
                  console.log(`📦 [App] 书籍《${book.title}》已自动标记为售罄`);
                } catch (error) {
                  console.error(`❌ [App] 自动标记售罄失败 - 书籍《${book.title}》:`, error);
                }
              }
              
              // 再次刷新图书数据以反映状态变化
              try {
                const finalBooks = await bookService.getAllBooks();
                setBooks(finalBooks || []);
                console.log('✅ [App] 库存状态检查完成，图书数据已更新');
              } catch (error) {
                console.warn('⚠️ [App] 最终刷新图书数据失败:', error);
              }
            } else {
              console.log('📦 [App] 没有发现需要标记为售罄的书籍');
            }
          } catch (error) {
            console.error('❌ [App] 库存状态检查失败:', error);
          }
        } catch (error) {
          console.warn('⚠️ [App] 刷新图书数据失败:', error);
        }
        
        console.log('✅ [App] 订单创建成功，所有数据已刷新');
        return result;
      } else {
        console.error('❌ [App] API返回结果表示失败:', result);
        throw new Error(result?.message || 'API返回结果表示失败');
      }
    } catch (error) {
      console.error('❌ [App] 创建订单失败:', error);
      message.error('创建订单失败：' + error.message);
      throw error;
    }
  };

  // 更新购物车函数 - 使用API
  const updateCart = async (action, params) => {
    try {
      let result;
      switch (action) {
        case 'add':
          result = await cartService.addToCart(params.bookId, params.quantity);
          break;
        case 'update':
          result = await cartService.updateCartItemQuantity(params.cartItemId, params.quantity);
          break;
        case 'remove':
          result = await cartService.removeFromCart(params.cartItemId);
          break;
        case 'clear':
          result = await cartService.clearCart();
          break;
        default:
          throw new Error('未知的购物车操作');
      }

      if (result) {
        // 重新加载购物车数据
        const updatedCart = await cartService.getCart();
        setCart(updatedCart || []);
        
        // 重新加载图书数据以更新库存信息
        try {
          const updatedBooks = await bookService.getBooks();
          setBooks(updatedBooks || []);
          console.log(`✅ [App] 图书库存数据已刷新`);
          
          // 检查是否有书籍库存变为0，自动更新状态为售罄
          try {
            console.log(`🛒 [App] 检查库存为0的书籍...`);
            const booksToMarkOutOfStock = (updatedBooks || []).filter(book => 
              book.stock === 0 && (!book.status || book.status === 'AVAILABLE')
            );
            
            if (booksToMarkOutOfStock.length > 0) {
              console.log(`🛒 [App] 发现需要标记为售罄的书籍:`, booksToMarkOutOfStock.map(b => b.title));
              
              // 批量更新状态为售罄
              for (const book of booksToMarkOutOfStock) {
                try {
                  await bookService.updateBookStatus(book.id, 'OUT_OF_STOCK');
                  console.log(`🛒 [App] 书籍《${book.title}》已自动标记为售罄`);
                } catch (error) {
                  console.error(`❌ [App] 自动标记售罄失败 - 书籍《${book.title}》:`, error);
                }
              }
              
              // 再次刷新图书数据以反映状态变化
              try {
                const finalBooks = await bookService.getBooks();
                setBooks(finalBooks || []);
                console.log(`✅ [App] 购物车操作后库存状态检查完成`);
              } catch (error) {
                console.warn(`⚠️ [App] 最终刷新图书数据失败:`, error);
              }
            } else {
              console.log(`🛒 [App] 没有发现需要标记为售罄的书籍`);
            }
          } catch (error) {
            console.error(`❌ [App] 库存状态检查失败:`, error);
          }
        } catch (error) {
          console.warn(`⚠️ [App] 刷新图书数据失败:`, error);
          // 不抛出错误，因为购物车操作已成功
        }
        
        console.log(`✅ [App] 购物车${action}操作成功`);
      }
    } catch (error) {
      console.error(`❌ [App] 购物车${action}操作失败:`, error);
      message.error(`购物车操作失败：${error.message}`);
      throw error;
    }
  };

  // 更新用户信息函数 - 使用API
  const updateUserInfo = async (newUserInfo) => {
    try {
      console.log('✏️ [App] 开始更新用户信息...');
      const userId = getCurrentUserId();
      const result = await userService.updateUserProfile(userId, newUserInfo);
      
      if (result) {
        setUserInfo(newUserInfo);
        message.success('用户信息更新成功！');
        console.log('✅ [App] 用户信息更新成功');
      }
    } catch (error) {
      console.error('❌ [App] 更新用户信息失败:', error);
      message.error('更新用户信息失败：' + error.message);
      throw error;
    }
  };

  // 更新收藏函数 - 使用API
  const updateFavorites = async (action, bookId) => {
    try {
      const userId = getCurrentUserId();
      let result;
      if (action === 'add') {
        result = await userService.addToFavorites(userId, bookId);
      } else if (action === 'remove') {
        result = await userService.removeFromFavorites(userId, bookId);
      }

      if (result) {
        // 重新加载收藏数据，确保使用当前用户ID
        const currentUserId = getCurrentUserId();
        const updatedFavorites = await userService.getUserFavorites(currentUserId);
        setFavorites(updatedFavorites || []);
        console.log(`✅ [App] 收藏${action}操作成功`);
      }
    } catch (error) {
      console.error(`❌ [App] 收藏${action}操作失败:`, error);
      message.error(`收藏操作失败：${error.message}`);
      throw error;
    }
  };

  // 处理用户登录
  const handleLogin = async (user) => {
    try {
      console.log('🔐 [App] 用户登录成功:', user);
      setCurrentUser(user);
      
      // 存储用户信息到localStorage（确保authService已正确存储）
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      // 显示欢迎消息
      message.success(`欢迎回来，${user.name || user.username}！`);
      
      // 在后台异步初始化数据，不阻塞登录流程
      console.log('🔐 [App] 开始后台数据初始化...');
      initializeData(user.id, false).then(() => {
        console.log('🔐 [App] 后台数据初始化完成');
      }).catch(error => {
        console.error('❌ [App] 后台数据初始化失败:', error);
        // 不显示错误消息，因为用户已经成功登录了
      });
      
    } catch (error) {
      console.error('❌ [App] 登录处理失败:', error);
      message.error('登录处理失败');
    }
  };

  // 处理用户登出
  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setBooks([]);
      setUserInfo(null);
      setCart([]);
      setOrders([]);
      setFavorites([]);
      message.success('已成功登出');
    } catch (error) {
      console.error('❌ [App] 登出失败:', error);
      message.error('登出失败');
    }
  };

  // 刷新图书数据函数
  const refreshBooks = async () => {
    try {
      console.log('🔄 [App] 开始刷新图书数据...');
      
      let updatedBooks;
      try {
        console.log('📚 [App] 刷新：尝试获取图书数据（无分页参数）...');
        updatedBooks = await bookService.getAllBooks();
      } catch (error) {
        console.log('📚 [App] 刷新：无分页参数失败，尝试带分页参数...');
        updatedBooks = await bookService.getBooks();
      }
      
      setBooks(updatedBooks || []);
      console.log('✅ [App] 图书数据刷新成功，数量:', (updatedBooks || []).length);
      message.success('图书数据已刷新');
      return updatedBooks;
    } catch (error) {
      console.error('❌ [App] 刷新图书数据失败:', error);
      message.error('刷新图书数据失败：' + error.message);
      throw error;
    }
  };

  // 刷新购物车数据函数
  const refreshCart = async () => {
    try {
      console.log('🔄 [App] 开始刷新购物车数据...');
      const updatedCart = await cartService.getCart();
      setCart(updatedCart || []);
      console.log('✅ [App] 购物车数据刷新成功:', updatedCart);
      message.success('购物车数据已刷新');
      return updatedCart;
    } catch (error) {
      console.error('❌ [App] 刷新购物车数据失败:', error);
      message.error('刷新购物车数据失败：' + error.message);
      throw error;
    }
  };

  // 应用数据和方法
  const appData = {
    books,
    userInfo,
    cart,
    orders,
    favorites,
    loading,
    currentUser,
    userId: currentUser ? currentUser.id : getCurrentUserId(), // 优先使用currentUser的id
    // 认证方法
    onLogin: handleLogin,
    onLogout: handleLogout,
    // API方法
    updateCart,
    createOrder,
    updateUserInfo: updateUserInfo,
    updateFavorites,
    // 服务实例（供页面组件直接使用）
    services: {
      bookService,
      cartService,
      orderService,
      userService,
      authService,
      statisticsService
    },
    // 数据刷新方法
    refreshData: initializeData,
    refreshBooks,
    refreshCart, // 新增的购物车刷新方法
    // 兼容旧版本的方法名
    setUserInfo: updateUserInfo,
    setCart: (newCart) => setCart(newCart),
    setOrders: (newOrders) => setOrders(newOrders),
    setFavorites: (newFavorites) => setFavorites(newFavorites)
  };

  // 显示加载状态
  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>🌐 正在连接后端服务...</div>
          <div style={{ color: '#666' }}>请确保后端服务已启动在 http://localhost:8080</div>
        </div>
      </Layout>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页面 - 不需要保护 */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        {/* 注册页面 - 不需要保护 */}
        <Route path="/register" element={<Register />} />
        
        {/* 受保护的路由 */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout style={{ minHeight: '100vh' }}>
              <LayoutMenu appData={appData} />
              <Layout.Content style={{ padding: '24px', marginLeft: 200 }}>
                <Routes>
                  <Route path="/" element={<Home appData={appData} />} />
                  <Route path="/book/:id" element={<BookDetail appData={appData} />} />
                  <Route path="/cart" element={<Cart appData={appData} />} />
                  <Route path="/orders" element={<Orders appData={appData} />} />
                  <Route path="/profile" element={<Profile appData={appData} />} />
                  <Route path="/statistics" element={<Statistics appData={appData} />} />
                  {/* 管理员路由 */}
                  <Route path="/admin/users" element={<UserManagement appData={appData} />} />
                  <Route path="/admin/books" element={<BookManagement appData={appData} />} />
                  <Route path="/admin/orders" element={<OrderManagement appData={appData} />} />
                </Routes>
              </Layout.Content>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;