import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Tag, Space, Drawer, Row, Col, Statistic, Progress, message, Input, Select } from 'antd'
import { EyeOutlined, ReloadOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons'
import { adminCommissionApi } from '@/api'
import BackButton from '@/components/BackButton'

export default function Commission() {
  const [loading, setLoading] = useState(false)
  const [commissions, setCommissions] = useState<any[]>([])
  const [filteredCommissions, setFilteredCommissions] = useState<any[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [selectedCommission, setSelectedCommission] = useState<any>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

  const fetchCommissions = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      // 本地模拟数据
      const mockCommissions = [
        { userId: '1', userName: '张三', levelOneCommission: 5000, levelTwoCommission: 2500, pending: 1500, settled: 6000 },
        { userId: '2', userName: '李四', levelOneCommission: 3000, levelTwoCommission: 1200, pending: 800, settled: 3200 },
        { userId: '3', userName: '王五', levelOneCommission: 2500, levelTwoCommission: 1000, pending: 500, settled: 2800 },
        { userId: '4', userName: '赵六', levelOneCommission: 7500, levelTwoCommission: 3500, pending: 2500, settled: 8000 },
      ]
      setCommissions(mockCommissions)
      applyFilters(mockCommissions, searchText)
      setPagination({ current: page, pageSize, total: mockCommissions.length })
    } catch (error) {
      message.error('加载佐金列表失败')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (data: any[], search: string) => {
    let filtered = data
    if (search) {
      filtered = filtered.filter(c => 
        c.userName.includes(search) || 
        c.userId.includes(search)
      )
    }
    setFilteredCommissions(filtered)
    setPagination(prev => ({ ...prev, total: filtered.length }))
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    applyFilters(commissions, value)
  }

  const handleExport = () => {
    try {
      const csvData = [
        ['用户ID', '用户名', '一级佐金', '二级佐金', '待结算', '已结算'],
        ...filteredCommissions.map(c => [c.userId, c.userName, c.levelOneCommission, c.levelTwoCommission, c.pending, c.settled])
      ]
      const csvString = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `佐金列表_${new Date().getTime()}.csv`
      link.click()
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  useEffect(() => {
    fetchCommissions()
  }, [])

  const columns = [
    { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100, sorter: (a: any, b: any) => a.userId.localeCompare(b.userId) },
    { title: '用户名', dataIndex: 'userName', key: 'userName' },
    {
      title: '一级佐金',
      dataIndex: 'levelOneCommission',
      key: 'levelOneCommission',
      render: (val: number) => `¥${val.toFixed(2)}`,
      sorter: (a: any, b: any) => a.levelOneCommission - b.levelOneCommission,
    },
    {
      title: '二级佐金',
      dataIndex: 'levelTwoCommission',
      key: 'levelTwoCommission',
      render: (val: number) => `¥${val.toFixed(2)}`,
      sorter: (a: any, b: any) => a.levelTwoCommission - b.levelTwoCommission,
    },
    {
      title: '待结算',
      dataIndex: 'pending',
      key: 'pending',
      render: (val: number) => <Tag color="orange">¥{val.toFixed(2)}</Tag>,
    },
    {
      title: '已结算',
      dataIndex: 'settled',
      key: 'settled',
      render: (val: number) => <Tag color="green">¥{val.toFixed(2)}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} onClick={() => showDetail(record)} />
          <Button type="text" icon={<ReloadOutlined />} onClick={() => recalculate(record.userId)}>重算</Button>
        </Space>
      ),
    },
  ]

  const showDetail = (commission: any) => {
    setSelectedCommission(commission)
    setDrawerVisible(true)
  }

  const recalculate = (userId: string) => {
    try {
      // 本地模拟重算
      message.success('已重新计算')
      fetchCommissions()
    } catch (error) {
      message.error('重算失败')
    }
  }

  return (
    <div className="commission-page fade-in-down">
      {/* 页面头部 */}
      <div className="page-header">
        <BackButton fallback="/dashboard" />
        <h1 className="page-title">佐金管理</h1>
      </div>
  
      <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={12}>
            <Input
              placeholder="搜索用户ID或用户名"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Space>
              <Button type="primary" onClick={() => message.success('批量结算成功')}>
                批量结算
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
            </Space>
          </Col>
        </Row>
      </Card>
  
      <Card className="card-with-shadow">
        <Table
          columns={columns}
          dataSource={filteredCommissions}
          loading={loading}
          pagination={pagination}
          onChange={(pag: any) => fetchCommissions(pag.current || 1, pag.pageSize || 10)}
          rowKey="userId"
        />
      </Card>

      <Drawer title="佣金详情" placement="right" onClose={() => setDrawerVisible(false)} open={drawerVisible}>
        {selectedCommission && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="一级佣金"
                  value={selectedCommission.levelOneCommission}
                  prefix="¥"
                  valueStyle={{ color: '#28c76f' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="二级佣金"
                  value={selectedCommission.levelTwoCommission}
                  prefix="¥"
                  valueStyle={{ color: '#28c76f' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="待结算"
                  value={selectedCommission.pending}
                  prefix="¥"
                  valueStyle={{ color: '#ff7a45' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="已结算"
                  value={selectedCommission.settled}
                  prefix="¥"
                  valueStyle={{ color: '#28c76f' }}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
              <h4>佣金分布</h4>
              <div style={{ marginTop: 12 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>一级佣金占比</span>
                    <span>45%</span>
                  </div>
                  <Progress percent={45} status="active" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>二级佣金占比</span>
                    <span>35%</span>
                  </div>
                  <Progress percent={35} status="active" />
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
