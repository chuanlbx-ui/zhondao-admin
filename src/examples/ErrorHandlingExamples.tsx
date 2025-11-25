/**
 * 管理后台错误处理使用示例
 * 演示如何在管理后台组件中使用增强的API错误处理功能
 */

import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Table,
  Form,
  Input,
  Select,
  message,
  Space,
  Statistic,
  Row,
  Col,
  Alert,
  Modal,
  Progress
} from 'antd'
import { authApi, userApi, dashboardApi, productApi, orderApi, adminApiClient } from '../api/enhanced-api'

// ==================== 示例1: 基础管理员操作 ====================
export const BasicAdminExample: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadAdminProfile = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await authApi.getProfile()
      if (result.success) {
        setUserInfo(result.data.admin)
        message.success('管理员信息加载成功')
      } else {
        throw new Error(result.message || '获取管理员信息失败')
      }
    } catch (err: any) {
      setError(err.message || '请求失败')
      message.error(`获取管理员信息失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="基础管理员操作示例" extra={
      <Button
        type="primary"
        onClick={loadAdminProfile}
        loading={loading}
      >
        获取管理员信息
      </Button>
    }>
      {error && (
        <Alert
          message="操作失败"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {userInfo && (
        <div>
          <p><strong>用户名:</strong> {userInfo.username}</p>
          <p><strong>真实姓名:</strong> {userInfo.realName}</p>
          <p><strong>角色:</strong> {userInfo.role}</p>
          <p><strong>权限:</strong> {userInfo.permissions?.join(', ')}</p>
          <p><strong>最后登录:</strong> {userInfo.lastLoginAt}</p>
        </div>
      )}
    </Card>
  )
}

// ==================== 示例2: 带重试的数据加载 ====================
export const RetryDataExample: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadUsersWithRetry = async () => {
    setLoading(true)
    try {
      // 使用带重试机制的API调用
      const result = await userApi.getList({
        page: 1,
        perPage: 10,
        maxRetries: 3 // 最多重试3次
      })

      if (result.success) {
        setUsers(result.data.items)
        setPagination(result.data.pagination)
        message.success(`用户列表加载成功 (${result.data.items.length} 条记录)`)
      }
    } catch (err: any) {
      message.error(`用户列表加载失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const simulateNetworkError = async () => {
    // 模拟网络错误，展示重试机制
    message.info('模拟网络错误，API将自动重试...')
    setLoading(true)
    setRetryCount(0)

    // 监听重试次数
    const retryInterval = setInterval(() => {
      setRetryCount(prev => prev + 1)
    }, 1500)

    try {
      await userApi.getList({ page: 1, perPage: 5 })
    } catch (err) {
      // 模拟错误
    } finally {
      clearInterval(retryInterval)
      setLoading(false)
      setRetryCount(0)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
  ]

  return (
    <Card title="带重试机制的数据加载" extra={
      <Space>
        <Button onClick={simulateNetworkError} loading={loading}>
          模拟网络错误
        </Button>
        <Button type="primary" onClick={loadUsersWithRetry} loading={loading}>
          加载用户列表
        </Button>
      </Space>
    }>
      {retryCount > 0 && (
        <Alert
          message={`正在进行第 ${retryCount} 次重试...`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={pagination ? {
          current: pagination.page,
          pageSize: pagination.perPage,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
        } : false}
      />
    </Card>
  )
}

// ==================== 示例3: 带降级的仪表板数据 ====================
export const FallbackDashboardExample: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

  const loadDashboardWithFallback = async () => {
    setLoading(true)
    setIsUsingFallback(false)

    try {
      // 使用带降级机制的API调用
      const result = await dashboardApi.getOverview()

      if (result.success) {
        setDashboardData(result.data)

        // 检查是否使用了降级数据
        if (result.message?.includes('失败') || result.message?.includes('降级')) {
          setIsUsingFallback(true)
          message.warning(result.message || '使用了降级数据')
        } else {
          message.success('仪表板数据加载成功')
        }
      }
    } catch (err: any) {
      message.error(`仪表板加载失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const statistics = dashboardData ? [
    { title: '总用户数', value: dashboardData.totalUsers, suffix: '人' },
    { title: '总订单数', value: dashboardData.totalOrders, suffix: '单' },
    { title: '总销售额', value: dashboardData.totalSales, suffix: '元', precision: 2 },
    { title: '活跃店铺', value: dashboardData.activeShops, suffix: '家' },
  ] : []

  return (
    <Card title="带降级机制的仪表板数据" extra={
      <Button
        type="primary"
        onClick={loadDashboardWithFallback}
        loading={loading}
      >
        加载仪表板数据
      </Button>
    }>
      {isUsingFallback && (
        <Alert
          message="当前显示的是降级数据"
          description="由于网络问题，正在显示缓存的或模拟的数据。部分信息可能不是最新的。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {dashboardData && (
        <Row gutter={16}>
          {statistics.map((stat, index) => (
            <Col span={6} key={index}>
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  suffix={stat.suffix}
                  precision={stat.precision}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  )
}

// ==================== 示例4: 批量操作示例 ====================
export const BatchOperationExample: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [operationResult, setOperationResult] = useState<any>(null)

  const handleBatchUpdate = async (status: string) => {
    if (selectedUsers.length === 0) {
      message.warning('请先选择要操作的用户')
      return
    }

    setLoading(true)
    try {
      // 使用批量API
      const result = await userApi.batchUpdateStatus(selectedUsers, status)

      if (result.success) {
        setOperationResult({
          success: true,
          message: `成功更新 ${selectedUsers.length} 个用户的状态为 ${status}`,
          data: result.data
        })
        message.success('批量操作成功')
        setSelectedUsers([])
      } else {
        throw new Error(result.message || '批量操作失败')
      }
    } catch (err: any) {
      setOperationResult({
        success: false,
        message: err.message || '批量操作失败',
        error: err
      })
      message.error(`批量操作失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="批量操作示例">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            onClick={() => handleBatchUpdate('ACTIVE')}
            loading={loading}
            disabled={selectedUsers.length === 0}
          >
            批量启用 ({selectedUsers.length})
          </Button>
          <Button
            danger
            onClick={() => handleBatchUpdate('SUSPENDED')}
            loading={loading}
            disabled={selectedUsers.length === 0}
          >
            批量禁用 ({selectedUsers.length})
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p>已选择的用户ID: {selectedUsers.join(', ') || '无'}</p>
      </div>

      {operationResult && (
        <Alert
          message={operationResult.success ? "操作成功" : "操作失败"}
          description={operationResult.message}
          type={operationResult.success ? "success" : "error"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
        <p><strong>批量操作说明:</strong></p>
        <ul>
          <li>支持多个用户的批量状态更新</li>
          <li>具有自动重试机制</li>
          <li>提供详细的操作结果反馈</li>
          <li>失败时会回滚所有操作</li>
        </ul>
      </div>
    </Card>
  )
}

// ==================== 示例5: 自定义错误处理 ====================
export const CustomErrorExample: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [errorLogs, setErrorLogs] = useState<any[]>([])

  const addErrorLog = (error: any, context: string) => {
    setErrorLogs(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      context,
      error: error.message || error.toString(),
      code: error.code || 'UNKNOWN',
      status: error.status
    }, ...prev].slice(0, 10)) // 保留最近10条
  }

  const testErrorHandling = async (scenario: string) => {
    setLoading(true)

    try {
      switch (scenario) {
        case 'auth':
          // 测试认证错误
          await adminApiClient.get('/admin/users', {
            headers: { 'Authorization': 'Bearer invalid-token' }
          })
          break

        case 'network':
          // 测试网络错误
          await adminApiClient.get('/admin/users', {
            timeout: 1 // 极短超时，模拟网络问题
          })
          break

        case 'validation':
          // 测试验证错误
          await userApi.create({
            nickname: '', // 空昵称应该触发验证错误
            phone: 'invalid-phone'
          })
          break

        case 'permission':
          // 测试权限错误（如果有的话）
          await adminApiClient.delete('/admin/config/system')
          break

        default:
          throw new Error('未知测试场景')
      }
    } catch (err: any) {
      addErrorLog(err, scenario)

      // 自定义错误处理逻辑
      if (err.status === 401) {
        message.error('认证失败，请重新登录')
      } else if (err.status === 403) {
        message.error('权限不足，无法执行此操作')
      } else if (err.status === 422) {
        message.error('数据验证失败，请检查输入')
      } else if (err.code === 'ECONNABORTED' || err.code === 'TIMEOUT') {
        message.error('请求超时，请检查网络连接')
      } else if (err.code === 'NETWORK_ERROR') {
        message.error('网络连接失败，请稍后重试')
      } else {
        message.error(`操作失败: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = () => {
    setErrorLogs([])
  }

  return (
    <Card title="自定义错误处理示例" extra={
      <Button onClick={clearLogs} size="small">
        清空日志
      </Button>
    }>
      <Space wrap style={{ marginBottom: 16 }}>
        <Button onClick={() => testErrorHandling('auth')} loading={loading}>
          测试认证错误
        </Button>
        <Button onClick={() => testErrorHandling('network')} loading={loading}>
          测试网络错误
        </Button>
        <Button onClick={() => testErrorHandling('validation')} loading={loading}>
          测试验证错误
        </Button>
        <Button onClick={() => testErrorHandling('permission')} loading={loading}>
          测试权限错误
        </Button>
      </Space>

      {errorLogs.length > 0 && (
        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
          <h4>错误日志:</h4>
          {errorLogs.map((log, index) => (
            <div key={index} style={{
              padding: '4px 8px',
              margin: '4px 0',
              background: 'white',
              borderRadius: 4,
              fontSize: 12,
              borderLeft: `3px solid ${log.status >= 500 ? '#ff4d4f' : '#faad14'}`
            }}>
              <strong>{log.timestamp}</strong> [{log.context}] {log.error}
              <br />
              <small>Code: {log.code} | Status: {log.status}</small>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        此示例展示了不同类型错误的自定义处理逻辑，包括认证、网络、验证和权限错误的专门处理。
      </div>
    </Card>
  )
}

// ==================== 主示例组件 ====================
export const AdminErrorHandlingExamples: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <h1>管理后台错误处理机制使用示例</h1>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <BasicAdminExample />
        </Col>

        <Col span={24}>
          <RetryDataExample />
        </Col>

        <Col span={24}>
          <FallbackDashboardExample />
        </Col>

        <Col span={12}>
          <BatchOperationExample />
        </Col>

        <Col span={12}>
          <CustomErrorExample />
        </Col>
      </Row>
    </div>
  )
}

export default AdminErrorHandlingExamples