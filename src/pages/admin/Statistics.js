import React, { useState, useEffect } from 'react';
import { Card, Typography, DatePicker, Row, Col, Table, Select, Statistic, message } from 'antd';
import { BarChartOutlined, TrophyOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Statistics = ({ appData }) => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [bookSales, setBookSales] = useState([]);
  const [userConsumption, setUserConsumption] = useState([]);
  const [personalStats, setPersonalStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { currentUser } = appData;
  const isAdmin = currentUser?.role === 'ADMIN';

  // 页面初始化
  useEffect(() => {
    document.title = '数据统计 - 书香世界在线图书商城';
    loadStatistics();
  }, [dateRange, selectedPeriod]);

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      setLoading(true);
      console.log('📊 [Statistics] 加载统计数据...');
      
      if (isAdmin) {
        await Promise.all([
          loadBookSalesStats(),
          loadUserConsumptionStats()
        ]);
      }
      
      await loadPersonalStats();
      
    } catch (error) {
      console.error('❌ [Statistics] 加载统计数据失败:', error);
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载图书销量统计
  const loadBookSalesStats = async () => {
    try {
      // 构建查询参数
      const params = {};
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      // 调用后端API获取图书销量统计
      const result = await appData.services.statisticsService.getBookSalesStats(params);
      
      setBookSales(result || []);
      console.log('✅ [Statistics] 图书销量统计加载成功，数量:', (result || []).length);
    } catch (error) {
      console.error('❌ [Statistics] 加载图书销量统计失败:', error);
    }
  };

  // 加载用户消费统计
  const loadUserConsumptionStats = async () => {
    try {
      // 构建查询参数
      const params = {};
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      // 调用后端API获取用户消费统计
      const result = await appData.services.statisticsService.getUserConsumptionStats(params);
      
      setUserConsumption(result || []);
      console.log('✅ [Statistics] 用户消费统计加载成功，数量:', (result || []).length);
    } catch (error) {
      console.error('❌ [Statistics] 加载用户消费统计失败:', error);
    }
  };

  // 加载个人统计
  const loadPersonalStats = async () => {
    try {
      if (!currentUser) {
        console.warn('⚠️ [Statistics] 当前用户不存在，跳过个人统计加载');
        return;
      }
      
      // 构建查询参数
      const params = {};
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      // 调用后端API获取个人统计
      const result = await appData.services.statisticsService.getPersonalStats(currentUser.id, params);
      
      setPersonalStats(result || null);
      console.log('✅ [Statistics] 个人统计加载成功');
    } catch (error) {
      console.error('❌ [Statistics] 加载个人统计失败:', error);
    }
  };

  // 销量排行榜列配置
  const salesColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => (
        <span style={{
          fontWeight: 'bold',
          color: index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : 'inherit'
        }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span style={{ fontWeight: 'bold' }}>{title}</span>,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '销量',
      dataIndex: 'totalSales',
      key: 'totalSales',
      render: (sales) => <span style={{ fontWeight: 'bold', color: '#52c41a' }}>{sales} 册</span>,
      sorter: (a, b) => a.totalSales - b.totalSales,
    },
    {
      title: '销售额',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue) => <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>¥{(revenue || 0).toFixed(2)}</span>,
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: '平均价格',
      dataIndex: 'averagePrice',
      key: 'averagePrice',
      render: (price) => `¥${(price || 0).toFixed(2)}`,
    },
  ];

  // 用户消费排行榜列配置
  const consumptionColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => (
        <span style={{
          fontWeight: 'bold',
          color: index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : 'inherit'
        }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
      render: (name) => <span style={{ fontWeight: 'bold' }}>{name}</span>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '订单数',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      render: (orders) => `${orders} 个`,
    },
    {
      title: '购书数量',
      dataIndex: 'totalBooks',
      key: 'totalBooks',
      render: (books) => `${books} 册`,
    },
    {
      title: '消费总额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>¥{(amount || 0).toFixed(2)}</span>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: '平均订单价值',
      dataIndex: 'averageOrderValue',
      key: 'averageOrderValue',
      render: (value) => `¥${(value || 0).toFixed(2)}`,
    },
  ];

  // 个人购书记录列配置
  const personalBooksColumns = [
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '购买数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => `${quantity} 册`,
    },
    {
      title: '购买金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${(amount || 0).toFixed(2)}`,
    },
    {
      title: '购买日期',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <BarChartOutlined /> 数据统计
      </Title>

      {/* 时间选择器 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <span style={{ marginRight: 16 }}>统计时间范围：</span>
          </Col>
          <Col>
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              style={{ width: 120, marginRight: 16 }}
            >
              <Select.Option value="week">本周</Select.Option>
              <Select.Option value="month">本月</Select.Option>
              <Select.Option value="quarter">本季度</Select.Option>
              <Select.Option value="year">本年</Select.Option>
              <Select.Option value="custom">自定义</Select.Option>
            </Select>
          </Col>
          {selectedPeriod === 'custom' && (
            <Col>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder={['开始日期', '结束日期']}
              />
            </Col>
          )}
        </Row>
      </Card>

      {/* 管理员统计 */}
      {isAdmin && (
        <>
          {/* 图书销量统计 */}
          <Card style={{ marginBottom: 24 }}>
            <Title level={3}>
              <TrophyOutlined /> 热销榜
            </Title>
            <Table
              columns={salesColumns}
              dataSource={bookSales}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="middle"
            />
          </Card>

          {/* 用户消费统计 */}
          <Card style={{ marginBottom: 24 }}>
            <Title level={3}>
              <UserOutlined /> 消费榜
            </Title>
            <Table
              columns={consumptionColumns}
              dataSource={userConsumption}
              rowKey="userId"
              loading={loading}
              pagination={false}
              size="middle"
            />
          </Card>
        </>
      )}

      {/* 个人统计 */}
      <Card>
        <Title level={3}>
          <BookOutlined /> 个人购书统计
        </Title>
        
        {personalStats && (
          <>
            {/* 统计概览 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Statistic
                  title="总订单数"
                  value={personalStats.totalOrders}
                  suffix="个"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="购书总数"
                  value={personalStats.totalBooks}
                  suffix="册"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="消费总额"
                  value={personalStats.totalAmount}
                  precision={2}
                  prefix="¥"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均订单价值"
                  value={personalStats.averageOrderValue || (personalStats.totalOrders > 0 ? personalStats.totalAmount / personalStats.totalOrders : 0)}
                  precision={2}
                  prefix="¥"
                />
              </Col>
            </Row>

            {/* 购书记录 */}
            <Title level={4}>购书明细</Title>
            <Table
              columns={personalBooksColumns}
              dataSource={personalStats.booksPurchased}
              rowKey="title"
              loading={loading}
              pagination={{
                pageSize: 5,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              size="small"
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default Statistics; 