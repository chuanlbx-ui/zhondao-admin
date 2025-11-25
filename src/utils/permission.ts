/**
 * 权限管理工具库
 */

export type UserRole = 'super_admin' | 'user_manager' | 'shop_manager' | 'finance_manager' | 'viewer'

/**
 * 权限定义 - 定义每个角色可以访问的菜单和功能
 */
export const PERMISSION_MAP: Record<UserRole, {
  menus: string[]
  features: string[]
  description: string
}> = {
  super_admin: {
    menus: [
      'dashboard',
      'business', 'users', 'shops', 'products', 'orders',
      'supply', 'purchases', 'inventory', 'logistics',
      'finance', 'commission', 'points',
      'system', 'config', 'admins', 'roles', 'logs'
    ],
    features: [
      'create', 'read', 'update', 'delete',
      'export', 'import', 'batch_operation',
      'approve', 'reject', 'admin_manage'
    ],
    description: '超级管理员 - 拥有全部权限'
  },
  user_manager: {
    menus: [
      'dashboard',
      'business', 'users', 'shops', 'products',
      'finance', 'commission',
      'system', 'logs'
    ],
    features: [
      'create', 'read', 'update', 'delete',
      'export', 'batch_operation', 'approve'
    ],
    description: '用户管理员 - 管理用户和店铺'
  },
  shop_manager: {
    menus: [
      'dashboard',
      'business', 'shops', 'products',
      'finance', 'commission'
    ],
    features: [
      'create', 'read', 'update', 'delete',
      'export'
    ],
    description: '店铺管理员 - 管理店铺和商品'
  },
  finance_manager: {
    menus: [
      'dashboard',
      'finance', 'commission', 'points',
      'supply', 'purchases'
    ],
    features: [
      'read', 'export', 'approve', 'reject'
    ],
    description: '财务管理员 - 管理财务和订单'
  },
  viewer: {
    menus: [
      'dashboard'
    ],
    features: [
      'read', 'export'
    ],
    description: '查看者 - 只读权限'
  }
}

/**
 * 检查用户是否有特定菜单的访问权限
 */
export function hasMenuPermission(role: UserRole, menuKey: string): boolean {
  return PERMISSION_MAP[role]?.menus?.includes(menuKey) || false
}

/**
 * 检查用户是否有特定功能的权限
 */
export function hasFeaturePermission(role: UserRole, feature: string): boolean {
  return PERMISSION_MAP[role]?.features?.includes(feature) || false
}

/**
 * 获取用户可访问的菜单列表
 */
export function getAccessibleMenus(role: UserRole): string[] {
  return PERMISSION_MAP[role]?.menus || PERMISSION_MAP['viewer']?.menus || []
}

/**
 * 获取用户可使用的功能列表
 */
export function getAccessibleFeatures(role: UserRole): string[] {
  return PERMISSION_MAP[role]?.features || PERMISSION_MAP['viewer']?.features || []
}

/**
 * 根据用户角色过滤菜单项
 */
export function filterMenuByRole(
  menuItems: any[],
  role: UserRole
): any[] {
  return menuItems.filter(item => {
    if (!hasMenuPermission(role, item.key)) {
      return false
    }

    // 递归过滤子菜单
    if (item.children && item.children.length > 0) {
      item.children = filterMenuByRole(item.children, role)
      return item.children.length > 0 || !item.children
    }

    return true
  })
}

/**
 * 权限上下文 Hook
 */
export function usePermission() {
  const storedRole = localStorage.getItem('user_role') as UserRole
  let userRole = storedRole && PERMISSION_MAP[storedRole] ? storedRole : 'viewer'
  
  // 如果当前用户没有登录或者角色无效，默认使用超级管理员角色（用于开发测试）
  if (!storedRole || !PERMISSION_MAP[storedRole]) {
    console.warn('用户角色无效或未登录，默认使用超级管理员权限')
    userRole = 'super_admin'
  }
  
  const userPermissions = PERMISSION_MAP[userRole] || PERMISSION_MAP['viewer']

  return {
    role: userRole,
    menus: userPermissions.menus,
    features: userPermissions.features,
    description: userPermissions.description,
    hasMenu: (menuKey: string) => hasMenuPermission(userRole, menuKey),
    hasFeature: (feature: string) => hasFeaturePermission(userRole, feature),
    canCreate: () => hasFeaturePermission(userRole, 'create'),
    canRead: () => hasFeaturePermission(userRole, 'read'),
    canUpdate: () => hasFeaturePermission(userRole, 'update'),
    canDelete: () => hasFeaturePermission(userRole, 'delete'),
    canExport: () => hasFeaturePermission(userRole, 'export'),
    canApprove: () => hasFeaturePermission(userRole, 'approve'),
  }
}

/**
 * 权限检查条件渲染组件
 */
export function PermissionGate({
  feature,
  fallback = null,
  children,
}: {
  feature: string
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const storedRole = localStorage.getItem('user_role') as UserRole
  const userRole = storedRole && PERMISSION_MAP[storedRole] ? storedRole : 'viewer'
  
  if (!hasFeaturePermission(userRole, feature)) {
    return fallback
  }

  return children
}

export default {
  hasMenuPermission,
  hasFeaturePermission,
  getAccessibleMenus,
  getAccessibleFeatures,
  filterMenuByRole,
  usePermission,
  PermissionGate,
  PERMISSION_MAP,
}
