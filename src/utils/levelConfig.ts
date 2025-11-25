/**
 * 用户等级配置 - 统一数据源
 * 用于确保所有页面使用相同的等级折扣配置
 */

export interface LevelDiscount {
  key: string
  name: string
  discount: number // 折扣比例，1.0为原价，0.5为5折
  order: number
}

// 用户等级折扣配置 - 与等级配置页面保持一致
export const LEVEL_DISCOUNTS: Record<string, LevelDiscount> = {
  '普通会员': { key: 'NORMAL', name: '普通会员', discount: 1.0, order: 1 },
  'VIP会员': { key: 'VIP', name: 'VIP会员', discount: 0.8, order: 2 },
  '一星店长': { key: 'STAR_1', name: '一星店长', discount: 0.75, order: 3 },
  '二星店长': { key: 'STAR_2', name: '二星店长', discount: 0.7, order: 4 },
  '三星店长': { key: 'STAR_3', name: '三星店长', discount: 0.65, order: 5 },
  '四星店长': { key: 'STAR_4', name: '四星店长', discount: 0.6, order: 6 },
  '五星店长': { key: 'STAR_5', name: '五星店长', discount: 0.55, order: 7 },
  '董事': { key: 'DIRECTOR', name: '董事', discount: 0.5, order: 8 },
}

// 获取等级折扣比例
export const getLevelDiscount = (levelName: string): number => {
  return LEVEL_DISCOUNTS[levelName]?.discount || 1.0
}

// 获取所有等级名称列表
export const getLevelNames = (): string[] => {
  return Object.keys(LEVEL_DISCOUNTS).sort((a, b) => 
    LEVEL_DISCOUNTS[a].order - LEVEL_DISCOUNTS[b].order
  )
}

// 获取等级配置对象（用于定价参考表）
export const getPriceDiscountObject = (): Record<string, number> => {
  const result: Record<string, number> = {}
  Object.values(LEVEL_DISCOUNTS).forEach(level => {
    result[level.name] = level.discount
  })
  return result
}