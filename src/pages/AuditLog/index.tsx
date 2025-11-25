import React, { useState, useEffect } from 'react'
import { Table, Card, Input, Select, Space, Button, Tag, Modal, Drawer, Row, Col, Statistic, DatePicker, message, Empty } from 'antd'
import { DeleteOutlined, SearchOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import { getAuditLogs, clearAuditLogs, exportAuditLogs, getAuditStats, type AuditLog } from '@/utils/audit'
import BackButton from '@/components/BackButton'

import './AuditLog.css'

import './AuditLog.css'

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, byAction: {}, byResource: {} })
  
  // 筛选条件
  const [searchText, setSearchText] = useState('')
  const [filterAction, setFilterAction] = useState<string | undefined>()
  const [filterStatus, setFilterStatus] = useState<'success' | 'failed' | undefined>()

  // 加载审计日志
  const fetchLogs = () => {
    setLoading(true)
    try {
      const allLogs = getAuditLogs({
        action: filterAction,
        status: filterStatus,
      })

      // 搜索过滤
      let filtered = allLogs
      if (searchText) {
        filtered = filtered.filter(
          log =>
            log.adminName.includes(searchText) ||
            log.resource.includes(searchText) ||
            log.resourceId.includes(searchText)
        )
      }

      setFilteredLogs(filtered)
      setPagination({ ...pagination, total: filtered.length })
      setStats(getAuditStats(7))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filterAction, filterStatus])

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      sorter: (a: AuditLog, b: AuditLog) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      render: (timestamp: Date) => new Date(timestamp).toLocaleString('zh-CN'),
    },
    {
      title: '操作人',
      dataIndex: 'adminName',
      key: 'adminName',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: string) => {
        const colors: Record<string, string> = {
          CREATE: 'green',
          READ: 'blue',
          UPDATE: 'orange',
          DELETE: 'red',
          EXPORT: 'purple',
        }
        return <Tag color={colors[action] || 'default'}>{action}</Tag>
      },
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource',
      width: 100,
    },
    {
      title: '资源ID',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 120,
      render: (id: string) => <span title={id}>{id.substring(0, 8)}...</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: 'success' | 'failed') => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: AuditLog) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedLog(record)
              setDrawerVisible(true)
            }}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              // 这里可以添加删除单条日志的功能
            }}
          />
        </Space>
      ),
    },
  ]

  const handleExport = () => {
    try {
      const csv = exportAuditLogs(filteredLogs)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `审计日志_${new Date().toLocaleDateString()}.csv`
      link.click()
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  const handleClear = () => {
    Modal.confirm({
      title: '确定清空所有审计日志吗？',
      content: '此操作不可撤销',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        clearAuditLogs()
        message.success('已清空所有日志')
        fetchLogs()
      },
    })
  }

  const paginatedLogs = filteredLogs.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  )

  return (
    <div className="audit-log-page fade-in-down">
      {/* 页面头部 */}
      <div className="page-header">
        <BackButton fallback="/dashboard" />
        <h1 className="page-title">审计日志</h1>
      </div>

      {/* 统计卡片 */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <Statistic title="总操作数" value={stats.total} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <Statistic title="成功操作" value={stats.success} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <Statistic title="失败操作" value={stats.failed} valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-with-shadow">
            <Statistic
              title="成功率"
              value={stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索操作人/资源/资源ID"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={fetchLogs}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="选择操作类型"
              allowClear
              value={filterAction}
              onChange={(value) => {
                setFilterAction(value)
                setFilteredLogs([])
              }}
              style={{ width: '100%' }}
              options={[
                { label: 'CREATE', value: 'CREATE' },
                { label: 'READ', value: 'READ' },
                { label: 'UPDATE', value: 'UPDATE' },
                { label: 'DELETE', value: 'DELETE' },
                { label: 'EXPORT', value: 'EXPORT' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="选择状态"
              allowClear
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
              style={{ width: '100%' }}
              options={[
                { label: '成功', value: 'success' },
                { label: '失败', value: 'failed' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button onClick={fetchLogs}>刷新</Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
              <Button danger onClick={handleClear}>
                清空
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 日志列表 */}
      <Card className="card-with-shadow">
        {filteredLogs.length === 0 ? (
          <Empty description="暂无日志记录" />
        ) : (
          <Table
            columns={columns}
            dataSource={paginatedLogs}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: filteredLogs.length,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={(pag) => {
              setPagination({ ...pagination, current: pag.current || 1, pageSize: pag.pageSize || 20 })
            }}
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      {/* 日志详情抽屉 */}
      <Drawer
        title="日志详情"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {selectedLog && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>日志ID</div>
              <div style={{ fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {selectedLog.id}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>时间</div>
              <div>{new Date(selectedLog.timestamp).toLocaleString('zh-CN')}</div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>操作人</div>
              <div>{selectedLog.adminName}</div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>操作</div>
              <Tag color={selectedLog.action === 'DELETE' ? 'red' : 'blue'}>{selectedLog.action}</Tag>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>资源</div>
              <div>{selectedLog.resource}</div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>资源ID</div>
              <div style={{ fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {selectedLog.resourceId}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>状态</div>
              <Tag color={selectedLog.status === 'success' ? 'green' : 'red'}>
                {selectedLog.status === 'success' ? '成功' : '失败'}
              </Tag>
            </div>

            {selectedLog.errorMessage && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>错误信息</div>
                <div
                  style={{
                    padding: '12px',
                    background: '#fef2f0',
                    border: '1px solid #ffb9b3',
                    borderRadius: '4px',
                    color: '#d9534f',
                    fontSize: '12px',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedLog.errorMessage}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>操作详情</div>
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                }}
              >
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            {selectedLog.changes && (
              <div>
                <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>变更记录</div>
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: '12px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px',
                  }}
                >
                  {JSON.stringify(selectedLog.changes, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
