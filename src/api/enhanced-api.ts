/**
 * 管理后台增强API接口
 * 集成错误处理、重试和降级方案
 */

import { adminApiClient } from './enhanced-client'

// ==================== 认证相关 ====================

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    admin: {
      id: string
      username: string
      realName: string
      role: string
      permissions: string[]
      lastLoginAt: string
    }
    tokens: {
      accessToken: string
      refreshToken: string
      tokenType: string
    }
  }
  message: string
}

export const authApi = {
  /**
   * 管理员登录（带重试）
   */
  login: (params: LoginParams) =>
    adminApiClient.postWithRetryAndFallback<LoginResponse>(
      '/admin/auth/login',
      params,
      'admin/dashboard',
      {
        maxRetries: 3,
        customMessage: '登录失败，请检查用户名和密码'
      }
    ),

  /**
   * 登出（静默失败）
   */
  logout: () =>
    adminApiClient.postWithFallback(
      '/admin/auth/logout',
      {},
      'empty/list',
      { silent: true }
    ),

  /**
   * 获取管理员信息（带重试）
   */
  getProfile: () =>
    adminApiClient.getWithRetry(
      '/admin/auth/profile',
      { maxRetries: 2 }
    ),

  /**
   * 刷新Token（带重试）
   */
  refreshToken: (refreshToken: string) =>
    adminApiClient.postWithRetry(
      '/admin/auth/refresh',
      { refreshToken },
      { maxRetries: 2 }
    )
}

// ==================== 用户管理 ====================

export interface User {
  id: string
  openid: string
  nickname: string | null
  phone: string | null
  avatarUrl: string | null
  level: string
  status: string
  totalSales: number
  directCount: number
  teamCount: number
  pointsBalance: number
  referralCode: string | null
  createdAt: string
  updatedAt: string
}

export interface UserListParams {
  page?: number
  perPage?: number
  level?: string
  status?: string
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UserListResponse {
  success: boolean
  data: {
    items: User[]
    pagination: {
      page: number
      perPage: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  message: string
}

export const userApi = {
  /**
   * 获取用户列表（带重试和降级）
   */
  getList: (params?: UserListParams) =>
    adminApiClient.getWithRetryAndFallback<UserListResponse>(
      '/admin/users',
      'admin/users',
      {
        maxRetries: 2,
        customMessage: '用户列表加载失败'
      },
      { params }
    ),

  /**
   * 获取用户详情（带重试）
   */
  getDetail: (id: string) =>
    adminApiClient.getWithRetry(
      `/admin/users/${id}`,
      { maxRetries: 2 }
    ),

  /**
   * 创建用户（带重试）
   */
  create: (data: Partial<User>) =>
    adminApiClient.postWithRetry(
      '/admin/users',
      data,
      { maxRetries: 2 }
    ),

  /**
   * 更新用户（带重试）
   */
  update: (id: string, data: Partial<User>) =>
    adminApiClient.putWithRetry(
      `/admin/users/${id}`,
      data,
      { maxRetries: 2 }
    ),

  /**
   * 删除用户（带重试）
   */
  delete: (id: string) =>
    adminApiClient.deleteWithRetry(
      `/admin/users/${id}`,
      { maxRetries: 1 }
    ),

  /**
   * 获取用户统计（带重试）
   */
  getStatistics: (id: string) =>
    adminApiClient.getWithRetry(
      `/admin/users/${id}/statistics`,
      { maxRetries: 2 }
    ),

  /**
   * 批量操作用户状态（带重试）
   */
  batchUpdateStatus: (ids: string[], status: string) =>
    adminApiClient.postWithRetry(
      '/admin/users/batch-status',
      { ids, status },
      { maxRetries: 2 }
    )
}

// ==================== 仪表板 ====================

export interface DashboardOverview {
  totalUsers: number
  totalOrders: number
  totalSales: number
  activeShops: number
  todayOrders: number
  todaySales: number
  newUsers: number
  activeUsers: number
}

export interface DashboardStatistics {
  userGrowth: Array<{ date: string; count: number }>
  salesData: Array<{ date: string; amount: number; orders: number }>
  topProducts: Array<{ name: string; sales: number; revenue: number }>
  recentOrders: Array<{ id: string; customer: string; amount: number; status: string; time: string }>
}

export const dashboardApi = {
  /**
   * 获取仪表板概览（带重试和降级）
   */
  getOverview: () =>
    adminApiClient.getWithRetryAndFallback(
      '/admin/dashboard/overview',
      'admin/dashboard',
      {
        maxRetries: 3,
        customMessage: '仪表板数据加载失败'
      }
    ),

  /**
   * 获取用户统计（带重试和降级）
   */
  getUsersStatistics: () =>
    adminApiClient.getWithRetryAndFallback(
      '/admin/dashboard/users',
      'admin/statistics',
      {
        maxRetries: 2,
        customMessage: '用户统计数据加载失败'
      }
    ),

  /**
   * 获取订单统计（带重试和降级）
   */
  getOrdersStatistics: () =>
    adminApiClient.getWithRetryAndFallback(
      '/admin/dashboard/orders',
      'admin/statistics',
      {
        maxRetries: 2,
        customMessage: '订单统计数据加载失败'
      }
    ),

  /**
   * 获取收入统计（带重试和降级）
   */
  getRevenueStatistics: () =>
    adminApiClient.getWithRetryAndFallback(
      '/admin/dashboard/revenue',
      'admin/statistics',
      {
        maxRetries: 2,
        customMessage: '收入统计数据加载失败'
      }
    )
}

// ==================== 商品管理 ====================

export interface Product {
  id: string
  name: string
  description: string
  images: string[]
  price: number
  originalPrice: number
  stock: number
  status: string
  category: any
  specs: any
  createdAt: string
}

export interface ProductListParams {
  page?: number
  perPage?: number
  categoryId?: string
  keyword?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const productApi = {
  /**
   * 获取商品列表（带重试和降级）
   */
  getList: (params?: ProductListParams) =>
    adminApiClient.getWithRetryAndFallback(
      '/admin/products',
      'admin/products',
      {
        maxRetries: 2,
        customMessage: '商品列表加载失败'
      },
      { params }
    ),

  /**
   * 获取商品详情（带重试）
   */
  getDetail: (id: string) =>
    adminApiClient.getWithRetry(
      `/admin/products/${id}`,
      { maxRetries: 2 }
    ),

  /**
   * 创建商品（带重试）
   */
  create: (data: Partial<Product>) =>
    adminApiClient.postWithRetry(
      '/admin/products',
      data,
      { maxRetries: 2 }
    ),

  /**
   * 更新商品（带重试）
   */
  update: (id: string, data: Partial<Product>) =>
    adminApiClient.putWithRetry(
      `/admin/products/${id}`,
      data,
      { maxRetries: 2 }
    ),

  /**
   * 删除商品（带重试）
   */
  delete: (id: string) =>
    adminApiClient.deleteWithRetry(
      `/admin/products/${id}`,
      { maxRetries: 1 }
    ),

  /**
   * 更新商品状态（带重试）
   */
  updateStatus: (id: string, status: string) =>
    adminApiClient.putWithRetry(
      `/admin/products/${id}/status`,
      { status },
      { maxRetries: 2 }
    ),

  /**
   * 批量更新商品状态（带重试）
   */
  batchUpdateStatus: (ids: string[], status: string) =>
    adminApiClient.postWithRetry(
      '/admin/products/batch-status',
      { ids, status },
      { maxRetries: 2 }
    )
}

// ==================== 订单管理 ====================

export interface Order {
  id: string
  orderNo: string
  type: string
  status: string
  totalAmount: number
  finalAmount: number
  customer: any
  items: any[]
  createdAt: string
  updatedAt: string
}

export interface OrderListParams {
  page?: number
  perPage?: number
  status?: string
  type?: string
  customerId?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const orderApi = {
  /**
   * 获取订单列表（带重试和降级）
   */
  getList: (params?: OrderListParams) =>
    adminApiClient.getWithRetryAndFallback(
      '/admin/orders',
      'admin/orders',
      {
        maxRetries: 2,
        customMessage: '订单列表加载失败'
      },
      { params }
    ),

  /**
   * 获取订单详情（带重试）
   */
  getDetail: (id: string) =>
    adminApiClient.getWithRetry(
      `/admin/orders/${id}`,
      { maxRetries: 2 }
    ),

  /**
   * 更新订单（带重试）
   */
  update: (id: string, data: Partial<Order>) =>
    adminApiClient.putWithRetry(
      `/admin/orders/${id}`,
      data,
      { maxRetries: 2 }
    ),

  /**
   * 更新订单状态（带重试）
   */
  updateStatus: (id: string, status: string) =>
    adminApiClient.putWithRetry(
      `/admin/orders/${id}/status`,
      { status },
      { maxRetries: 2 }
    ),

  /**
   * 取消订单（带重试）
   */
  cancel: (id: string) =>
    adminApiClient.putWithRetry(
      `/admin/orders/${id}/cancel`,
      {},
      { maxRetries: 2 }
    )
}

// ==================== 配置管理 ====================

export interface ConfigItem {
  key: string
  value: any
  category: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'json'
  updatedAt: string
}

export const configApi = {
  /**
   * 获取配置列表（带重试和降级）
   */
  getList: (params?: { page?: number; perPage?: number; category?: string }) =>
    adminApiClient.getWithRetryAndFallback(
      '/admin/config/configs',
      'admin/config',
      {
        maxRetries: 2,
        customMessage: '配置列表加载失败'
      },
      { params }
    ),

  /**
   * 获取配置详情（带重试）
   */
  getDetail: (key: string) =>
    adminApiClient.getWithRetry(
      `/admin/config/configs/${key}`,
      { maxRetimes: 2 }
    ),

  /**
   * 创建配置（带重试）
   */
  create: (data: Partial<ConfigItem>) =>
    adminApiClient.postWithRetry(
      '/admin/config/configs',
      data,
      { maxRetries: 2 }
    ),

  /**
   * 更新配置（带重试）
   */
  update: (key: string, data: Partial<ConfigItem>) =>
    adminApiClient.putWithRetry(
      `/admin/config/configs/${key}`,
      data,
      { maxRetries: 2 }
    ),

  /**
   * 删除配置（带重试）
   */
  delete: (key: string) =>
    adminApiClient.deleteWithRetry(
      `/admin/config/configs/${key}`,
      { maxRetries: 1 }
    ),

  /**
   * 批量更新配置（带重试）
   */
  batchUpdate: (configs: Array<{ key: string; value: any }>) =>
    adminApiClient.postWithRetry(
      '/admin/config/configs/batch',
      { configs },
      { maxRetries: 2 }
    )
}

// ==================== 通用工具 ====================

export const utils = {
  /**
   * 批量API调用
   */
  batchRequest: (requests: Array<() => Promise<any>>, options?: { continueOnError?: boolean }) =>
    adminApiClient.batchRequests(requests, options),

  /**
   * 检查系统状态
   */
  checkSystemStatus: async () => {
    try {
      await adminApiClient.get('/health', { timeout: 5000 })
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * 获取系统配置
   */
  getSystemConfig: () =>
    adminApiClient.getWithFallback(
      '/admin/config/system',
      'admin/config',
      { silent: true }
    ),

  /**
   * 导出数据
   */
  exportData: (type: string, params?: any) =>
    adminApiClient.postWithRetry(
      `/admin/export/${type}`,
      params || {},
      { maxRetries: 1 }
    ),

  /**
   * 导入数据
   */
  importData: (type: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return adminApiClient.postWithRetry(
      `/admin/import/${type}`,
      formData,
      {
        maxRetries: 1,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  },

  /**
   * 生成报告
   */
  generateReport: (reportType: string, params?: any) =>
    adminApiClient.postWithRetry(
      `/admin/reports/${reportType}`,
      params || {},
      { maxRetries: 2 }
    )
}

export default {
  auth: authApi,
  user: userApi,
  dashboard: dashboardApi,
  product: productApi,
  order: orderApi,
  config: configApi,
  utils
}