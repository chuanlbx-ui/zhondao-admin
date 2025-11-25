/**
 * 审计日志系统
 * 记录所有管理员操作，用于跟踪数据变更和安全审计
 */

export interface AuditLog {
  id: string
  timestamp: Date
  adminId: string
  adminName: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, any>
  changes?: {
    before: Record<string, any>
    after: Record<string, any>
  }
  status: 'success' | 'failed'
  errorMessage?: string
  ipAddress?: string
  userAgent?: string
}

// 内存存储（开发环境）- 生产环境应存储到数据库
let auditLogs: AuditLog[] = []

// 从localStorage加载历史日志
const MAX_LOGS = 1000
const STORAGE_KEY = 'admin_audit_logs'

export function initAuditLogs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      auditLogs = JSON.parse(stored)
    }
  } catch (err) {
    console.error('加载审计日志失败:', err)
    auditLogs = []
  }
}

/**
 * 记录一条审计日志
 */
export function logAudit({
  action,
  resource,
  resourceId,
  details = {},
  changes,
  status = 'success',
  errorMessage,
}: Omit<AuditLog, 'id' | 'timestamp' | 'adminId' | 'adminName' | 'ipAddress' | 'userAgent'> & { details?: Record<string, any> }) {
  const log: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    adminId: localStorage.getItem('admin_id') || 'unknown',
    adminName: localStorage.getItem('admin_name') || '未知管理员',
    action,
    resource,
    resourceId,
    details,
    changes,
    status,
    errorMessage,
  }

  auditLogs.unshift(log)

  // 限制日志数量
  if (auditLogs.length > MAX_LOGS) {
    auditLogs = auditLogs.slice(0, MAX_LOGS)
  }

  // 保存到localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auditLogs))
  } catch (err) {
    console.warn('保存审计日志失败（可能空间不足）:', err)
  }

  console.log(`📋 [${action}] ${resource}#${resourceId} - ${status}`)
  return log
}

/**
 * 获取审计日志列表
 */
export function getAuditLogs(
  filters?: {
    action?: string
    resource?: string
    adminId?: string
    status?: 'success' | 'failed'
    startDate?: Date
    endDate?: Date
  }
): AuditLog[] {
  let result = [...auditLogs]

  if (filters) {
    if (filters.action) {
      result = result.filter(log => log.action === filters.action)
    }
    if (filters.resource) {
      result = result.filter(log => log.resource === filters.resource)
    }
    if (filters.adminId) {
      result = result.filter(log => log.adminId === filters.adminId)
    }
    if (filters.status) {
      result = result.filter(log => log.status === filters.status)
    }
    if (filters.startDate) {
      result = result.filter(log => log.timestamp >= filters.startDate!)
    }
    if (filters.endDate) {
      result = result.filter(log => log.timestamp <= filters.endDate!)
    }
  }

  return result
}

/**
 * 清空审计日志
 */
export function clearAuditLogs() {
  auditLogs = []
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * 导出审计日志为CSV
 */
export function exportAuditLogs(logs = auditLogs): string {
  const headers = ['ID', '时间', '操作人', '操作', '资源', '资源ID', '状态', '详情']
  const rows = logs.map(log => [
    log.id,
    log.timestamp.toLocaleString(),
    log.adminName,
    log.action,
    log.resource,
    log.resourceId,
    log.status,
    JSON.stringify(log.details),
  ])

  const csv = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csv
}

/**
 * 获取最近的操作统计
 */
export function getAuditStats(days = 7) {
  const now = Date.now()
  const targetDate = new Date(now - days * 24 * 60 * 60 * 1000)
  
  const recentLogs = auditLogs.filter(log => log.timestamp >= targetDate)

  const stats = {
    total: recentLogs.length,
    success: recentLogs.filter(log => log.status === 'success').length,
    failed: recentLogs.filter(log => log.status === 'failed').length,
    byAction: {} as Record<string, number>,
    byResource: {} as Record<string, number>,
  }

  recentLogs.forEach(log => {
    stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1
    stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1
  })

  return stats
}

// 初始化
initAuditLogs()

export default {
  logAudit,
  getAuditLogs,
  clearAuditLogs,
  exportAuditLogs,
  getAuditStats,
}
