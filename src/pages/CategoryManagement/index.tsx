import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Modal, Form, Input, message, Space, Tag, Tree, Row, Col, Popconfirm, Switch, Select, InputNumber, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, AppstoreOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import BackButton from '@/components/BackButton'
import type { DataNode } from 'antd/es/tree'

interface Category {
  id: string
  name: string
  code: string
  parentId?: string
  parentName?: string
  level: number
  sortOrder: number
  status: 'ACTIVE' | 'INACTIVE'
  description?: string
  icon?: string
  createdAt: string
  updatedAt: string
  children?: Category[]
}

export default function CategoryManagement() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // 模拟分类数据
  const mockCategories: Category[] = [
    {
      id: '1',
      name: '营养品',
      code: 'NUTRITION',
      level: 1,
      sortOrder: 1,
      status: 'ACTIVE',
      description: '各类营养保健品',
      icon: '🌿',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      children: [
        {
          id: '11',
          name: '维生素',
          code: 'VITAMINS',
          parentId: '1',
          parentName: '营养品',
          level: 2,
          sortOrder: 1,
          status: 'ACTIVE',
          description: '各类维生素产品',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '12',
          name: '矿物质',
          code: 'MINERALS',
          parentId: '1',
          parentName: '营养品',
          level: 2,
          sortOrder: 2,
          status: 'ACTIVE',
          description: '各类矿物质产品',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        }
      ]
    },
    {
      id: '2',
      name: '日用品',
      code: 'DAILY',
      level: 1,
      sortOrder: 2,
      status: 'ACTIVE',
      description: '日常生活用品',
      icon: '🧴',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      children: [
        {
          id: '21',
          name: '洗护用品',
          code: 'CARE_PRODUCTS',
          parentId: '2',
          parentName: '日用品',
          level: 2,
          sortOrder: 1,
          status: 'ACTIVE',
          description: '洗发护发等洗护产品',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        }
      ]
    },
    {
      id: '3',
      name: '美妆',
      code: 'BEAUTY',
      level: 1,
      sortOrder: 3,
      status: 'ACTIVE',
      description: '美容化妆产品',
      icon: '💄',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '4',
      name: '食品饮料',
      code: 'FOOD',
      level: 1,
      sortOrder: 4,
      status: 'ACTIVE',
      description: '各类食品和饮料',
      icon: '🥤',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '5',
      name: '电子产品',
      code: 'ELECTRONICS',
      level: 1,
      sortOrder: 5,
      status: 'INACTIVE',
      description: '电子设备和配件',
      icon: '📱',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
  ]

  const fetchCategories = async () => {
    setLoading(true)
    try {
      // 这里应该调用真实的API获取分类数据
      // const response = await adminCategoryApi.getList()
      // setCategories(response.data || [])
      
      // 模拟数据
      setCategories(mockCategories)
      setFilteredCategories(mockCategories)
    } catch (error) {
      message.error('加载分类列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    if (!value) {
      setFilteredCategories(categories)
      return
    }
    
    const filtered = categories.filter(cat => 
      cat.name.toLowerCase().includes(value.toLowerCase()) ||
      cat.code.toLowerCase().includes(value.toLowerCase()) ||
      cat.description?.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredCategories(filtered)
  }

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择分类')
      return
    }
    Modal.confirm({
      title: `确定删除选中的 ${selectedRowKeys.length} 个分类吗？`,
      content: '删除分类会同时删除其所有子分类，请谨慎操作！',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 这里应该调用批量删除API
          message.success(`成功删除 ${selectedRowKeys.length} 个分类`)
          setSelectedRowKeys([])
          fetchCategories()
        } catch (error: any) {
          message.error(error.message || '批量删除失败')
        }
      },
    })
  }

  const handleStatusChange = async (categoryId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      // 这里应该调用更新状态API
      message.success('状态更新成功')
      fetchCategories()
    } catch (error: any) {
      message.error(error.message || '状态更新失败')
    }
  }

  const editCategory = (category: Category) => {
    setSelectedCategory(category)
    form.setFieldsValue({
      ...category,
      parentId: category.parentId || undefined
    })
    setModalVisible(true)
  }

  const deleteCategory = (category: Category) => {
    Modal.confirm({
      title: '确定删除该分类吗？',
      content: category.children && category.children.length > 0 
        ? `该分类下有 ${category.children.length} 个子分类，删除会同时删除所有子分类！`
        : '删除后无法恢复，请谨慎操作！',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 这里应该调用删除API
          message.success('删除成功')
          fetchCategories()
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      },
    })
  }

  const onFinish = async (values: any) => {
    try {
      if (selectedCategory) {
        // 更新分类
        // await adminCategoryApi.update(selectedCategory.id, values)
        message.success('更新分类成功')
      } else {
        // 创建新分类
        // await adminCategoryApi.create(values)
        message.success('创建分类成功')
      }
      setModalVisible(false)
      form.resetFields()
      setSelectedCategory(null)
      fetchCategories()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const getParentOptions = () => {
    return categories
      .filter(cat => cat.level === 1)
      .map(cat => ({
        label: cat.name,
        value: cat.id
      }))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const columns = [
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 80,
      render: (icon: string) => {
        if (!icon) return '-'
        if (icon.startsWith('http')) {
          return <img src={icon} alt="icon" style={{ width: 32, height: 32, objectFit: 'contain' }} />
        }
        return <span style={{ fontSize: 20 }}>{icon}</span>
      },
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name: string, record: Category) => (
        <div style={{ paddingLeft: (record.level - 1) * 20 }}>
          {record.level > 1 && <span style={{ marginRight: 8 }}>└─</span>}
          {name}
        </div>
      ),
    },
    {
      title: '分类编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '层级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: number) => `L${level}`,
    },
    {
      title: '父分类',
      dataIndex: 'parentName',
      key: 'parentName',
      width: 120,
      render: (parentName: string) => parentName || '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Category) => (
        <Switch
          checked={status === 'ACTIVE'}
          onChange={(checked) => handleStatusChange(record.id, checked ? 'ACTIVE' : 'INACTIVE')}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Category) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => editCategory(record)}>
            编辑
          </Button>
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteCategory(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="category-management-page fade-in-down">
      {/* 页面头部 */}
      <div className="page-header">
        <BackButton fallback="/products" />
        <h1 className="page-title">商品分类管理</h1>
      </div>

      {/* 统计卡片 */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>总分类数</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{categories.length}</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#52c41a' }}>一级分类</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {categories.filter(cat => cat.level === 1).length}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#faad14' }}>二级分类</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {categories.filter(cat => cat.level === 2).length}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#f5222d' }}>启用分类</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {categories.filter(cat => cat.status === 'ACTIVE').length}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 搜索和操作 */}
      <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索分类名称或编码"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={16}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setSelectedCategory(null)
                  form.resetFields()
                  setModalVisible(true)
                }}
              >
                新增分类
              </Button>
              {selectedRowKeys.length > 0 && (
                <Button danger onClick={handleBatchDelete}>
                  批量删除 ({selectedRowKeys.length})
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 分类列表 */}
      <Card className="card-with-shadow">
        <Table
          columns={columns}
          dataSource={filteredCategories}
          loading={loading}
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 编辑模态 */}
      <Modal
        title={selectedCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setSelectedCategory(null)
        }}
        width={600}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="name" 
                label="分类名称" 
                rules={[{ required: true, message: '请输入分类名称' }]}
              >
                <Input placeholder="输入分类名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="code" 
                label="分类编码" 
                rules={[{ required: true, message: '请输入分类编码' }]}
              >
                <Input placeholder="输入分类编码" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item 
            name="parentId" 
            label="父分类"
          >
            <Select 
              placeholder="选择父分类（不选则为一级分类）"
              allowClear
              options={getParentOptions()}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="sortOrder" 
                label="排序号" 
                rules={[{ required: true, message: '请输入排序号' }]}
                initialValue={1}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="输入排序号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="status" 
                label="状态" 
                rules={[{ required: true, message: '请选择状态' }]}
                initialValue="ACTIVE"
              >
                <Select placeholder="选择状态">
                  <Select.Option value="ACTIVE">启用</Select.Option>
                  <Select.Option value="INACTIVE">禁用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="description" 
            label="描述"
          >
            <Input.TextArea 
              placeholder="输入分类描述" 
              rows={3} 
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item 
            name="icon" 
            label="图标"
          >
            <Input placeholder="输入图标名称或URL" />
            <div style={{ marginTop: 8 }}>
              <Upload
                accept="image/*"
                maxCount={1}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/')
                  if (!isImage) {
                    message.error('只能上传图片文件!')
                    return false
                  }
                  
                  const isLt2M = file.size / 1024 / 1024 < 2
                  if (!isLt2M) {
                    message.error('图标大小不能超过2MB!')
                    return false
                  }
                  
                  return true
                }}
                customRequest={async (options) => {
                  const { file, onSuccess, onError } = options
                  try {
                    // 模拟上传过程
                    await new Promise(resolve => setTimeout(resolve, 500))
                    
                    // 模拟上传成功，返回图片URL
                    const imageUrl = URL.createObjectURL(file as File)
                    
                    // 更新表单字段
                    form.setFieldsValue({ icon: imageUrl })
                    
                    onSuccess?.({ url: imageUrl })
                    message.success('图标上传成功')
                  } catch (error) {
                    onError?.(error as Error)
                    message.error('图标上传失败')
                  }
                }}
                onRemove={() => {
                  form.setFieldsValue({ icon: '' })
                }}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                <Button icon={<UploadOutlined />}>上传图标</Button>
              </Upload>
              <div style={{ color: '#999', fontSize: '12px', marginTop: 4 }}>
                支持 JPG、PNG、GIF 格式，大小不超过 2MB，建议尺寸 200x200px
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}