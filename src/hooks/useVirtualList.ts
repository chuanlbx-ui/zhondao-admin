import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * 虚拟列表 Hook - 用于处理大型列表性能优化
 */
export function useVirtualList<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  buffer: number = 5
) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
    const end = Math.min(items.length, start + visibleCount + buffer * 2)

    setVisibleRange({ start, end })
  }, [items.length, containerHeight, itemHeight, buffer])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const visibleItems = items.slice(visibleRange.start, visibleRange.end)
  const offsetY = visibleRange.start * itemHeight
  const totalHeight = items.length * itemHeight

  return {
    containerRef,
    visibleItems,
    visibleRange,
    offsetY,
    totalHeight,
  }
}

/**
 * 防抖钩子 - 用于输入框等频繁变化的场景
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * 节流钩子 - 用于滚动、窗口大小等频繁事件
 */
export function useThrottle<T>(value: T, delay: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastUpdated = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    if (now >= lastUpdated.current + delay) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const handler = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, delay - (now - lastUpdated.current))

      return () => clearTimeout(handler)
    }
  }, [value, delay])

  return throttledValue
}

/**
 * 异步数据加载钩子 - 支持防抖和缓存
 */
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    setData(null)
    setError(null)
    try {
      const response = await asyncFunction()
      setData(response)
      setStatus('success')
      return response
    } catch (error) {
      setError(error as E)
      setStatus('error')
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, status, data, error }
}

/**
 * 路由懒加载钩子
 */
export function useLazyComponent(importFunc: () => Promise<any>) {
  const [component, setComponent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    importFunc()
      .then((module) => {
        setComponent(module.default)
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })
  }, [importFunc])

  return { component, loading, error }
}

/**
 * 页面可见性钩子 - 监听页面切换
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return isVisible
}

/**
 * 窗口大小钩子 - 监听窗口尺寸变化
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

/**
 * 本地存储钩子
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch {
      console.error(`Failed to set localStorage key "${key}"`)
    }
  }

  return [storedValue, setValue] as const
}

export default {
  useVirtualList,
  useDebounce,
  useThrottle,
  useAsync,
  useLazyComponent,
  usePageVisibility,
  useWindowSize,
  useLocalStorage,
}
