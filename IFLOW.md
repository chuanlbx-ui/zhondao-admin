# 中道商城管理后台 - iFlow 上下文指南

## 项目概述

**中道商城管理后台**是一个基于 React + TypeScript + Vite 构建的现代化电商管理平台。项目采用模块化架构，包含用户管理、商品管理、订单管理、供应链管理、财务管理等核心模块。

### 技术栈
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **UI 组件库**: Ant Design 5
- **状态管理**: Zustand
- **路由**: React Router DOM 6
- **HTTP 客户端**: Axios
- **图表库**: ECharts
- **CSS 预处理器**: Less

### 项目结构
```
zhongdao-admin/
├── src/
│   ├── api/                    # API 客户端和接口定义
│   ├── components/             # 公共组件
│   ├── config/                 # 应用配置
│   ├── constants/              # 常量定义
│   ├── examples/               # 示例代码
│   ├── hooks/                  # 自定义 Hooks
│   ├── pages/                  # 页面组件
│   │   ├── Dashboard/          # 仪表板
│   │   ├── Users/              # 用户管理
│   │   ├── Products/           # 商品管理
│   │   ├── Orders/             # 订单管理
│   │   ├── Purchases/          # 采购管理
│   │   ├── Inventory/          # 库存管理
│   │   ├── Logistics/          # 物流管理
│   │   ├── Commission/         # 佣金管理
│   │   ├── Points/             # 通券管理
│   │   ├── Config/             # 系统配置
│   │   ├── Profile/            # 个人中心
│   │   ├── AuditLog/           # 审计日志
│   │   ├── UserLevelSystem/    # 用户等级体系
│   │   ├── Settings/           # 设置页面
│   │   ├── Shops/              # 店铺管理
│   │   └── CategoryManagement/ # 分类管理
│   ├── store/                  # 状态管理 (Zustand)
│   └── utils/                  # 工具函数
├── scripts/                    # 构建和部署脚本
├── docs/                       # 项目文档
├── .env.development           # 开发环境配置
├── .env.production            # 生产环境配置
├── vite.config.ts             # Vite 配置
└── package.json               # 项目依赖
```

## 开发环境设置

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发服务器
```bash
npm run dev
```
开发服务器运行在 `http://localhost:5174`，配置了 API 代理到 `http://localhost:3000`。

### 构建命令
```bash
# 开发构建
npm run build

# 生产构建
npm run build:prod

# 部署（构建 + 注入配置）
npm run deploy
```

### 代码质量
```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit
```

## 配置系统

### 环境变量
项目使用两层配置系统：

1. **构建时环境变量**（`.env.development` / `.env.production`）
2. **运行时配置注入**（通过 `scripts/inject-config.js`）

### 主要配置项
- `VITE_API_BASE_URL`: API 基础地址（默认：`http://localhost:3000`）
- `VITE_ADMIN_URL`: 管理后台地址（默认：`http://localhost:5174`）
- `VITE_API_TIMEOUT`: API 超时时间（默认：10000ms）
- `VITE_DEBUG`: 调试模式开关

### 配置读取优先级
1. HTML `data-*` 属性（生产环境注入）
2. 环境变量（开发环境）
3. 默认值

## API 架构

### API 客户端
位于 `src/api/index.ts`，主要特性：
- 自动处理 JWT Token 认证
- CSRF Token 管理
- 请求/响应拦截器
- 缓存机制（5分钟 TTL）
- 离线开发支持（模拟数据回退）

### API 模块
```typescript
// 认证相关
adminAuthApi.login()
adminAuthApi.logout()
adminAuthApi.getProfile()

// 用户管理
adminUserApi.getList()
adminUserApi.getDetail()
adminUserApi.create()
adminUserApi.update()
adminUserApi.delete()

// 仪表板
adminDashboardApi.getOverview()
adminDashboardApi.getUsers()
adminDashboardApi.getOrders()
adminDashboardApi.getRevenue()

// 订单管理
adminOrderApi.getList()
adminOrderApi.getDetail()
adminOrderApi.update()
adminOrderApi.updateStatus()

// 商品管理
adminProductApi.getList()
adminProductApi.getDetail()
adminProductApi.create()
adminProductApi.update()
adminProductApi.delete()
```

## 状态管理

### 认证状态
使用 Zustand 管理用户认证状态：
```typescript
interface AdminAuthState {
  token: string | null
  user: AdminUser | null
  isLoading: boolean
  error: string | null
  
  setToken: (token: string) => void
  setUser: (user: AdminUser) => void
  logout: () => void
  clearError: () => void
}
```

### 权限管理
- 基于角色的权限控制
- 后端角色到前端角色的映射
- 菜单项权限过滤

## 代码规范

### 文件命名
- 组件文件使用 PascalCase：`ComponentName.tsx`
- 工具函数使用 camelCase：`utilityFunction.ts`
- 样式文件与组件同名：`ComponentName.css`

### 组件结构
```typescript
import React, { useState, useEffect } from 'react'
import { Button, Card, Table } from 'antd'
import { apiClient } from '@/api'
import './ComponentName.css'

export default function ComponentName() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // API 调用逻辑
  }

  return (
    <div className="component-name">
      {/* JSX 内容 */}
    </div>
  )
}
```

### 类型定义
- 优先使用 TypeScript 接口
- 避免使用 `any` 类型
- 为 API 响应定义明确的类型

### 错误处理
- 使用 try-catch 包装异步操作
- 提供用户友好的错误提示
- 支持离线开发（模拟数据回退）

## 路由系统

### 路由配置
在 `src/App.tsx` 中定义，包含：
- 仪表板 (`/dashboard`)
- 用户管理 (`/users`)
- 商品管理 (`/products`)
- 订单管理 (`/orders`)
- 采购管理 (`/purchases`)
- 库存管理 (`/inventory`)
- 物流管理 (`/logistics`)
- 佣金管理 (`/commission`)
- 通券管理 (`/points`)
- 系统配置 (`/config`)
- 个人中心 (`/profile`)
- 审计日志 (`/audit-log`)
- 用户等级体系 (`/user-level-system`)
- 等级配置 (`/level-config`)
- 分类管理 (`/category-management`)

### 权限路由
- 未登录用户重定向到登录页
- 基于用户角色过滤菜单项

## 部署流程

### 生产部署
1. 构建生产版本：`npm run build:prod`
2. 注入运行时配置：`node scripts/inject-config.js`
3. 部署到静态文件服务器

### 配置注入
部署脚本会自动将环境变量注入到 `dist/index.html`：
```javascript
// 从环境变量读取
const apiBase = process.env.API_BASE || 'https://zd-api.wenbita.cn'
const adminUrl = process.env.ADMIN_URL || 'https://zd-admin.wenbita.cn'
```

### GitHub Actions
项目包含 `.github/workflows/deploy.yml` 用于自动化部署。

## 开发约定

### 组件开发
1. **功能单一**：每个组件只负责一个明确的功能
2. **Props 类型化**：为所有 Props 定义 TypeScript 接口
3. **样式隔离**：使用 CSS Modules 或组件级样式
4. **可复用性**：提取公共逻辑到自定义 Hooks

### API 集成
1. **错误处理**：所有 API 调用必须有错误处理
2. **加载状态**：显示加载状态提升用户体验
3. **数据缓存**：合理使用缓存减少重复请求
4. **离线支持**：提供模拟数据支持离线开发

### 状态管理
1. **最小化状态**：只将必要的状态提升到全局
2. **不可变更新**：使用不可变方式更新状态
3. **类型安全**：为所有状态定义明确的类型

## 调试和测试

### 开发工具
- React DevTools 扩展
- Redux DevTools（兼容 Zustand）
- 浏览器开发者工具

### 调试技巧
1. 启用 `VITE_DEBUG=true` 查看配置信息
2. 使用 `console.log` 调试数据流
3. 检查网络请求和响应

### 测试策略
- 单元测试：工具函数和业务逻辑
- 组件测试：UI 组件渲染和交互
- E2E 测试：关键用户流程

## 常见任务

### 添加新页面
1. 在 `src/pages/` 创建新目录
2. 创建页面组件 `index.tsx`
3. 在 `src/App.tsx` 中添加路由
4. 在侧边栏菜单中添加导航项

### 添加新 API
1. 在 `src/api/index.ts` 中添加 API 函数
2. 定义请求/响应类型
3. 实现错误处理和缓存逻辑

### 修改样式
1. 使用 Ant Design 主题变量
2. 组件级样式优先于全局样式
3. 响应式设计支持移动端

## 故障排除

### 常见问题
1. **API 连接失败**：检查 `VITE_API_BASE_URL` 配置
2. **认证失效**：清除 localStorage 并重新登录
3. **构建错误**：检查 TypeScript 类型错误
4. **样式不生效**：检查 CSS 导入和选择器

### 开发服务器问题
```bash
# 端口被占用
npm run dev -- --port 5175

# 清除缓存
rm -rf node_modules/.vite
```

## 相关文档

项目包含完整的 AI 协同开发文档：
- `docs/README-协同开发.md` - 文档索引和导航
- `docs/如何用好AI协同开发指南.md` - 使用指南
- `docs/AI协同开发指南.md` - 协同理论
- `docs/管理后台AI协同开发计划.md` - 项目计划
- `docs/AI协同开发实施指南.md` - 实施手册
- `docs/AI协同快速参考.md` - 速查参考

## 维护说明

### 版本更新
- 定期更新依赖包
- 测试新版本兼容性
- 更新 TypeScript 配置

### 代码审查
- 遵循现有代码风格
- 确保类型安全
- 添加必要的测试
- 更新相关文档

### 性能优化
- 代码分割和懒加载
- 图片和资源优化
- 减少不必要的重渲染

---

*最后更新：2025年12月3日*  
*维护团队：中道商城开发团队*