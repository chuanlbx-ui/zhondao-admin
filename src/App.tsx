import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Button, Badge } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  SettingOutlined,
  LogoutOutlined,
  BarsOutlined,
  DollarOutlined,
  CarOutlined,
  FileTextOutlined,
  PieChartOutlined,
  AppstoreOutlined,
  CrownOutlined,
  AuditOutlined,
} from '@ant-design/icons'
import { filterMenuByRole, usePermission } from '@/utils/permission'
import { useAuthStore } from '@/store'
import { adminApiClient } from '@/api'
import LoginPage from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users'
import UserLevelSystem from '@/pages/UserLevelSystem'
import AuditLog from '@/pages/AuditLog'
import Products from '@/pages/Products'
import Orders from '@/pages/Orders'
import Commission from '@/pages/Commission'
import Config from '@/pages/Config'
import Profile from '@/pages/Profile'
import Shops from '@/pages/Shops'
import Purchases from '@/pages/Purchases'
import Inventory from '@/pages/Inventory'
import Logistics from '@/pages/Logistics'
import Points from '@/pages/Points'
import LevelConfig from '@/pages/Settings/LevelConfig'
import CategoryManagement from '@/pages/CategoryManagement'
import './App.css'

const { Header, Content, Sider } = Layout

export default function App() {
  const navigate = useNavigate()
  const { token, logout, setToken, user } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  
  
  
  // 初始化 CSRF Token
  useEffect(() => {
    adminApiClient.initCSRFToken()
  }, [])


  // 如果未登录，显示登录页面
  if (!token) {
    return <LoginPage />
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'business',
      icon: <ShoppingOutlined />,
      label: '业务管理',
      children: [
        {
          key: '/users',
          icon: <UserOutlined />,
          label: '用户管理',
          onClick: () => navigate('/users'),
        },
        {
          key: '/user-level-system',
          icon: <CrownOutlined />,
          label: '等级体系',
          onClick: () => navigate('/user-level-system'),
        },
        {
          key: '/products',
          icon: <ShoppingCartOutlined />,
          label: '商品管理',
          onClick: () => navigate('/products'),
        },
        {
          key: '/orders',
          icon: <BarsOutlined />,
          label: '订单管理',
          onClick: () => navigate('/orders'),
        },
      ],
    },
    {
      key: 'supply',
      icon: <AppstoreOutlined />,
      label: '供应链管理',
      children: [
        {
          key: '/purchases',
          icon: <ShoppingOutlined />,
          label: '采购管理',
          onClick: () => navigate('/purchases'),
        },
        {
          key: '/inventory',
          icon: <FileTextOutlined />,
          label: '库存管理',
          onClick: () => navigate('/inventory'),
        },
        {
          key: '/logistics',
          icon: <CarOutlined />,
          label: '物流管理',
          onClick: () => navigate('/logistics'),
        },
      ],
    },
    {
      key: 'finance',
      icon: <DollarOutlined />,
      label: '财务管理',
      children: [
        {
          key: '/commission',
          icon: <PieChartOutlined />,
          label: '佣金管理',
          onClick: () => navigate('/commission'),
        },
        {
          key: '/points',
          icon: <DollarOutlined />,
          label: '通券管理',
          onClick: () => navigate('/points'),
        },
      ],
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: '/level-config',
          icon: <CrownOutlined />,
          label: '等级配置',
          onClick: () => navigate('/level-config'),
        },
        {
          key: '/config',
          icon: <SettingOutlined />,
          label: '系统配置',
          onClick: () => navigate('/config'),
        },
        {
          key: '/audit-log',
          icon: <AuditOutlined />,
          label: '审计日志',
          onClick: () => navigate('/audit-log'),
        },
      ],
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人中心',
      onClick: () => navigate('/profile'),
    } as any,
    {
      type: 'divider',
    } as any,
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className="admin-sider"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        <div className="logo" style={{ padding: '24px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ margin: 0, fontSize: collapsed ? '16px' : '20px' }}>
            {collapsed ? '中道' : '中道商城'}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
            {collapsed ? '后台' : '管理后台'}
          </p>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          defaultSelectedKeys={['dashboard']}
          style={{ border: 'none' }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            paddingLeft: 16,
            paddingRight: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? '☰' : '✕'}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '18px', color: '#667eea' }}
          />

          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 12 }}>
              <span>{user?.username || '管理员'}</span>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#667eea' }} />
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: 24,
            background: '#f5f7fa',
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/user-level-system" element={<UserLevelSystem />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/logistics" element={<Logistics />} />
            <Route path="/commission" element={<Commission />} />
            <Route path="/points" element={<Points />} />
            <Route path="/level-config" element={<LevelConfig />} />
            <Route path="/config" element={<Config />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/category-management" element={<CategoryManagement />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}
