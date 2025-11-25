/**
 * 虚拟滚动表格组件
 * 支持大数据集的高效渲染
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Table, TableColumnsType, TableProps } from 'antd'
import { calculateVirtualScroll } from '@/utils/performance'

interface VirtualTableProps<T> extends TableProps<T> {
  itemHeight?: number
  containerHeight?: number
}

export default function VirtualTable<T extends Record<string, any>>({
  columns,
  dataSource = [],
  itemHeight = 57,
  containerHeight = 600,
  ...props
}: VirtualTableProps<T>) {
  const [scrollY, setScrollY] = useState(0)

  // 计算虚拟滚动信息
  const virtualInfo = useMemo(() => {
    return calculateVirtualScroll(
      dataSource.length,
      scrollY,
      itemHeight,
      containerHeight
    )
  }, [scrollY, dataSource.length, itemHeight, containerHeight])

  // 获取要渲染的数据
  const visibleData = useMemo(() => {
    return dataSource.slice(virtualInfo.startIndex, virtualInfo.endIndex)
  }, [dataSource, virtualInfo.startIndex, virtualInfo.endIndex])

  const handleScroll = useCallback((e: any) => {
    setScrollY(e.target.scrollTop || 0)
  }, [])

  // 计算虚拟滚动的样式
  const style: React.CSSProperties = {
    height: containerHeight,
    overflow: 'auto',
    onScroll: handleScroll,
  }

  return (
    <div
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      {/* 顶部占位符 */}
      <div
        style={{
          height: virtualInfo.startIndex * itemHeight,
          pointerEvents: 'none',
        }}
      />

      {/* 实际渲染的表格 */}
      <Table<T>
        columns={columns}
        dataSource={visibleData}
        pagination={false}
        {...props}
        style={{
          ...props.style,
          margin: 0,
        }}
      />

      {/* 底部占位符 */}
      <div
        style={{
          height: (dataSource.length - virtualInfo.endIndex) * itemHeight,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

/**
 * 简化版本 - 使用Ant Design Table的虚拟滚动特性
 */
export function SimpleVirtualTable<T extends Record<string, any>>({
  columns,
  dataSource = [],
  ...props
}: VirtualTableProps<T>) {
  return (
    <Table<T>
      columns={columns}
      dataSource={dataSource}
      virtual
      scroll={{ y: 600, x: true }}
      pagination={{
        pageSize: 100,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条记录`,
      }}
      {...props}
    />
  )
}
