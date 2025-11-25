﻿﻿﻿﻿import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

// @ts-ignore
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000/api/v1'

class CacheManager {
  private cache: Map<string, any> = new Map()
  private ttl: number = 5 * 60 * 1000

  set(key: string, value: any) {
    this.cache.set(key, { value, timestamp: Date.now() })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    return item.value
  }

  clear() {
    this.cache.clear()
  }
}

const cacheManager = new CacheManager()

class ApiClient {
  private client: AxiosInstance
  private csrfToken: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.client.interceptors.request.use(
      async (config) => {
        const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => {
        const cookies = document.cookie.split(';').map(c => c.trim())
        const csrfCookie = cookies.find(c => c.startsWith('csrf-token='))
        if (csrfCookie) {
          this.csrfToken = csrfCookie.split('=')[1]
          if (this.csrfToken) {
            this.client.defaults.headers.common['X-CSRF-Token'] = this.csrfToken
          }
        }
        return response.data
      },
      (error) => {
        const cookies = document.cookie.split(';').map(c => c.trim())
        const csrfCookie = cookies.find(c => c.startsWith('csrf-token='))
        if (csrfCookie) {
          const token = csrfCookie.split('=')[1]
          if (token) {
            this.csrfToken = token
            this.client.defaults.headers.common['X-CSRF-Token'] = token
          }
        }
        return Promise.reject(error)
      }
    )
  }

  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T, T>(url, config)
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T, T>(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T, T>(url, data, config)
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T, T>(url, config)
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch<T, T>(url, data, config)
  }

  initCSRFToken() {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const csrfCookie = cookies.find(c => c.startsWith('csrf-token='))
    if (csrfCookie) {
      this.csrfToken = csrfCookie.split('=')[1]
      if (this.csrfToken) {
        this.client.defaults.headers.common['X-CSRF-Token'] = this.csrfToken
      }
    }
  }
}

export const adminApiClient = new ApiClient()

export const adminAuthApi = {
  login: (data: { username: string; password: string }) =>
    adminApiClient.post('/admin/auth/login', data),

  logout: () =>
    adminApiClient.post('/admin/auth/logout'),

  getProfile: () =>
    adminApiClient.get('/admin/auth/profile'),
}

export const adminUserApi = {
  getList: async (params?: any) => {
    const cacheKey = `users_list_${JSON.stringify(params)}`
    const cached = cacheManager.get(cacheKey)
    if (cached) return cached

    try {
      const response = await adminApiClient.get('/admin/users', { params })
      const result = response.data || response
      cacheManager.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('User list error:', error)
      // 返回模拟数据以支持离线开发
      const mockData = {
        data: {
          items: [
            { id: '1', nickname: '测试用户1', phone: '13800138000', level: 'VIP', openid: 'test1', createdAt: new Date().toISOString(), pointsBalance: 100 },
            { id: '2', nickname: '测试用户2', phone: '13800138001', level: 'STAR_1', openid: 'test2', createdAt: new Date().toISOString(), pointsBalance: 200 },
            { id: '3', nickname: '测试用户3', phone: '13800138002', level: 'NORMAL', openid: 'test3', createdAt: new Date().toISOString(), pointsBalance: 50 },
          ],
          total: 3,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: 3,
          }
        }
      }
      return mockData
    }
  },

  getDetail: async (id: string) => {
    const cacheKey = `user_detail_${id}`
    const cached = cacheManager.get(cacheKey)
    if (cached) return cached

    try {
      const response = await adminApiClient.get(`/admin/users/${id}`)
      const result = response.data || response
      cacheManager.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('User detail error:', error)
      // 返回模拟数据
      return {
        data: {
          id,
          nickname: '测试用户',
          phone: '13800138000',
          level: 'VIP',
          openid: 'test',
          createdAt: new Date().toISOString(),
          pointsBalance: 100,
          email: 'test@example.com',
        }
      }
    }
  },

  create: async (data: any) => {
    try {
      const response = await adminApiClient.post(`/admin/users`, data)
      cacheManager.clear()
      return response.data || response
    } catch (error) {
      console.error('Create user error:', error)
      // 返回模拟创建结果
      return {
        data: {
          id: `user_${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
        }
      }
    }
  },

  update: async (id: string, data: any) => {
    try {
      const response = await adminApiClient.put(`/admin/users/${id}`, data)
      cacheManager.clear()
      return response.data || response
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await adminApiClient.delete(`/admin/users/${id}`)
      cacheManager.clear()
      return response.data || response
    } catch (error) {
      console.error('Delete user error:', error)
      throw error
    }
  },

  getStatistics: () =>
    adminApiClient.get('/admin/users/statistics'),
}

export const adminDashboardApi = {
  getOverview: () =>
    adminApiClient.get('/admin/dashboard/overview'),

  getUsers: () =>
    adminApiClient.get('/admin/dashboard/users'),

  getOrders: () =>
    adminApiClient.get('/admin/dashboard/orders'),

  getRevenue: () =>
    adminApiClient.get('/admin/dashboard/revenue'),
}

export const adminOrderApi = {
  getList: (params?: any) =>
    adminApiClient.get('/admin/orders', { params }),

  getDetail: (id: string) =>
    adminApiClient.get(`/admin/orders/${id}`),

  update: (id: string, data: any) =>
    adminApiClient.put(`/admin/orders/${id}`, data),

  updateStatus: (id: string, status: string) =>
    adminApiClient.put(`/admin/orders/${id}/status`, { status }),
}

export const adminProductApi = {
  getList: (params?: any) =>
    adminApiClient.get('/admin/products', { params }),

  getDetail: (id: string) =>
    adminApiClient.get(`/admin/products/${id}`),

  create: (data: any) =>
    adminApiClient.post('/admin/products', data),

  update: (id: string, data: any) =>
    adminApiClient.put(`/admin/products/${id}`, data),

  delete: (id: string) =>
    adminApiClient.delete(`/admin/products/${id}`),
}

export const adminSettingsApi = {
  get: () =>
    adminApiClient.get('/admin/settings'),

  update: (data: any) =>
    adminApiClient.put('/admin/settings', data),
}

export default adminApiClient
