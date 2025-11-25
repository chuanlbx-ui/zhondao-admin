/**
 * 高级搜索和过滤工具库
 */

/**
 * 全文搜索 - 在多个字段中搜索
 */
export function fullTextSearch<T extends Record<string, any>>(
  data: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query || query.length === 0) return data

  const lowerQuery = query.toLowerCase()
  
  return data.filter(item => {
    return fields.some(field => {
      const value = item[field]
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(lowerQuery)
    })
  })
}

/**
 * 精确搜索 - 完全匹配
 */
export function exactSearch<T extends Record<string, any>>(
  data: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query || query.length === 0) return data

  return data.filter(item => {
    return fields.some(field => {
      return String(item[field]) === query
    })
  })
}

/**
 * 范围过滤 - 数值范围
 */
export function rangeFilter<T extends Record<string, any>>(
  data: T[],
  field: keyof T,
  min: number,
  max: number
): T[] {
  return data.filter(item => {
    const value = Number(item[field])
    return value >= min && value <= max
  })
}

/**
 * 日期范围过滤
 */
export function dateRangeFilter<T extends Record<string, any>>(
  data: T[],
  field: keyof T,
  startDate: Date,
  endDate: Date
): T[] {
  return data.filter(item => {
    const date = new Date(item[field] as string)
    return date >= startDate && date <= endDate
  })
}

/**
 * 多条件过滤
 */
export function multiFilter<T extends Record<string, any>>(
  data: T[],
  filters: Array<{
    field: keyof T
    value: any
    operator?: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte'
  }>
): T[] {
  return data.filter(item => {
    return filters.every(filter => {
      const itemValue = item[filter.field]
      const filterValue = filter.value

      switch (filter.operator || 'equals') {
        case 'contains':
          return String(itemValue).includes(String(filterValue))
        case 'equals':
          return itemValue === filterValue
        case 'gt':
          return Number(itemValue) > Number(filterValue)
        case 'lt':
          return Number(itemValue) < Number(filterValue)
        case 'gte':
          return Number(itemValue) >= Number(filterValue)
        case 'lte':
          return Number(itemValue) <= Number(filterValue)
        default:
          return true
      }
    })
  })
}

/**
 * 模糊搜索 - 计算相似度（Levenshtein距离）
 */
export function fuzzySearch<T extends Record<string, any>>(
  data: T[],
  query: string,
  fields: (keyof T)[],
  threshold: number = 0.6
): T[] {
  if (!query || query.length === 0) return data

  const scored = data.map(item => ({
    item,
    score: Math.max(
      ...fields.map(field => {
        const value = String(item[field]).toLowerCase()
        return similarity(value, query.toLowerCase())
      })
    ),
  }))

  return scored
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}

/**
 * 计算字符串相似度
 */
function similarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b
  const shorter = a.length > b.length ? b : a

  if (longer.length === 0) return 1.0

  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * 编辑距离（Levenshtein距离）
 */
function getEditDistance(a: string, b: string): number {
  const costs = []

  for (let i = 0; i <= a.length; i++) {
    let lastValue = i
    for (let j = 0; j <= b.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (a.charAt(i - 1) !== b.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[b.length] = lastValue
  }

  return costs[b.length]
}

/**
 * 排序函数
 */
export function sortData<T extends Record<string, any>>(
  data: T[],
  field: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal
    }

    const aStr = String(aVal)
    const bStr = String(bVal)
    const comparison = aStr.localeCompare(bStr)
    return order === 'asc' ? comparison : -comparison
  })
}

/**
 * 分组函数
 */
export function groupBy<T extends Record<string, any>>(
  data: T[],
  field: keyof T
): Record<string, T[]> {
  return data.reduce((result, item) => {
    const key = String(item[field])
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * 去重函数
 */
export function uniqueBy<T extends Record<string, any>>(
  data: T[],
  field: keyof T
): T[] {
  const seen = new Set()
  return data.filter(item => {
    const key = item[field]
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * 检索索引构建 - 用于快速全文搜索
 */
export class SearchIndex<T extends Record<string, any>> {
  private index: Map<string, Set<number>> = new Map()
  private data: T[] = []

  constructor(data: T[], fields: (keyof T)[]) {
    this.data = data
    this.buildIndex(fields)
  }

  private buildIndex(fields: (keyof T)[]) {
    this.data.forEach((item, index) => {
      fields.forEach(field => {
        const value = String(item[field]).toLowerCase()
        const words = value.split(/\s+/)

        words.forEach(word => {
          if (!this.index.has(word)) {
            this.index.set(word, new Set())
          }
          this.index.get(word)!.add(index)
        })
      })
    })
  }

  search(query: string): T[] {
    const words = query.toLowerCase().split(/\s+/)
    let result: Set<number> | null = null

    words.forEach(word => {
      const indices = this.index.get(word) || new Set()
      if (result === null) {
        result = new Set(indices)
      } else {
        result = new Set([...result].filter(i => indices.has(i)))
      }
    })

    return result ? [...result].map(i => this.data[i]) : []
  }
}

export default {
  fullTextSearch,
  exactSearch,
  rangeFilter,
  dateRangeFilter,
  multiFilter,
  fuzzySearch,
  sortData,
  groupBy,
  uniqueBy,
  SearchIndex,
}
