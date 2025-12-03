# 中道商城管理后台

![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.11.3-red)
![License](https://img.shields.io/badge/License-MIT-green)

现代化的电商管理后台系统，基于 React + TypeScript + Vite 构建，提供完整的电商管理功能。

## ✨ 功能特性

### 📊 核心模块
- **用户管理**：用户信息管理、等级体系、权限控制
- **商品管理**：商品上架、分类管理、库存管理
- **订单管理**：订单处理、状态跟踪、物流管理
- **财务管理**：佣金管理、通券管理、财务报表
- **供应链管理**：采购管理、库存管理、物流管理
- **系统管理**：配置管理、审计日志、权限管理

### 🛠️ 技术特性
- **现代化技术栈**：React 18 + TypeScript + Vite
- **响应式设计**：支持桌面端和移动端
- **模块化架构**：清晰的代码结构和组件复用
- **类型安全**：完整的 TypeScript 类型定义
- **性能优化**：代码分割、懒加载、缓存机制
- **开发友好**：热重载、ESLint、Prettier

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发环境
```bash
npm run dev
```
开发服务器运行在 `http://localhost:5174`

### 构建项目
```bash
# 开发构建
npm run build

# 生产构建
npm run build:prod

# 部署（构建 + 配置注入）
npm run deploy
```

## 📁 项目结构

```
zhongdao-admin/
├── src/
│   ├── api/                    # API 客户端和接口
│   ├── components/            # 公共组件
│   ├── config/                # 应用配置
│   ├── constants/             # 常量定义
│   ├── examples/              # 示例代码
│   ├── hooks/                 # 自定义 Hooks
│   ├── pages/                 # 页面组件
│   │   ├── Dashboard/         # 仪表板
│   │   ├── Users/             # 用户管理
│   │   ├── Products/          # 商品管理
│   │   ├── Orders/            # 订单管理
│   │   ├── Purchases/         # 采购管理
│   │   ├── Inventory/         # 库存管理
│   │   ├── Logistics/         # 物流管理
│   │   ├── Commission/        # 佣金管理
│   │   ├── Points/            # 通券管理
│   │   ├── Config/            # 系统配置
│   │   ├── Profile/           # 个人中心
│   │   ├── AuditLog/          # 审计日志
│   │   ├── UserLevelSystem/   # 用户等级体系
│   │   ├── Settings/          # 设置页面
│   │   ├── Shops/             # 店铺管理
│   │   └── CategoryManagement/# 分类管理
│   ├── store/                 # 状态管理 (Zustand)
│   └── utils/                 # 工具函数
├── scripts/                   # 构建和部署脚本
├── docs/                      # 项目文档
├── .env.development          # 开发环境配置
├── .env.production           # 生产环境配置
├── vite.config.ts            # Vite 配置
└── package.json              # 项目依赖
```

## 🔧 配置说明

### 环境变量
项目支持两种配置方式：

1. **开发环境**：使用 `.env.development` 文件
2. **生产环境**：使用 `.env.production` 文件 + 运行时注入

主要配置项：
```env
VITE_API_BASE_URL=http://localhost:3000    # API 基础地址
VITE_ADMIN_URL=http://localhost:5174       # 管理后台地址
VITE_API_TIMEOUT=10000                     # API 超时时间
VITE_DEBUG=true                            # 调试模式
```

### 运行时配置
生产环境通过 `scripts/inject-config.js` 注入配置，支持动态更新。

## 📡 API 集成

### API 客户端特性
- 自动 JWT Token 认证
- CSRF Token 管理
- 请求/响应拦截器
- 缓存机制（5分钟 TTL）
- 离线开发支持（模拟数据回退）

### 主要 API 模块
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

// 仪表板数据
adminDashboardApi.getOverview()
adminDashboardApi.getUsers()
adminDashboardApi.getOrders()
adminDashboardApi.getRevenue()
```

## 🎨 技术栈详情

### 前端框架
- **React 18**：最新的 React 特性
- **TypeScript**：类型安全的 JavaScript
- **Vite 5**：快速的构建工具

### UI 组件库
- **Ant Design 5**：企业级 UI 设计语言
- **Ant Design Icons**：图标库
- **ECharts**：数据可视化图表

### 状态管理
- **Zustand**：轻量级状态管理
- **React Router DOM 6**：路由管理

### 开发工具
- **ESLint**：代码质量检查
- **Prettier**：代码格式化
- **Less**：CSS 预处理器

## 🧪 开发指南

### 代码规范
- 组件使用 PascalCase：`ComponentName.tsx`
- 工具函数使用 camelCase：`utilityFunction.ts`
- 样式文件与组件同名：`ComponentName.css`

### 组件开发示例
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

### 错误处理
- 使用 try-catch 包装异步操作
- 提供用户友好的错误提示
- 支持离线开发（模拟数据回退）

## 🚢 部署流程

### 生产部署
1. 构建生产版本：`npm run build:prod`
2. 注入运行时配置：`node scripts/inject-config.js`
3. 部署到静态文件服务器

### 配置注入
部署脚本自动将环境变量注入到 `dist/index.html`：
```javascript
const apiBase = process.env.API_BASE || 'https://zd-api.wenbita.cn'
const adminUrl = process.env.ADMIN_URL || 'https://zd-admin.wenbita.cn'
```

### GitHub Actions
项目包含 `.github/workflows/deploy.yml` 用于自动化部署。

## 📚 相关文档

项目包含完整的开发文档：

- `docs/README-协同开发.md` - 文档索引和导航
- `docs/如何用好AI协同开发指南.md` - 使用指南
- `docs/AI协同开发指南.md` - 协同理论
- `docs/管理后台AI协同开发计划.md` - 项目计划
- `docs/AI协同开发实施指南.md` - 实施手册
- `docs/AI协同快速参考.md` - 速查参考

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

### 代码审查
- 遵循现有代码风格
- 确保类型安全
- 添加必要的测试
- 更新相关文档

## 📄 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](LICENSE) 文件。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [项目 Issues](https://github.com/chuanlbx-ui/zhondao-admin/issues)
- 邮箱: [你的邮箱]

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**最后更新**: 2025年12月3日  
**版本**: 1.0.0