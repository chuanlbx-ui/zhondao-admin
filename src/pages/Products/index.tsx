import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Modal, Form, Input, InputNumber, Select, message, Space, Tag, Row, Col, Statistic, Table as AntTable, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, UploadOutlined, PictureOutlined, AppstoreOutlined } from '@ant-design/icons'
import { adminProductApi } from '@/api'
import BackButton from '@/components/BackButton'
import { useNavigate } from 'react-router-dom'
import { getPriceDiscountObject } from '@/utils/levelConfig'

export default function Products() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [fileList, setFileList] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  // 商品分类
  const categories = [
    { label: '营养品', value: 'NUTRITION' },
    { label: '日用品', value: 'DAILY' },
    { label: '美妆', value: 'BEAUTY' },
    { label: '食品饮料', value: 'FOOD' },
    { label: '电子产品', value: 'ELECTRONICS' },
  ]

  // 商品品牌
  const brands = [
    { label: '中道', value: 'ZHONGDAO' },
    { label: '自然之宝', value: 'NATURE_BOUNTY' },
    { label: '汤臣倍健', value: 'BY_HEALTH' },
    { label: '安利', value: 'AMWAY' },
    { label: '无限极', value: 'INFINITUS' },
  ]

  // 计量单位
  const units = [
    { label: '件', value: 'PIECE' },
    { label: '盒', value: 'BOX' },
    { label: '瓶', value: 'BOTTLE' },
    { label: '袋', value: 'BAG' },
    { label: '罐', value: 'CAN' },
    { label: '支', value: 'STICK' },
  ]

  // 商品状态
  const productStatus = [
    { label: '在售', value: 'ACTIVE' },
    { label: '下架', value: 'INACTIVE' },
    { label: '草稿', value: 'DRAFT' },
  ]

  // 分层定价配置（基于用户等级的折扣）- 使用统一的等级配置
  const priceDiscount = getPriceDiscountObject()

  const fetchProducts = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      // 调用实际API获取商品数据
      const response = await adminProductApi.getList({
        page,
        limit: pageSize,
        search: searchText,
        category: filterCategory
      })
      
      const productData = response.data || response
      const productsList = productData.items || productData.list || []
      setProducts(productsList)
      applyFilters(productsList, searchText, filterCategory)
      setPagination({
        current: page,
        pageSize,
        total: productData.total || 0
      })
    } catch (error: any) {
      console.error('加载商品列表失败:', error)
      message.error(error.message || '加载商品列表失败')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (data: any[], search: string, category?: string) => {
    let filtered = data
    if (search) {
      filtered = filtered.filter(p => 
        p.name.includes(search) || 
        p.id.includes(search) ||
        p.sku.includes(search)
      )
    }
    if (category) {
      filtered = filtered.filter(p => p.category === category)
    }
    setFilteredProducts(filtered)
    setPagination(prev => ({ ...prev, total: filtered.length }))
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    applyFilters(products, value, filterCategory)
  }

  const handleFilterCategory = (value: string | undefined) => {
    setFilterCategory(value)
    applyFilters(products, searchText, value)
  }

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择商品')
      return
    }
    Modal.confirm({
      title: `确定删除选中的 ${selectedRowKeys.length} 个商品吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 批量删除每个商品
          for (const productId of selectedRowKeys) {
            await adminProductApi.delete(productId as string)
          }
          message.success(`成功删除 ${selectedRowKeys.length} 个商品`)
          setSelectedRowKeys([])
          fetchProducts()
        } catch (error: any) {
          message.error(error.message || '批量删除失败')
        }
      },
    })
  }

  const handleExport = () => {
    try {
      const csvData = [
        ['商品ID', '商品名称', 'SKU', '分类', '品牌', '原价', '促销价', '成本', '库存', '状态', '重量(g)', '描述'],
        ...filteredProducts.map(p => [
          p.id, 
          p.name, 
          p.sku, 
          getCategoryName(p.category), 
          getBrandName(p.brand) || '-',
          p.basePrice, 
          p.salePrice || '',
          p.cost, 
          p.stock, 
          p.status === 'ACTIVE' ? '在售' : p.status === 'INACTIVE' ? '下架' : '草稿',
          p.weight || '',
          p.description || ''
        ])
      ]
      const csvString = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `商品列表_${new Date().getTime()}.csv`
      link.click()
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const getCategoryName = (cat: string) => {
    const catMap: any = { 
      NUTRITION: '营养品', 
      DAILY: '日用品',
      BEAUTY: '美妆',
      FOOD: '食品饮料',
      ELECTRONICS: '电子产品'
    }
    return catMap[cat] || cat
  }

  const getBrandName = (brand: string) => {
    const brandMap: any = {
      ZHONGDAO: '中道',
      NATURE_BOUNTY: '自然之宝',
      BY_HEALTH: '汤臣倍健',
      AMWAY: '安利',
      INFINITUS: '无限极'
    }
    return brandMap[brand] || brand
  }

  const columns = [
    { title: '商品ID', dataIndex: 'id', key: 'id', width: 80, sorter: (a: any, b: any) => a.id.localeCompare(b.id) },
    { title: '商品名称', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 100 },
    { 
      title: '分类', 
      dataIndex: 'category', 
      key: 'category',
      width: 100,
      render: (cat: string) => <Tag color="blue">{getCategoryName(cat)}</Tag>
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
      render: (brand: string) => brand ? getBrandName(brand) : '-'
    },
    {
      title: '价格',
      dataIndex: 'basePrice',
      key: 'price',
      width: 120,
      render: (_: any, record: any) => (
        <div>
          <div style={{ color: '#f5222d' }}>¥{record.basePrice?.toFixed(2)}</div>
          {record.salePrice && record.salePrice < record.basePrice && (
            <div style={{ color: '#52c41a', fontSize: '12px' }}>促¥{record.salePrice.toFixed(2)}</div>
          )}
        </div>
      ),
      sorter: (a: any, b: any) => a.basePrice - b.basePrice,
    },
    {
      title: '成本',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost: number) => `¥${cost?.toFixed(2)}`,
      sorter: (a: any, b: any) => a.cost - b.cost,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (stock: number, record: any) => {
        const isLowStock = stock <= (record.lowStockThreshold || 10)
        return (
          <div>
            <Tag color={stock > 0 ? (isLowStock ? 'orange' : 'green') : 'red'}>{stock}</Tag>
            {isLowStock && stock > 0 && (
              <div style={{ fontSize: '12px', color: '#fa8c16' }}>库存不足</div>
            )}
          </div>
        )
      },
      sorter: (a: any, b: any) => a.stock - b.stock,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusMap = {
          ACTIVE: { text: '在售', color: 'green' },
          INACTIVE: { text: '下架', color: 'red' },
          DRAFT: { text: '草稿', color: 'default' }
        }
        const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, color: 'default' }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: '重量(g)',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (weight: number) => weight ? `${weight}g` : '-',
      sorter: (a: any, b: any) => (a.weight || 0) - (b.weight || 0),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => editProduct(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteProduct(record.id)} />
        </Space>
      ),
    },
  ]

  const editProduct = (product: any) => {
    form.setFieldsValue(product)
    setSelectedProduct(product)
    // 设置图片文件列表
    if (product.imageUrls && product.imageUrls.length > 0) {
      const imageFiles = product.imageUrls.map((url: string, index: number) => ({
        uid: `-${index + 1}`,
        name: `image_${index + 1}.jpg`,
        status: 'done',
        url: url,
      }))
      setFileList(imageFiles)
    } else {
      setFileList([])
    }
    setModalVisible(true)
  }

  const deleteProduct = (id: string) => {
    Modal.confirm({
      title: '确定删除该商品吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await adminProductApi.delete(id)
          if (response.success || response.data) {
            message.success('删除成功')
            fetchProducts()
          }
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      },
    })
  }

  // 图片上传处理函数
  const handleImageUpload = (info: any) => {
    const { file, fileList } = info
    setFileList(fileList)
    
    // 获取已上传成功的图片URL
    const imageUrls = fileList
      .filter((f: any) => f.status === 'done' && f.url)
      .map((f: any) => f.url)
    
    // 更新表单字段
    form.setFieldsValue({ imageUrls })
  }

  const beforeImageUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件!')
      return false
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('图片大小不能超过5MB!')
      return false
    }
    
    return true
  }

  const customImageUpload = async (options: any) => {
    const { file, onSuccess, onError } = options
    
    try {
      setUploading(true)
      
      // 创建FormData对象上传图片
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'product')
      
      // 调用后端上传接口
      const response = await adminApiClient.post('/admin/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const result = response.data || response
      if (result.url) {
        onSuccess({ url: result.url })
        message.success(`${file.name} 上传成功`)
      } else {
        throw new Error('上传失败，未返回图片URL')
      }
      
    } catch (error: any) {
      console.error('图片上传失败:', error)
      onError(error)
      message.error(`${file.name} 上传失败: ${error.message || '未知错误'}`)
    } finally {
      setUploading(false)
    }
  }

  const onFinish = async (values: any) => {
    try {
      if (selectedProduct) {
        // 更新商品
        const response = await adminProductApi.update(selectedProduct.id, values)
        if (response.success || response.data) {
          message.success('更新商品成功')
        }
      } else {
        // 创建新商品
        const response = await adminProductApi.create(values)
        if (response.success || response.data) {
          message.success('创建商品成功')
        }
      }
      setModalVisible(false)
      form.resetFields()
      setSelectedProduct(null)
      setFileList([]) // 重置图片列表
      fetchProducts() // 刷新列表
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  return (
    <div className="products-page fade-in-down">
      {/* 页面头部 */}
      <div className="page-header">
        <BackButton fallback="/dashboard" />
        <h1 className="page-title">商品管理</h1>
      </div>

      {/* 统计卡片 */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <Statistic title="商品总数" value={products.length} suffix="件" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <Statistic title="库存总数" value={products.reduce((sum, p) => sum + p.stock, 0)} suffix="件" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <Statistic title="在售商品" value={products.filter(p => p.stock > 0).length} suffix="件" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <Statistic title="库存价值" value={products.reduce((sum, p) => sum + (p.basePrice * p.stock), 0)} prefix="¥" suffix="元" valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索商品ID、名称或SKU"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="按分类筛选"
              allowClear
              value={filterCategory}
              onChange={handleFilterCategory}
              style={{ width: '100%' }}
              options={categories}
            />
          </Col>
          <Col xs={24} sm={12} md={10}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setSelectedProduct(null)
                form.resetFields()
                setFileList([]) // 重置图片列表
                setModalVisible(true)
              }}>新增商品</Button>
              <Button icon={<AppstoreOutlined />} onClick={() => navigate('/category-management')}>
                分类管理
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
              {selectedRowKeys.length > 0 && (
                <Button danger onClick={handleBatchDelete}>
                  删除选中 ({selectedRowKeys.length})
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 商品列表 */}
      <Card className="card-with-shadow">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          loading={loading}
          pagination={pagination}
          onChange={(pag) => fetchProducts(pag.current || 1, pag.pageSize || 10)}
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 编辑模态 */}
      <Modal
        title={selectedProduct ? '编辑商品' : '新增商品'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false)
          setFileList([]) // 关闭时重置图片列表
        }}
        width={900}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}> 
            <Input placeholder="输入商品名称" />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}> 
            <Input placeholder="输入商品SKU" />
          </Form.Item>
          <Form.Item name="category" label="商品分类" rules={[{ required: true }]}> 
            <Select placeholder="选择商品分类" options={categories} />
          </Form.Item>
          <Form.Item name="basePrice" label="原价(¥)" rules={[{ required: true }]}> 
            <InputNumber placeholder="输入商品原价" min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="salePrice" label="售卖价(¥)">
            <InputNumber placeholder="输入售卖价" min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cost" label="成本(¥)" rules={[{ required: true }]}> 
            <InputNumber placeholder="输入成本价" min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="库存(件)" rules={[{ required: true }]}> 
            <InputNumber placeholder="输入库存数量" min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="unit" label="计量单位">
                <Select placeholder="选择单位" options={[
                  { label: '件', value: 'PIECE' },
                  { label: '盒', value: 'BOX' },
                  { label: '瓶', value: 'BOTTLE' },
                  { label: '袋', value: 'BAG' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="barcode" label="条码">
                <Input placeholder="输入商品条码" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="brand" label="品牌">
                <Input placeholder="输入品牌名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="weight" label="重量(g)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="length" label="长(cm)">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="width" label="宽(cm)">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="height" label="高(cm)">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}> 
            <Select placeholder="选择状态" options={[
              { label: '上架', value: 'ACTIVE' },
              { label: '下架', value: 'INACTIVE' },
              { label: '草稿', value: 'DRAFT' },
            ]} />
          </Form.Item>
          <Form.Item name="lowStockThreshold" label="库存预警阈值">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="imageUrls" label="商品图片">
            <Upload
              multiple
              listType="picture-card"
              fileList={fileList}
              customRequest={customImageUpload}
              beforeUpload={beforeImageUpload}
              onChange={handleImageUpload}
              accept="image/*"
              maxCount={10}
            >
              {fileList.length >= 10 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
            <div style={{ color: '#999', fontSize: '12px', marginTop: 8 }}>
              支持批量上传，最多10张图片，单张不超过5MB
            </div>
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入并回车添加标签" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="输入商品描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 分层定价参考表 - 作为页面底部提示 */}
      <Card className="card-with-shadow" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>分层定价参考</h3>
        <Table
          columns={[
            { title: '用户等级', dataIndex: 'level', key: 'level', width: 120 },
            { title: '折扣比例', dataIndex: 'discount', key: 'discount', width: 100 },
            { title: '¥599原价商品的价格', dataIndex: 'example', key: 'example' },
          ]}
          dataSource={Object.entries(priceDiscount).map(([level, discount]: any) => ({
            level,
            discount: `${(discount * 100).toFixed(1)}%`,
            example: `¥${(599 * discount).toFixed(2)}`,
          }))}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}
