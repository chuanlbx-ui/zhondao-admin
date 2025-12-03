// 运行时读取配置（不在构建时硬编码）
export interface AdminConfig {
  apiBase: string;
  adminUrl: string;
  apiTimeout: number;
  debug: boolean;
  environment: 'development' | 'production';
}

// 从 HTML data 属性读取（由服务器注入）
function getConfigFromDOM(): Partial<AdminConfig> {
  if (typeof document === 'undefined') {
    return {};
  }
  
  const root = document.getElementById('root');
  if (!root) {
    return {};
  }
  
  return {
    apiBase: root.dataset.apiBase,
    adminUrl: root.dataset.adminUrl,
    apiTimeout: root.dataset.apiTimeout ? parseInt(root.dataset.apiTimeout) : undefined,
    debug: root.dataset.debug === 'true',
  };
}

// 从环境变量读取（开发时使用）
function getConfigFromEnv(): Partial<AdminConfig> {
  return {
    apiBase: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    adminUrl: import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174',
    apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
    debug: import.meta.env.VITE_DEBUG === 'true',
    environment: import.meta.env.PROD ? 'production' : 'development',
  };
}

// 合并配置：优先使用DOM注入的值，其次使用环境变量
function mergeConfig(): AdminConfig {
  const domConfig = getConfigFromDOM();
  const envConfig = getConfigFromEnv();
  
  return {
    apiBase: domConfig.apiBase || envConfig.apiBase || 'http://localhost:3000',
    adminUrl: domConfig.adminUrl || envConfig.adminUrl || 'http://localhost:5174',
    apiTimeout: domConfig.apiTimeout || envConfig.apiTimeout || 10000,
    debug: domConfig.debug ?? envConfig.debug ?? false,
    environment: envConfig.environment || 'production',
  };
}

export const appConfig = mergeConfig();

// 验证配置
export function validateConfig() {
  if (!appConfig.apiBase) {
    throw new Error('API base URL is not configured');
  }
  
  if (appConfig.debug) {
    console.log('🔧 Admin App Config:', {
      apiBase: appConfig.apiBase,
      adminUrl: appConfig.adminUrl,
      apiTimeout: appConfig.apiTimeout,
      environment: appConfig.environment,
      debug: appConfig.debug,
    });
  }
}
