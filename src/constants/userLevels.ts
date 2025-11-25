/**
 * 用户等级体系常量定义
 * 包含7个等级的详细配置、权益和升级要求
 */

export interface UserLevel {
  key: string
  name: string
  color: string
  icon: string
  order: number
  discount: string // 商品折扣
  description: string
  benefits: string[] // 权益列表
  upgradeRequires: string // 升级要求
  monthlyReward: number // 每月赠送通券数
  monthlyBonus?: number // 月度奖励
}

export const USER_LEVELS: Record<string, UserLevel> = {
  NORMAL: {
    key: 'NORMAL',
    name: '普通会员',
    color: '#8c8c8c',
    icon: '👤',
    order: 1,
    discount: '原价',
    description: '普通会员',
    benefits: [
      '基础购物功能',
      '参与平台活动',
      '积累消费升级',
    ],
    upgradeRequires: '新用户默认等级',
    monthlyReward: 0,
  },
  VIP: {
    key: 'VIP',
    name: 'VIP会员',
    color: '#f5222d',
    icon: '💎',
    order: 2,
    discount: '8折',
    description: 'VIP会员',
    benefits: [
      '享受8折优惠',
      '优先客服支持',
      '每月赠送100通券',
      '专属会员活动邀请',
    ],
    upgradeRequires: '累计消费满1000元',
    monthlyReward: 100,
  },
  STAR_1: {
    key: 'STAR_1',
    name: '一星店长',
    color: '#faad14',
    icon: '⭐',
    order: 3,
    discount: '4折',
    description: '一星店长',
    benefits: [
      '享受4折优惠',
      '专属销售工具',
      '每月赠送500通券',
      '专属培训支持',
      '销售返利20%',
    ],
    upgradeRequires: '直推5人 + 团队销售额满5000元',
    monthlyReward: 500,
    monthlyBonus: 600, // 月度奖励￥600
  },
  STAR_2: {
    key: 'STAR_2',
    name: '二星店长',
    color: '#13c2c2',
    icon: '⭐⭐',
    order: 4,
    discount: '3.5折',
    description: '二星店长',
    benefits: [
      '享受3.5折优惠',
      '专属品牌合作',
      '每月赠送2000通券',
      '品牌推广支持',
      '销售返利25%',
    ],
    upgradeRequires: '直推10人 + 团队销售额满20000元',
    monthlyReward: 2000,
    monthlyBonus: 3000,
  },
  STAR_3: {
    key: 'STAR_3',
    name: '三星店长',
    color: '#52c41a',
    icon: '⭐⭐⭐',
    order: 5,
    discount: '3折',
    description: '三星店长',
    benefits: [
      '享受3折优惠',
      '独立门店运营权',
      '每月赠送5000通券',
      '专属运营团队',
      '销售返利30%',
    ],
    upgradeRequires: '直推20人 + 团队销售额满50000元',
    monthlyReward: 5000,
    monthlyBonus: 15000,
  },
  STAR_4: {
    key: 'STAR_4',
    name: '四星店长',
    color: '#1890ff',
    icon: '⭐⭐⭐⭐',
    order: 6,
    discount: '2.6折',
    description: '四星店长',
    benefits: [
      '享受2.6折优惠',
      '城市代理权',
      '每月赠送10000通券',
      '城市市场开发支持',
      '销售返利35%',
    ],
    upgradeRequires: '直推50人 + 团队销售额满200000元',
    monthlyReward: 10000,
    monthlyBonus: 72000,
  },
  STAR_5: {
    key: 'STAR_5',
    name: '五星店长',
    color: '#722ed1',
    icon: '⭐⭐⭐⭐⭐',
    order: 7,
    discount: '2.4折',
    description: '五星店长',
    benefits: [
      '享受2.4折优惠',
      '省级代理权',
      '每月赠送20000通券',
      '省级市场开发支持',
      '销售返利40%',
    ],
    upgradeRequires: '直推100人 + 团队销售额满500000元',
    monthlyReward: 20000,
    monthlyBonus: 288000,
  },
  DIRECTOR: {
    key: 'DIRECTOR',
    name: '董事',
    color: '#ff7a45',
    icon: '👑',
    order: 8,
    discount: '2.2折',
    description: '董事',
    benefits: [
      '享受2.2折优惠',
      '全国代理权',
      '每月赠送50000通券',
      '全国市场开发支持',
      '销售返利50%',
    ],
    upgradeRequires: '邀请500人 + 团队销售额满1000000元',
    monthlyReward: 50000,
    monthlyBonus: 1320000,
  },
}

/**
 * 获取用户等级配置
 */
export const getLevelConfig = (level: string): UserLevel | undefined => {
  return USER_LEVELS[level]
}

/**
 * 获取所有等级列表（按升序排列）
 */
export const getAllLevels = (): UserLevel[] => {
  return Object.values(USER_LEVELS).sort((a, b) => a.order - b.order)
}

/**
 * 获取用户等级的升级进度信息
 */
export interface UpgradeProgress {
  currentLevel: UserLevel
  nextLevel?: UserLevel
  progressPercentage: number // 0-100
  description: string
}

export const getUpgradeProgress = (
  currentLevel: string,
  // 实际的升级数据（由后端提供）
  metrics: {
    directCount: number // 直推人数
    teamSales: number // 团队销售额
  }
): UpgradeProgress => {
  const current = USER_LEVELS[currentLevel]
  const levels = getAllLevels()
  const currentIndex = levels.findIndex(l => l.key === currentLevel)
  const next = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : undefined

  // 简单的进度计算（实际应由后端提供更复杂的逻辑）
  let progressPercentage = 0
  let description = '已达最高等级'

  if (next && current) {
    // 这是一个示例计算，实际逻辑应该更复杂
    progressPercentage = Math.min(100, (metrics.directCount / 50) * 50 + (metrics.teamSales / 200000) * 50)
    description = `距离升级${next.name}还差 ${Math.max(0, 50 - metrics.directCount)} 人直推或 ¥${Math.max(0, 200000 - metrics.teamSales)} 销售额`
  }

  return {
    currentLevel: current!,
    nextLevel: next,
    progressPercentage,
    description,
  }
}

/**
 * 等级权益比较工具
 */
export const compareLevelBenefits = (level1: string, level2: string) => {
  const l1 = USER_LEVELS[level1]
  const l2 = USER_LEVELS[level2]

  if (!l1 || !l2) return null

  return {
    level1: {
      name: l1.name,
      discount: l1.discount,
      monthlyReward: l1.monthlyReward,
      monthlyBonus: l1.monthlyBonus,
    },
    level2: {
      name: l2.name,
      discount: l2.discount,
      monthlyReward: l2.monthlyReward,
      monthlyBonus: l2.monthlyBonus,
    },
  }
}
