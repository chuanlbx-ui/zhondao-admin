import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Tag, Space, Drawer, Tabs, Statistic, Row, Col, message, Input, Select, Modal, Timeline, Badge, DatePicker } from 'antd'
import { EyeOutlined, CheckOutlined, SearchOutlined, DownloadOutlined, SendOutlined, CloseOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { adminOrderApi } from '@/api'
import BackButton from '@/components/BackButton'

export default function Orders() {
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined)
  const [filterType, setFilterType] = useState<string | undefined>(undefined)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [statistics, setStatistics] = useState<any>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])

  // 订单类型配置
  const orderTypeConfig: any = {
    'RETAIL': { label: '零售订单', color: 'blue', icon: '🛍️' },
    'PURCHASE': { label: '采购订单', color: 'green', icon: '📦' },
    'DISTRIBUTION': { label: '分配订单', color: 'purple', icon: '🚚' },
  }

  const statusConfig: any = {
    'PENDING': { label: '待处理', color: 'orange' },
    'PROCESSING': { label: '处理中', color: 'blue' },
    'SHIPPED': { label: '已发货', color: 'cyan' },
    'DELIVERED': { label: '已送达', color: 'green' },
    'CANCELLED': { label: '已取消', color: 'red' },
  }

  const fetchOrders = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = {
        page,
        pageSize,
        search: searchText,
        status: filterStatus,
        type: filterType,
      }
      
      const response = await adminOrderApi.getList(params)
      
      if (response.success && response.data) {
        const { orders: orderList, total, page: currentPage, pageSize: currentPageSize } = response.data
        
        // 格式化订单数据，确保字段一致性
        const formattedOrders = orderList.map((order: any) => ({
          id: order.id,
          orderNo: order.orderNo,
          type: order.type || 'RETAIL',
          buyerName: order.buyerName || order.buyer?.name || '未知买家',
          sellerName: order.sellerName || order.seller?.name || '未知卖家',
          totalAmount: order.totalAmount || order.amount || 0,
          status: order.status || 'PENDING',
          createdAt: order.createdAt || order.created_at,
          updatedAt: order.updatedAt || order.updated_at,
          items: order.items || order.orderItems || [],
          shippingAddress: order.shippingAddress || order.address || '暂无地址',
          phone: order.phone || order.buyer?.phone || '暂无电话',
          discount: order.discount || 1.0,
          commission: order.commission || 0,
          timeline: order.timeline || order.logs || [],
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          logisticsInfo: order.logisticsInfo,
          remarks: order.remarks,
        }))
        
        setOrders(formattedOrders)
        setFilteredOrders(formattedOrders)
        setPagination({
          current: currentPage || page,
          pageSize: currentPageSize || pageSize,
          total: total || orderList.length,
        })
      } else {
        // 如果API返回格式不符合预期，使用模拟数据作为降级方案
        console.warn('订单API返回格式异常，使用模拟数据')
        useMockData()
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
      message.error('加载订单列表失败，请稍后重试')
      // 出错时使用模拟数据
      useMockData()
    } finally {
      setLoading(false)
    }
  }
  
  // 模拟数据降级方案
  const useMockData = () => {
    const mockOrders = [
      { 
        id: '1', 
        orderNo: 'ORD-2024-0001', 
        type: 'PURCHASE',
        buyerName: '李四（三星店长）', 
        sellerName: '张三（五星店长）',
        totalAmount: 35000, 
        status: 'PENDING', 
        createdAt: '2024-11-20 10:30',
        items: [
          { name: '营养素A', price: 599, quantity: 10, total: 5990 },
          { name: '营养素B', quantity: 20, total: 17980 },
          { name: '美颜面膜', quantity: 15, total: 5985 }
        ],
        shippingAddress: '上海浦东新区世纪大道1号',
        phone: '13900139000',
        discount: 0.3,
        commission: 2100,
        timeline: [
          { status: '订单创建', time: '2024-11-20 10:30' },
        ]
      },
      { 
        id: '2', 
        orderNo: 'ORD-2024-0002', 
        type: 'RETAIL',
        buyerName: '张三（普通会员）', 
        sellerName: '系统',
        totalAmount: 5000, 
        status: 'SHIPPED', 
        createdAt: '2024-11-19 14:15',
        items: [
          { name: '营养素A', price: 599, quantity: 5, total: 2995 },
          { name: '日用洗护', quantity: 10, total: 2990 }
        ],
        shippingAddress: '北京朝阳区建国路1号',
        phone: '13800138000',
        discount: 1.0,
        timeline: [
          { status: '订单创建', time: '2024-11-19 14:15' },
          { status: '付款成功', time: '2024-11-19 14:20' },
          { status: '已发货', time: '2024-11-19 15:00' },
        ]
      },
    ]
    setOrders(mockOrders)
    setFilteredOrders(mockOrders)
    setPagination({ current: 1, pageSize: 10, total: mockOrders.length })
  }

  const applyFilters = (data: any[], search: string, status?: string, type?: string) => {
    let filtered = data
    if (search) {
      filtered = filtered.filter(o => 
        o.orderNo.includes(search) || 
        o.buyerName.includes(search) || 
        o.phone.includes(search)
      )
    }
    if (status) {
      filtered = filtered.filter(o => o.status === status)
    }
    if (type) {
      filtered = filtered.filter(o => o.type === type)
    }
    setFilteredOrders(filtered)
    setPagination(prev => ({ ...prev, total: filtered.length }))
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    applyFilters(orders, value, filterStatus, filterType)
  }

  const handleFilterStatus = (value: string | undefined) => {
    setFilterStatus(value)
    applyFilters(orders, searchText, value, filterType)
  }

  const handleFilterType = (value: string | undefined) => {
    setFilterType(value)
    applyFilters(orders, searchText, filterStatus, value)
  }
  
  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates)
    applyFilters(orders, searchText, filterStatus, filterType)
  }
  
  const handleRefresh = () => {
    setSearchText('')
    setFilterStatus(undefined)
    setFilterType(undefined)
    setDateRange(null)
    setSelectedRowKeys([])
    setSelectedRows([])
    fetchOrders()
    fetchStatistics()
  }
  
  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    if (sorter.field) {
      // Handle sorting if needed
    }
  }

  const handleExport = () => {
    try {
      const csvData = [
        ['订单号', '订单类型', '买方', '卖方', '金额', '状态', '创建时间'],
        ...filteredOrders.map(o => [
          o.orderNo, 
          orderTypeConfig[o.type]?.label, 
          o.buyerName, 
          o.sellerName,
          o.totalAmount, 
          statusConfig[o.status]?.label, 
          o.createdAt
        ])
      ]
      const csvString = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `订单列表_${new Date().getTime()}.csv`
      link.click()
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await adminOrderApi.getStatistics()
      if (response.success && response.data) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error('获取订单统计失败:', error)
      // 使用模拟统计数据
      setStatistics({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        totalCommission: orders.filter(o => o.type === 'PURCHASE').reduce((sum, o: any) => sum + (o.commission || 0), 0),
        todayOrders: orders.filter(o => {
          const today = new Date().toDateString()
          const orderDate = new Date(o.createdAt).toDateString()
          return orderDate === today
        }).length,
        weekOrders: orders.filter(o => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(o.createdAt) >= weekAgo
        }).length,
      })
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchStatistics()
  }, [])

  const columns: any[] = [
    { 
      title: '订单号', 
      dataIndex: 'orderNo', 
      key: 'orderNo', 
      width: 140, 
      sorter: (a: any, b: any) => a.orderNo.localeCompare(b.orderNo),
      fixed: 'left' as const,
    },
    {
      title: '订单类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      filters: [
        { text: '零售订单', value: 'RETAIL' },
        { text: '采购订单', value: 'PURCHASE' },
        { text: '分配订单', value: 'DISTRIBUTION' },
      ],
      onFilter: (value: any, record: any) => record.type === value,
      render: (type: string) => (
        <Tag color={orderTypeConfig[type]?.color}>{orderTypeConfig[type]?.icon} {orderTypeConfig[type]?.label}</Tag>
      ),
    },
    { 
      title: '买方', 
      dataIndex: 'buyerName', 
      key: 'buyerName',
      width: 150,
      ellipsis: true,
    },
    { 
      title: '卖方', 
      dataIndex: 'sellerName', 
      key: 'sellerName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `¥${amount.toFixed(2)}`,
      sorter: (a: any, b: any) => a.totalAmount - b.totalAmount,
      align: 'right' as const,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '待处理', value: 'PENDING' },
        { text: '处理中', value: 'PROCESSING' },
        { text: '已发货', value: 'SHIPPED' },
        { text: '已送达', value: 'DELIVERED' },
        { text: '已取消', value: 'CANCELLED' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => (
        <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.label}</Tag>
      ),
    },
    { 
      title: '创建时间', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      width: 160, 
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => showOrderDetail(record)}
            title="查看详情"
          />
          {record.status === 'PENDING' && (
            <>
              <Button 
                type="text" 
                icon={<SendOutlined />} 
                onClick={() => shipOrder(record.id)}
                title="确认发货"
              >
                发货
              </Button>
              <Button 
                type="text" 
                danger 
                icon={<CloseOutlined />} 
                onClick={() => cancelOrder(record.id)}
                title="取消订单"
              >
                取消
              </Button>
            </>
          )}
          {record.status === 'SHIPPED' && (
            <Button 
              type="text" 
              icon={<CheckOutlined />} 
              onClick={() => deliverOrder(record.id)}
              title="确认送达"
            >
              送达
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const showOrderDetail = (order: any) => {
    setSelectedOrder(order)
    setDrawerVisible(true)
  }

  const shipOrder = (id: string) => {
    Modal.confirm({
      title: '确认发货?',
      content: '请确认订单商品已准备完毕并可以发货',
      okText: '确定发货',
      cancelText: '取消',
      okButtonProps: { type: 'primary' },
      onOk: async () => {
        try {
          const response = await adminOrderApi.confirm(id)
          if (response.success || response.data) {
            message.success('订单已发货')
            fetchOrders()
          }
        } catch (error: any) {
          message.error(error.message || '操作失败')
        }
      },
    })
  }

  const deliverOrder = (id: string) => {
    Modal.confirm({
      title: '确认送达?',
      content: '请确认订单商品已成功送达买家',
      okText: '确定送达',
      cancelText: '取消',
      okButtonProps: { type: 'primary' },
      onOk: async () => {
        try {
          const response = await adminOrderApi.deliver(id)
          if (response.success || response.data) {
            message.success('订单已确认送达')
            fetchOrders()
          }
        } catch (error: any) {
          message.error(error.message || '操作失败')
        }
      },
    })
  }

  const cancelOrder = (id: string) => {
    Modal.confirm({
      title: '确认取消订单?',
      content: '取消订单后将无法恢复，请谨慎操作',
      okText: '确定取消',
      cancelText: '再考虑一下',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await adminOrderApi.cancel(id)
          if (response.success || response.data) {
            message.success('订单已取消')
            fetchOrders()
            fetchStatistics()
          }
        } catch (error: any) {
          message.error(error.message || '操作失败')
        }
      },
    })
  }

  const handleBatchShip = () => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要发货的订单')
      return
    }
    
    const pendingOrders = selectedRows.filter(row => row.status === 'PENDING')
    if (pendingOrders.length === 0) {
      message.warning('选中的订单中没有待发货的订单')
      return
    }
    
    Modal.confirm({
      title: `确认批量发货?`,
      content: `您选择了 ${pendingOrders.length} 个待发货订单，确认要批量发货吗？`,
      okText: '确认发货',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true)
          const results = await Promise.allSettled(
            pendingOrders.map(order => adminOrderApi.confirm(order.id))
          )
          
          const successCount = results.filter(result => result.status === 'fulfilled').length
          const failCount = results.filter(result => result.status === 'rejected').length
          
          if (successCount > 0) {
            message.success(`成功发货 ${successCount} 个订单`)
          }
          if (failCount > 0) {
            message.error(`${failCount} 个订单发货失败`)
          }
          
          setSelectedRowKeys([])
          setSelectedRows([])
          fetchOrders()
          fetchStatistics()
        } catch (error) {
          message.error('批量发货失败')
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const handleBatchCancel = () => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要取消的订单')
      return
    }
    
    const cancelableOrders = selectedRows.filter(row => 
      row.status === 'PENDING' || row.status === 'PROCESSING'
    )
    
    if (cancelableOrders.length === 0) {
      message.warning('选中的订单中没有可取消的订单')
      return
    }
    
    Modal.confirm({
      title: `确认批量取消?`,
      content: `您选择了 ${cancelableOrders.length} 个订单，确认要批量取消吗？此操作不可恢复！`,
      okText: '确认取消',
      cancelText: '再考虑一下',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true)
          const results = await Promise.allSettled(
            cancelableOrders.map(order => adminOrderApi.cancel(order.id))
          )
          
          const successCount = results.filter(result => result.status === 'fulfilled').length
          const failCount = results.filter(result => result.status === 'rejected').length
          
          if (successCount > 0) {
            message.success(`成功取消 ${successCount} 个订单`)
          }
          if (failCount > 0) {
            message.error(`${failCount} 个订单取消失败`)
          }
          
          setSelectedRowKeys([])
          setSelectedRows([])
          fetchOrders()
          fetchStatistics()
        } catch (error) {
          message.error('批量取消失败')
        } finally {
          setLoading(false)
        }
      },
    })
  }

  return (
    <div className="orders-page fade-in-down">
      {/* 页面头部 */}
      <div className="page-header">
        <BackButton fallback="/dashboard" />
        <h1 className="page-title">订单管理</h1>
      </div>

      {/* 统计卡片 */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow" hoverable>
            <Statistic 
              title="总订单数" 
              value={statistics?.totalOrders || 0} 
              suffix="笔" 
              valueStyle={{ color: '#1890ff' }}
              prefix={<span style={{ fontSize: '24px' }}>📊</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow" hoverable>
            <Statistic 
              title="今日订单" 
              value={statistics?.todayOrders || 0} 
              suffix="笔" 
              valueStyle={{ color: '#52c41a' }}
              prefix={<span style={{ fontSize: '24px' }}>📅</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow" hoverable>
            <Statistic 
              title="待处理订单" 
              value={statistics?.pendingOrders || 0} 
              suffix="笔" 
              valueStyle={{ color: '#faad14' }}
              prefix={<span style={{ fontSize: '24px' }}>⏳</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow" hoverable>
            <Statistic 
              title="订单总额" 
              value={statistics?.totalAmount || 0} 
              suffix="元" 
              valueStyle={{ color: '#f5222d' }}
              precision={2}
              prefix={<span style={{ fontSize: '24px' }}>💰</span>}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow" hoverable>
            <Statistic 
              title="本周订单" 
              value={statistics?.weekOrders || 0} 
              suffix="笔" 
              valueStyle={{ color: '#722ed1' }}
              prefix={<span style={{ fontSize: '24px' }}>📈</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow" hoverable>
            <Statistic 
              title="采购佣金" 
              value={statistics?.totalCommission || 0} 
              suffix="元" 
              valueStyle={{ color: '#eb2f96' }}
              precision={2}
              prefix={<span style={{ fontSize: '24px' }}>💎</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow" hoverable>
            <Statistic 
              title="平均订单金额" 
              value={statistics?.totalOrders ? (statistics.totalAmount / statistics.totalOrders) : 0} 
              suffix="元" 
              valueStyle={{ color: '#13c2c2' }}
              precision={2}
              prefix={<span style={{ fontSize: '24px' }}>📊</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow" hoverable>
            <Statistic 
              title="完成率" 
              value={statistics?.totalOrders ? ((statistics.totalOrders - (statistics.pendingOrders || 0)) / statistics.totalOrders * 100) : 0} 
              suffix="%" 
              valueStyle={{ color: '#52c41a' }}
              precision={1}
              prefix={<span style={{ fontSize: '24px' }}>✅</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="搜索订单号、买方或手机号"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="按状态筛选"
              allowClear
              value={filterStatus}
              onChange={handleFilterStatus}
              style={{ width: '100%' }}
              options={[
                { label: '待处理', value: 'PENDING' },
                { label: '处理中', value: 'PROCESSING' },
                { label: '已发货', value: 'SHIPPED' },
                { label: '已送达', value: 'DELIVERED' },
                { label: '已取消', value: 'CANCELLED' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="按类型筛选"
              allowClear
              value={filterType}
              onChange={handleFilterType}
              style={{ width: '100%' }}
              options={[
                { label: '零售订单', value: 'RETAIL' },
                { label: '采购订单', value: 'PURCHASE' },
                { label: '分配订单', value: 'DISTRIBUTION' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <DatePicker.RangePicker
              placeholder={['开始日期', '结束日期']}
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} style={{ width: '100%' }}>刷新</Button>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Button 
              type="text" 
              icon={<FilterOutlined />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? '隐藏高级筛选' : '显示高级筛选'}
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ width: '100%' }}>导出数据</Button>
          </Col>
          {selectedRows.length > 0 && (
            <Col xs={24} sm={12} md={12}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={handleBatchShip}
                  disabled={!selectedRows.some(row => row.status === 'PENDING')}
                >
                  批量发货 ({selectedRows.filter(row => row.status === 'PENDING').length})
                </Button>
                <Button 
                  danger 
                  icon={<CloseOutlined />}
                  onClick={handleBatchCancel}
                  disabled={!selectedRows.some(row => row.status === 'PENDING' || row.status === 'PROCESSING')}
                >
                  批量取消 ({selectedRows.filter(row => row.status === 'PENDING' || row.status === 'PROCESSING').length})
                </Button>
                <Tag color="blue">已选择 {selectedRows.length} 个订单</Tag>
              </Space>
            </Col>
          )}
        </Row>
        
        {showAdvancedFilters && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="最小金额"
                  prefix="¥"
                  type="number"
                  onChange={(e) => {
                    const minAmount = parseFloat(e.target.value) || 0
                    let filtered = orders
                    if (searchText) {
                      filtered = filtered.filter(o => 
                        o.orderNo?.toLowerCase().includes(searchText.toLowerCase()) || 
                        o.buyerName?.toLowerCase().includes(searchText.toLowerCase()) || 
                        o.sellerName?.toLowerCase().includes(searchText.toLowerCase()) ||
                        o.phone?.includes(searchText) ||
                        o.shippingAddress?.toLowerCase().includes(searchText.toLowerCase())
                      )
                    }
                    if (filterStatus) {
                      filtered = filtered.filter(o => o.status === filterStatus)
                    }
                    if (filterType) {
                      filtered = filtered.filter(o => o.type === filterType)
                    }
                    if (dateRange && dateRange.length === 2) {
                      filtered = filtered.filter(o => {
                        const orderDate = new Date(o.createdAt)
                        return orderDate >= dateRange[0].toDate() && orderDate <= dateRange[1].toDate()
                      })
                    }
                    filtered = filtered.filter(o => o.totalAmount >= minAmount)
                    setFilteredOrders(filtered)
                  }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="最大金额"
                  prefix="¥"
                  type="number"
                  onChange={(e) => {
                    const maxAmount = parseFloat(e.target.value) || Infinity
                    let filtered = orders
                    if (searchText) {
                      filtered = filtered.filter(o => 
                        o.orderNo?.toLowerCase().includes(searchText.toLowerCase()) || 
                        o.buyerName?.toLowerCase().includes(searchText.toLowerCase()) || 
                        o.sellerName?.toLowerCase().includes(searchText.toLowerCase()) ||
                        o.phone?.includes(searchText) ||
                        o.shippingAddress?.toLowerCase().includes(searchText.toLowerCase())
                      )
                    }
                    if (filterStatus) {
                      filtered = filtered.filter(o => o.status === filterStatus)
                    }
                    if (filterType) {
                      filtered = filtered.filter(o => o.type === filterType)
                    }
                    if (dateRange && dateRange.length === 2) {
                      filtered = filtered.filter(o => {
                        const orderDate = new Date(o.createdAt)
                        return orderDate >= dateRange[0].toDate() && orderDate <= dateRange[1].toDate()
                      })
                    }
                    filtered = filtered.filter(o => o.totalAmount <= maxAmount)
                    setFilteredOrders(filtered)
                  }}
                />
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* 订单列表 */}
      <Card className="card-with-shadow">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }))
              fetchOrders(page, pageSize)
            },
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: (newSelectedRowKeys, newSelectedRows) => {
              setSelectedRowKeys(newSelectedRowKeys)
              setSelectedRows(newSelectedRows)
            },
            getCheckboxProps: (record: any) => ({
              disabled: record.status === 'DELIVERED' || record.status === 'CANCELLED',
            }),
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0, padding: '16px', backgroundColor: '#fafafa' }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#999', fontSize: '12px' }}>收货地址：</span>
                      <div>{record.shippingAddress}</div>
                    </div>
                    <div>
                      <span style={{ color: '#999', fontSize: '12px' }}>联系电话：</span>
                      <div>{record.phone}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#999', fontSize: '12px' }}>商品数量：</span>
                      <div>{record.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)} 件</div>
                    </div>
                    <div>
                      <span style={{ color: '#999', fontSize: '12px' }}>折扣率：</span>
                      <div>{(record.discount * 100).toFixed(1)}%</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    {record.commission > 0 && (
                      <div>
                        <span style={{ color: '#999', fontSize: '12px' }}>佣金：</span>
                        <div style={{ color: '#52c41a', fontWeight: 'bold' }}>¥{record.commission.toFixed(2)}</div>
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
            ),
            rowExpandable: () => true,
          }}
        />
      </Card>

      {/* 订单详情抽屉 */}
      <Drawer
        title={`订单详情 - ${selectedOrder?.orderNo}`}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={800}
        extra={
          <Space>
            {selectedOrder?.status === 'PENDING' && (
              <>
                <Button type="primary" icon={<SendOutlined />} onClick={() => shipOrder(selectedOrder.id)}>
                  确认发货
                </Button>
                <Button danger icon={<CloseOutlined />} onClick={() => cancelOrder(selectedOrder.id)}>
                  取消订单
                </Button>
              </>
            )}
            {selectedOrder?.status === 'SHIPPED' && (
              <Button type="primary" icon={<CheckOutlined />} onClick={() => deliverOrder(selectedOrder.id)}>
                确认送达
              </Button>
            )}
          </Space>
        }
      >
        {selectedOrder && (
          <Tabs
            items={[
              {
                key: '1',
                label: '基本信息',
                children: (
                  <div>
                    <Row gutter={[24, 24]}>
                      <Col xs={24} sm={12}>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>订单类型</div>
                          <Tag color={orderTypeConfig[selectedOrder.type]?.color} style={{ fontSize: '14px', padding: '4px 8px' }}>
                            {orderTypeConfig[selectedOrder.type]?.icon} {orderTypeConfig[selectedOrder.type]?.label}
                          </Tag>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>订单状态</div>
                          <Tag color={statusConfig[selectedOrder.status]?.color} style={{ fontSize: '14px', padding: '4px 8px' }}>
                            {statusConfig[selectedOrder.status]?.label}
                          </Tag>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>创建时间</div>
                          <div style={{ fontSize: '14px' }}>{selectedOrder.createdAt}</div>
                        </div>
                        {selectedOrder.updatedAt && selectedOrder.updatedAt !== selectedOrder.createdAt && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>更新时间</div>
                            <div style={{ fontSize: '14px' }}>{selectedOrder.updatedAt}</div>
                          </div>
                        )}
                      </Col>
                      <Col xs={24} sm={12}>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>买方</div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>{selectedOrder.buyerName}</div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>卖方</div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>{selectedOrder.sellerName}</div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>折扣比例</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1890ff' }}>
                            {(selectedOrder.discount * 100).toFixed(1)}%
                          </div>
                        </div>
                        {selectedOrder.paymentMethod && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>支付方式</div>
                            <div style={{ fontSize: '14px' }}>{selectedOrder.paymentMethod}</div>
                          </div>
                        )}
                        {selectedOrder.paymentStatus && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>支付状态</div>
                            <Tag color={selectedOrder.paymentStatus === 'PAID' ? 'green' : 'orange'}>
                              {selectedOrder.paymentStatus === 'PAID' ? '已支付' : '待支付'}
                            </Tag>
                          </div>
                        )}
                      </Col>
                    </Row>
                    {selectedOrder.remarks && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>订单备注</div>
                        <div style={{ 
                          backgroundColor: '#f6ffed', 
                          border: '1px solid #b7eb8f', 
                          borderRadius: '6px', 
                          padding: '12px',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}>
                          {selectedOrder.remarks}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: '2',
                label: '商品明细',
                children: (
                  <div>
                    <Table
                      columns={[
                        { 
                          title: '商品名称', 
                          dataIndex: 'name', 
                          key: 'name',
                          width: '40%',
                        },
                        { 
                          title: '单价(¥)', 
                          dataIndex: 'price', 
                          key: 'price', 
                          width: '20%',
                          render: (val: number) => val ? val.toFixed(2) : '0.00',
                          align: 'right' as const,
                        },
                        { 
                          title: '数量', 
                          dataIndex: 'quantity', 
                          key: 'quantity', 
                          width: '20%',
                          align: 'center' as const,
                        },
                        { 
                          title: '小计(¥)', 
                          dataIndex: 'total', 
                          key: 'total', 
                          width: '20%',
                          render: (val: number) => val ? val.toFixed(2) : '0.00',
                          align: 'right' as const,
                        },
                      ]}
                      dataSource={selectedOrder.items}
                      pagination={false}
                      size="small"
                      summary={() => (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={3}>
                            <strong>订单总额:</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3} align="right">
                            <strong style={{ color: '#1890ff', fontSize: '16px' }}>
                              ¥{selectedOrder.totalAmount.toFixed(2)}
                            </strong>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      )}
                    />
                    {selectedOrder.commission > 0 && (
                      <div style={{ 
                        marginTop: 16, 
                        padding: '12px 16px', 
                        backgroundColor: '#f6ffed', 
                        borderRadius: '6px',
                        border: '1px solid #b7eb8f'
                      }}>
                        <Row>
                          <Col span={12}><strong>佣金额:</strong></Col>
                          <Col span={12} style={{ textAlign: 'right' }}>
                            <strong style={{ color: '#52c41a', fontSize: '16px' }}>
                              ¥{selectedOrder.commission.toFixed(2)}
                            </strong>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: '3',
                label: '收货信息',
                children: (
                  <div>
                    <Row gutter={[24, 24]}>
                      <Col xs={24} sm={12}>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>收货地址</div>
                          <div style={{ 
                            fontSize: '14px', 
                            lineHeight: '1.6',
                            padding: '12px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '6px'
                          }}>
                            {selectedOrder.shippingAddress}
                          </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>联系电话</div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>{selectedOrder.phone}</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        {selectedOrder.logisticsInfo && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>物流信息</div>
                            <div style={{ 
                              fontSize: '14px', 
                              padding: '12px',
                              backgroundColor: '#e6f7ff',
                              borderRadius: '6px',
                              border: '1px solid #91d5ff'
                            }}>
                              {selectedOrder.logisticsInfo}
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: '4',
                label: '订单流程',
                children: (
                  <Timeline
                    items={selectedOrder.timeline.map((item: any, index: number) => ({
                      label: (
                        <div>
                          <div style={{ fontWeight: '500' }}>{item.time}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {new Date(item.time).toLocaleString()}
                          </div>
                        </div>
                      ),
                      children: (
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          {item.status}
                          {item.description && (
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      ),
                      color: index === selectedOrder.timeline.length - 1 ? 'blue' : 'gray',
                      dot: index === selectedOrder.timeline.length - 1 ? <Badge status="processing" /> : null,
                    }))}
                  />
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  )
}
