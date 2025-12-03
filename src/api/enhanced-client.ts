/**
 * 管理后台增强API客户端
 * 集成错误处理、重试机制和降级方案
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { notification } from 'antd'
import { errorHandler, withRetry, withFallback, withRetryAndFallback, ErrorHandler as ErrorHandlerClass } from '../../../shared/utils/errorHandler'

// API基础配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api/v1'

// 管理后台错误消息映射
const getAdminErrorMessage = (errorType: string, originalMessage: string): string => {
  const messages: Record<string, string> = {
    'NETWORK': '网络连接失败，请检查网络后重试',
    'TIMEOUT': '请求超时，请稍后重试',
    'AUTH': '登录已过期，请重新登录',
    'VALIDATION': '数据验证失败，请检查输入',
    'SERVER': '服务器错误，请稍后重试',
    'BUSINESS': '操作失败'
  }

  return messages[errorType] || originalMessage || '操作失败，请重试'
}

// 管理后台降级数据生成器
const getAdminFallbackData = (type: string, params?: any) => {
  switch (type) {
    case 'admin/users':
      return {
        success: true,
        data: {
          items: [],
          pagination: {
            page: 1,
            perPage: 20,
            total: 0,
            totalPages: 0
          }
        },
        message: '用户列表加载失败，显示空列表'
      }

    case 'admin/dashboard':
      return {
        success: true,
        data: {
          totalUsers: 0,
          totalOrders: 0,
          totalSales: 0,
          activeShops: 0,
          todayOrders: 0,
          todaySales: 0
        },
        message: '仪表板数据加载失败'
      }

    case 'admin/products':
      return {
        success: true,
        data: {
          items: [],
          pagination: {
            page: 1,
            perPage: 20,
            total: 0,
            totalPages: 0
          }
        },
        message: '商品列表加载失败'
      }

    case 'admin/orders':
      return {
        success: true,
        data: {
          items: [],
          pagination: {
            page: 1,
            perPage: 20,
            total: 0,
            totalPages: 0
          }
        },
        message: '订单列表加载失败'
      }

    case 'admin/statistics':
      return {
        success: true,
        data: {
          userGrowth: [],
          salesData: [],
          topProducts: [],
          recentOrders: []
        },
        message: '统计数据加载失败'
      }

    case 'admin/config':
      return {
        success: true,
        data: [],
        message: '配置信息加载失败'
      }

    default:
      return {
        success: false,
        error: {
          code: 'FALLBACK_ERROR',
          message: '请求失败，使用降级数据'
        }
      }
  }
}

// 自定义错误处理类
export class AdminErrorHandler extends ErrorHandlerClass {
  protected override showErrorNotification(errorConfig: any, customMessage?: string): void {
    const message = customMessage || getAdminErrorMessage(errorConfig.type, errorConfig.message)

    // 使用Antd的通知组件
    if (errorConfig.type === 'AUTH') {
      notification.error({
        message: '认证失败',
        description: message,
        duration: 4,
        placement: 'topRight'
      })

      // 自动跳转到登录页
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } else {
      const notificationType = errorConfig.canRetry ? 'warning' : 'error'

      notification[notificationType]({
        message: '操作失败',
        description: message,
        duration: errorConfig.canRetry ? 4 : 6,
        placement: 'topRight'
      })
    }
  }
}

// 创建增强的axios实例
class AdminApiClient {
  private client: AxiosInstance
  private retryConfig = {
    maxRetries: 3,
    retryDelay: 1500,
    backoffMultiplier: 1.5
  }
  private errorHandler: AdminErrorHandler

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.errorHandler = AdminErrorHandler.getInstance()
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加认证token
        const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 添加CSRF token
        const csrfToken = this.getCSRFToken()
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken
        }

        // 请求日志（开发环境）
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔧 Admin API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }

        return config
      },
      (error) => {
        console.error('Admin request interceptor error:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // 保存CSRF token
        this.saveCSRFToken(response)

        // 响应日志（开发环境）
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Admin API Response: ${response.status} ${response.config.url}`)
        }

        return response
      },
      (error) => {
        // 错误处理
        this.handleRequestError(error)

        // 保存CSRF token（即使出错也要尝试保存）
        if (error.response) {
          this.saveCSRFToken(error.response)
        }

        return Promise.reject(this.formatError(error))
      }
    )
  }

  private getCSRFToken(): string | null {
    return localStorage.getItem('csrf_token')
  }

  private saveCSRFToken(response: AxiosResponse): void {
    const cookies = response.headers['set-cookie']
    if (cookies) {
      const csrfCookie = cookies.find(cookie => cookie.includes('csrf-token='))
      if (csrfCookie) {
        const tokenMatch = csrfCookie.match(/csrf-token=([^;]+)/)
        if (tokenMatch) {
          localStorage.setItem('csrf_token', tokenMatch[1])
        }
      }
    }
  }

  private handleRequestError(error: any): void {
    const originalConfig = error.config

    // 如果配置了不显示错误消息，则跳过
    if (originalConfig?.skipErrorNotification) {
      return
    }

    // 使用自定义错误处理器
    this.errorHandler.handleApiError(error)
  }

  private formatError(error: any): any {
    // 统一错误格式
    const formattedError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || '请求失败',
      status: error.response?.status,
      config: error.config,
      response: error.response
    }

    // 添加特定错误类型标识
    if (error.code === 'ECONNABORTED') {
      formattedError.code = 'TIMEOUT'
    } else if (error.code === 'ECONNREFUSED') {
      formattedError.code = 'NETWORK_ERROR'
    }

    return formattedError
  }

  /**
   * 基础HTTP方法
   */
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config)
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config)
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config)
  }

  /**
   * 带重试的HTTP方法
   */
  async getWithRetry<T = any>(url: string, config?: AxiosRequestConfig & { maxRetries?: number }): Promise<T> {
    return withRetry(() => this.get<T>(url, config), {
      maxRetries: config?.maxRetries || this.retryConfig.maxRetries,
      retryDelay: this.retryConfig.retryDelay,
      backoffMultiplier: this.retryConfig.backoffMultiplier
    })
  }

  async postWithRetry<T = any>(url: string, data?: any, config?: AxiosRequestConfig & { maxRetries?: number }): Promise<T> {
    return withRetry(() => this.post<T>(url, data, config), {
      maxRetries: config?.maxRetries || this.retryConfig.maxRetries,
      retryDelay: this.retryConfig.retryDelay,
      backoffMultiplier: this.retryConfig.backoffMultiplier
    })
  }

  /**
   * 带降级的HTTP方法
   */
  async getWithFallback<T = any>(
    url: string,
    fallbackType: string,
    config?: AxiosRequestConfig & { silent?: boolean }
  ): Promise<T> {
    return withFallback(
      () => this.get<T>(url, config),
      () => getAdminFallbackData(fallbackType),
      {
        silent: config?.silent,
        customMessage: config?.silent ? undefined : undefined
      }
    )
  }

  async postWithFallback<T = any>(
    url: string,
    data?: any,
    fallbackType: string,
    config?: AxiosRequestConfig & { silent?: boolean }
  ): Promise<T> {
    return withFallback(
      () => this.post<T>(url, data, config),
      () => getAdminFallbackData(fallbackType),
      {
        silent: config?.silent,
        customMessage: config?.silent ? undefined : undefined
      }
    )
  }

  /**
   * 带重试和降级的HTTP方法
   */
  async getWithRetryAndFallback<T = any>(
    url: string,
    fallbackType: string,
    config?: AxiosRequestConfig & {
      maxRetries?: number;
      silent?: boolean;
      customMessage?: string
    }
  ): Promise<T> {
    return withRetryAndFallback(
      () => this.get<T>(url, config),
      () => getAdminFallbackData(fallbackType),
      {
        maxRetries: config?.maxRetries || this.retryConfig.maxRetries,
        retryDelay: this.retryConfig.retryDelay,
        backoffMultiplier: this.retryConfig.backoffMultiplier
      },
      {
        silent: config?.silent,
        customMessage: config?.customMessage
      }
    )
  }

  async postWithRetryAndFallback<T = any>(
    url: string,
    data?: any,
    fallbackType: string,
    config?: AxiosRequestConfig & {
      maxRetries?: number;
      silent?: boolean;
      customMessage?: string
    }
  ): Promise<T> {
    return withRetryAndFallback(
      () => this.post<T>(url, data, config),
      () => getAdminFallbackData(fallbackType),
      {
        maxRetries: config?.maxRetries || this.retryConfig.maxRetries,
        retryDelay: this.retryConfig.retryDelay,
        backoffMultiplier: this.retryConfig.backoffMultiplier
      },
      {
        silent: config?.silent,
        customMessage: config?.customMessage
      }
    )
  }

  /**
   * 批量请求处理
   */
  async batchRequests<T = any>(
    requests: Array<() => Promise<T>>,
    options?: { continueOnError?: boolean; returnPartial?: boolean }
  ): Promise<{ results: T[]; errors: any[] }> {
    return this.errorHandler.handleBatchErrors(requests, options)
  }

  /**
   * 清除认证信息
   */
  clearAuth(): void {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('csrf_token')
    localStorage.removeItem('admin_user')
  }

  /**
   * 设置认证信息
   */
  setAuth(token: string, refreshToken?: string, userData?: any): void {
    localStorage.setItem('admin_token', token)
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }
    if (userData) {
      localStorage.setItem('admin_user', JSON.stringify(userData))
    }
  }

  /**
   * 获取认证token
   */
  getAuthToken(): string | null {
    return localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
  }

  /**
   * 获取管理员信息
   */
  getAdminUser(): any {
    const userData = localStorage.getItem('admin_user')
    return userData ? JSON.parse(userData) : null
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  /**
   * 检查是否为管理员
   */
  isAdmin(): boolean {
    const user = this.getAdminUser()
    return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
  }

  /**
   * 权限检查
   */
  hasPermission(permission: string): boolean {
    const user = this.getAdminUser()
    return user?.permissions?.includes(permission) || false
  }
}

// 创建并导出实例
export const adminApiClient = new AdminApiClient()

// 导出便捷方法
export const {
  get,
  post,
  put,
  'delete': del,
  getWithRetry,
  postWithRetry,
  getWithFallback,
  postWithFallback,
  getWithRetryAndFallback,
  postWithRetryAndFallback,
  batchRequests,
  clearAuth,
  setAuth,
  getAuthToken,
  getAdminUser,
  isAuthenticated,
  isAdmin,
  hasPermission
} = adminApiClient

export default adminApiClient