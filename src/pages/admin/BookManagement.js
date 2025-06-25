import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, message, Modal, Form, InputNumber, Card, Typography, Popconfirm, Upload, Image, Tag, Dropdown } from 'antd';
import { SearchOutlined, BookOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeInvisibleOutlined, ExclamationOutlined, DownOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const BookManagement = ({ appData }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form] = Form.useForm();

  // 页面初始化
  useEffect(() => {
    document.title = '书籍管理 - 管理员控制台';
    loadBooks();
  }, []);

  // 加载书籍列表
  const loadBooks = async () => {
    try {
      setLoading(true);
      console.log('📚 [BookManagement] 加载书籍列表...');
      
      // 尝试使用现有的API获取书籍
      try {
        const result = await appData.services.bookService.getAllBooks();
        setBooks(result || []);
        console.log('✅ [BookManagement] 书籍列表加载成功，数量:', result?.length);
      } catch (error) {
        console.warn('⚠️ [BookManagement] getAllBooks失败，尝试getBooks...');
        const result = await appData.services.bookService.getBooks();
        setBooks(result || []);
        console.log('✅ [BookManagement] 书籍列表加载成功（备用方法），数量:', result?.length);
      }
    } catch (error) {
      console.error('❌ [BookManagement] 加载书籍列表失败:', error);
      message.error('加载书籍列表失败');
      
      // 使用模拟数据作为后备
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // 添加新书籍
  const handleAddBook = () => {
    setEditingBook(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 编辑书籍
  const handleEditBook = (book) => {
    setEditingBook(book);
    form.setFieldsValue({
      ...book,
      coverImage: book.coverImage || ''
    });
    setIsModalVisible(true);
  };

  // 下架书籍（更新状态为停产）
  const handleDiscontinueBook = async (bookId) => {
    try {
      console.log('🗑️ [BookManagement] 下架书籍（停产）:', bookId);
      
      // 调用后端API更新书籍状态为停产
      await appData.services.bookService.updateBookStatus(bookId, 'DISCONTINUED');
      
      // 重新加载书籍列表
      await loadBooks();
      message.success('书籍已下架，不再对用户显示');
    } catch (error) {
      console.error('❌ [BookManagement] 书籍下架失败:', error);
      message.error('操作失败');
    }
  };

  // 恢复书籍（重新上架）
  const handleRestoreBook = async (bookId) => {
    try {
      console.log('♻️ [BookManagement] 恢复书籍:', bookId);
      
      // 调用后端API更新书籍状态为可用
      await appData.services.bookService.updateBookStatus(bookId, 'AVAILABLE');
      
      // 重新加载书籍列表
      await loadBooks();
      message.success('书籍已重新上架');
    } catch (error) {
      console.error('❌ [BookManagement] 书籍恢复失败:', error);
      message.error('操作失败');
    }
  };

  // 标记为售罄
  const handleMarkOutOfStock = async (bookId) => {
    try {
      console.log('📦 [BookManagement] 标记书籍为售罄:', bookId);
      
      // 调用后端API更新书籍状态为售罄
      await appData.services.bookService.updateBookStatus(bookId, 'OUT_OF_STOCK');
      
      // 重新加载书籍列表
      await loadBooks();
      message.success('书籍已标记为售罄');
    } catch (error) {
      console.error('❌ [BookManagement] 标记售罄失败:', error);
      message.error('操作失败');
    }
  };

  // 保存书籍
  const handleSaveBook = async () => {
    try {
      const values = await form.validateFields();
      
      // 清理数据：移除空字符串字段
      const cleanData = {};
      Object.keys(values).forEach(key => {
        if (values[key] !== '' && values[key] !== null && values[key] !== undefined) {
          cleanData[key] = values[key];
        }
      });
      
      console.log('💾 [BookManagement] 保存书籍（清理后）:', cleanData);
      
      let bookId;
      if (editingBook) {
        // 编辑现有书籍
        await appData.services.bookService.updateBook(editingBook.id, cleanData);
        bookId = editingBook.id;
        message.success('书籍更新成功');
        
        // 检查库存状态（编辑时自动处理）
        if (cleanData.stock === 0) {
          const currentStatus = editingBook.status || 'AVAILABLE';
          if (currentStatus === 'AVAILABLE') {
            try {
              await appData.services.bookService.updateBookStatus(bookId, 'OUT_OF_STOCK');
              message.success('库存为0，已自动标记为售罄状态');
            } catch (error) {
              console.error('自动标记售罄失败:', error);
              message.warning('书籍更新成功，但自动标记售罄失败');
            }
          }
        } else if (cleanData.stock > 0) {
          // 如果库存大于0且当前状态是售罄，自动恢复为可用
          const currentStatus = editingBook.status || 'AVAILABLE';
          if (currentStatus === 'OUT_OF_STOCK') {
            try {
              await appData.services.bookService.updateBookStatus(bookId, 'AVAILABLE');
              message.success('库存已补充，已自动恢复为可用状态');
            } catch (error) {
              console.error('自动恢复可用状态失败:', error);
              message.warning('书籍更新成功，但自动恢复可用状态失败');
            }
          }
        }
      } else {
        // 添加新书籍
        const result = await appData.services.bookService.createBook(cleanData);
        bookId = result.id || result.data?.id;
        message.success('书籍添加成功');
        
        // 检查新书籍的库存状态
        if (cleanData.stock === 0) {
          try {
            await appData.services.bookService.updateBookStatus(bookId, 'OUT_OF_STOCK');
            message.success('新书籍库存为0，已自动标记为售罄状态');
          } catch (error) {
            console.error('新书籍自动标记售罄失败:', error);
            message.warning('书籍添加成功，但自动标记售罄失败');
          }
        }
      }
      
      // 重新加载书籍列表
      await loadBooks();
      
      setIsModalVisible(false);
      setEditingBook(null);
      form.resetFields();
    } catch (error) {
      console.error('❌ [BookManagement] 保存书籍失败:', error);
      message.error('保存失败：' + error.message);
    }
  };

  // 过滤书籍
  const filteredBooks = books.filter(book =>
    (book.title || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (book.author || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (book.isbn || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: '封面',
      dataIndex: 'coverImage',
      key: 'coverImage',
      width: 80,
      render: (coverImage) => (
        <Image
          width={50}
          height={60}
          src={coverImage}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price?.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <span style={{ color: stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red' }}>
          {stock}
        </span>
      ),
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        // 默认状态为可用（兼容没有status字段的旧数据）
        const currentStatus = status || 'AVAILABLE';
        
        const statusConfig = {
          'AVAILABLE': { color: 'green', text: '可用' },
          'OUT_OF_STOCK': { color: 'orange', text: '售罄' },
          'DISCONTINUED': { color: 'red', text: '停产' }
        };
        
        const config = statusConfig[currentStatus] || statusConfig['AVAILABLE'];
        
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => {
        const currentStatus = record.status || 'AVAILABLE';
        
        const getStatusActions = () => {
          switch (currentStatus) {
            case 'AVAILABLE':
              return [
                {
                  key: 'out_of_stock',
                  label: '标记售罄',
                  icon: <ExclamationOutlined />,
                  onClick: () => handleMarkOutOfStock(record.id),
                  confirm: '确定要标记为售罄吗？'
                },
                {
                  key: 'discontinue',
                  label: '下架停产',
                  icon: <EyeInvisibleOutlined />,
                  onClick: () => handleDiscontinueBook(record.id),
                  confirm: '确定要下架这本书吗？下架后用户将无法购买',
                  danger: true
                }
              ];
            case 'OUT_OF_STOCK':
              return [
                {
                  key: 'restore',
                  label: '恢复可用',
                  icon: <BookOutlined />,
                  onClick: () => handleRestoreBook(record.id),
                  confirm: '确定要恢复为可用状态吗？'
                },
                {
                  key: 'discontinue',
                  label: '永久下架',
                  icon: <EyeInvisibleOutlined />,
                  onClick: () => handleDiscontinueBook(record.id),
                  confirm: '确定要永久下架这本书吗？',
                  danger: true
                }
              ];
            case 'DISCONTINUED':
              return [
                {
                  key: 'restore',
                  label: '重新上架',
                  icon: <BookOutlined />,
                  onClick: () => handleRestoreBook(record.id),
                  confirm: '确定要重新上架这本书吗？'
                }
              ];
            default:
              return [];
          }
        };

        const statusActions = getStatusActions();
        
        const dropdownItems = statusActions.map(action => ({
          key: action.key,
          label: action.confirm ? (
            <Popconfirm
              title={action.confirm}
              onConfirm={action.onClick}
              okText="确定"
              cancelText="取消"
            >
              <span style={{ color: action.danger ? '#ff4d4f' : undefined }}>
                {action.icon} {action.label}
              </span>
            </Popconfirm>
          ) : (
            <span onClick={action.onClick} style={{ color: action.danger ? '#ff4d4f' : undefined }}>
              {action.icon} {action.label}
            </span>
          )
        }));
        
        return (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditBook(record)}
            >
              编辑
            </Button>
            {statusActions.length > 0 && (
              <Dropdown
                menu={{ items: dropdownItems }}
                placement="bottomRight"
              >
                <Button type="link">
                  状态管理 <DownOutlined />
                </Button>
              </Dropdown>
            )}
          </Space>
        );
      },
    },
  ];

  // 上传组件配置
  const uploadProps = {
    name: 'file',
    listType: 'picture',
    beforeUpload: () => false, // 阻止自动上传
    onChange: (info) => {
      if (info.file.status === 'removed') {
        form.setFieldsValue({ coverImage: '' });
      }
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            <BookOutlined /> 书籍管理
          </Title>
          <Space>
            <Search
              placeholder="搜索书名、作者或ISBN"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleAddBook}
            >
              添加书籍
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredBooks}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 本书`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 编辑/添加书籍模态框 */}
      <Modal
        title={editingBook ? '编辑书籍' : '添加书籍'}
        open={isModalVisible}
        onOk={handleSaveBook}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBook(null);
          form.resetFields();
        }}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="书名"
            rules={[{ required: true, message: '请输入书名' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="author"
            label="作者"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="isbn"
            label="ISBN编号"
            rules={[{ required: true, message: '请输入ISBN编号' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/¥\s?|(,*)/g, '')}
            />
          </Form.Item>
          
          <Form.Item
            name="stock"
            label="库存量"
            rules={[{ required: true, message: '请输入库存量' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="publisher"
            label="出版社"
          >
            <Input placeholder="选填" />
          </Form.Item>
          
          <Form.Item
            name="coverImage"
            label="封面图片URL"
          >
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="书籍简介"
          >
            <TextArea rows={4} placeholder="请输入书籍简介" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookManagement; 