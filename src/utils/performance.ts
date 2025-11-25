/**
 * 性能优化工具库
 */

/**
 * 防抖函数 - 延迟执行
 * @param func 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数 - 限制执行频率
 * @param func 要执行的函数
 * @param delay 时间间隔（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      func(...args)
      lastCall = now
    }
  }
}

/**
 * 计算列表虚拟滚动的偏移量和可见项
 * @param scrollTop 滚动位置
 * @param itemHeight 单项高度
 * @param containerHeight 容器高度
 * @param totalItems 总项数
 * @returns 虚拟滚动参数
 */
export function calculateVirtualScroll(
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5) // 多加载5个用于缓冲
  const endIndex = Math.min(totalItems, startIndex + visibleCount + 10)
  const offsetY = startIndex * itemHeight

  return {
    startIndex,
    endIndex,
    offsetY,
    visibleCount,
    visibleItems: totalItems > visibleCount,
  }
}

/**
 * 批量操作 - 分批处理大量数据
 * @param items 项目数组
 * @param handler 处理函数
 * @param batchSize 批量大小
 */
export async function batchProcess<T>(
  items: T[],
  handler: (item: T) => Promise<void>,
  batchSize: number = 10
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.all(batch.map(handler))
  }
}

/**
 * 延迟加载 - 使用 requestIdleCallback 或 setTimeout 延迟执行
 * @param callback 回调函数
 * @param timeout 超时时间
 */
export function lazyLoad(callback: () => void, timeout: number = 2000) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, timeout)
  }
}

/**
 * 内存缓存类 - 自动过期
 */
export class MemoryCache<T = any> {
  private cache: Map<string, { value: T; expireTime: number }> = new Map()
  private ttl: number = 5 * 60 * 1000 // 默认5分钟过期

  constructor(ttl?: number) {
    if (ttl) this.ttl = ttl
  }

  set(key: string, value: T) {
    this.cache.set(key, {
      value,
      expireTime: Date.now() + this.ttl,
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expireTime) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

/**
 * 图片懒加载
 * @param element 图片元素
 * @param callback 加载完成回调
 */
export function lazyLoadImage(element: HTMLImageElement, callback?: () => void) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.removeAttribute('data-src')
          callback?.()
        }
        observer.unobserve(entry.target)
      }
    })
    observer.observe(element)
  } else {
    // 降级方案
    if (element.dataset.src) {
      element.src = element.dataset.src
      element.removeAttribute('data-src')
      callback?.()
    }
  }
}

/**
 * 并发请求控制
 */
export class ConcurrencyController {
  private activeRequests = 0
  private queue: (() => void)[] = []

  constructor(private maxConcurrent: number = 3) {}

  async execute<T>(task: () => Promise<T>): Promise<T> {
    while (this.activeRequests >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve))
    }

    this.activeRequests++
    try {
      return await task()
    } finally {
      this.activeRequests--
      const next = this.queue.shift()
      if (next) next()
    }
  }
}

/**
 * 性能监测
 */
export class PerformanceMonitor {
  static measure(name: string, fn: () => void) {
    const start = performance.now()
    fn()
    const end = performance.now()
    console.log(`[${name}] 耗时: ${(end - start).toFixed(2)}ms`)
  }

  static async measureAsync(name: string, fn: () => Promise<void>) {
    const start = performance.now()
    await fn()
    const end = performance.now()
    console.log(`[${name}] 耗时: ${(end - start).toFixed(2)}ms`)
  }

  static reportWebVitals() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log(`[Web Vitals] ${entry.name}: ${(entry as any).value.toFixed(2)}`)
        })
      })

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    }
  }
}

export default {
  debounce,
  throttle,
  calculateVirtualScroll,
  batchProcess,
  lazyLoad,
  MemoryCache,
  lazyLoadImage,
  ConcurrencyController,
  PerformanceMonitor,
}
