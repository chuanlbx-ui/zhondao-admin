import { create } from 'zustand'

export interface AdminUser {
  id: string
  username: string
  email?: string
  role?: string
}

interface AdminAuthState {
  token: string | null
  user: AdminUser | null
  isLoading: boolean
  error: string | null

  // Actions
  setToken: (token: string) => void
  setUser: (user: AdminUser) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AdminAuthState>((set) => ({
  token: localStorage.getItem('admin_token'),
  user: null,
  isLoading: false,
  error: null,

  setToken: (token) => {
    localStorage.setItem('admin_token', token)
    set({ token })
  },

  setUser: (user) => {
    // 设置用户时同时设置角色到 localStorage
    if (user?.role) {
      // 映射后端角色到前端权限角色
      const backendRole = user.role.toUpperCase()
      let frontendRole = 'viewer' // 默认角色
      
      if (backendRole === 'ADMIN' || backendRole === 'SUPER_ADMIN') {
        frontendRole = 'super_admin'
      } else if (backendRole === 'USER_MANAGER') {
        frontendRole = 'user_manager'
      } else if (backendRole === 'SHOP_MANAGER') {
        frontendRole = 'shop_manager'
      } else if (backendRole === 'FINANCE_MANAGER') {
        frontendRole = 'finance_manager'
      }
      
      try {
        localStorage.setItem('user_role', frontendRole)
      } catch {}
    }
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('user_role')
    set({ token: null, user: null })
  },

  clearError: () => set({ error: null }),
}))
