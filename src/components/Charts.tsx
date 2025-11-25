/**
 * 高级图表组件集合
 */

import React from 'react'
import { Row, Col, Card, Statistic, Progress, Tag, Space, Empty } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

/**
 * 营销漏斗 - 显示多个阶段的转化率
 */
export function FunnelChart({
  data,
  title,
}: {
  data: { name: string; value: number; percentage?: number }[]
  title?: string
}) {
  const total = data[0]?.value || 0

  return (
    <Card title={title || '转化漏斗'} className="card-with-shadow">
      <div style={{ padding: '20px 0' }}>
        {data.map((item, index) => {
          const percentage = total ? ((item.value / total) * 100).toFixed(1) : 0
          const width = (index === 0 ? 100 : (item.value / total) * 100) + '%'

          return (
            <div key={item.name} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{item.name}</span>
                <span style={{ color: '#666' }}>
                  {item.value} ({percentage}%)
                </span>
              </div>
              <div
                style={{
                  width: `${width}`,
                  height: 32,
                  background: 'linear-gradient(90deg, #1890ff, #52c41a)',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 12,
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                {width !== '0%' && `${percentage}%`}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/**
 * 对比图 - 显示两个指标的对比
 */
export function ComparisonChart({
  data,
  title,
  colors = ['#1890ff', '#52c41a'],
}: {
  data: { name: string; value1: number; value2: number }[]
  title?: string
  colors?: [string, string]
}) {
  const maxValue = Math.max(...data.map(d => Math.max(d.value1, d.value2)))

  return (
    <Card title={title || '数据对比'} className="card-with-shadow">
      <div style={{ padding: '20px 0' }}>
        {data.map((item) => {
          const width1 = ((item.value1 / maxValue) * 100).toFixed(1)
          const width2 = ((item.value2 / maxValue) * 100).toFixed(1)

          return (
            <div key={item.name} style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 8, fontWeight: 'bold' }}>{item.name}</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>指标1</div>
                  <div
                    style={{
                      width: `${width1}%`,
                      height: 24,
                      background: colors[0],
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 8,
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    {item.value1}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>指标2</div>
                  <div
                    style={{
                      width: `${width2}%`,
                      height: 24,
                      background: colors[1],
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 8,
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    {item.value2}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/**
 * 趋势卡片 - 显示指标和趋势
 */
export function TrendCard({
  title,
  value,
  unit = '',
  trend,
  color = '#1890ff',
}: {
  title: string
  value: number | string
  unit?: string
  trend?: { value: number; isUp: boolean }
  color?: string
}) {
  return (
    <Card className="card-with-shadow">
      <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 'bold', color }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span style={{ fontSize: 14, color: '#999' }}>{unit}</span>}
      </div>
      {trend && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          {trend.isUp ? (
            <ArrowUpOutlined style={{ color: '#52c41a' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#f5222d' }} />
          )}
          <span
            style={{
              fontSize: 12,
              color: trend.isUp ? '#52c41a' : '#f5222d',
              fontWeight: 'bold',
            }}
          >
            {trend.isUp ? '+' : ''}{trend.value}%
          </span>
        </div>
      )}
    </Card>
  )
}

/**
 * 排行榜 - 显示排名
 */
export function RankingChart({
  data,
  title,
  colors = ['#ffd666', '#adc6ff', '#b3e5fc'],
}: {
  data: { name: string; value: number; icon?: string }[]
  title?: string
  colors?: string[]
}) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <Card title={title || '排行榜'} className="card-with-shadow">
      <div style={{ padding: '20px 0' }}>
        {data.map((item, index) => {
          const medalColor = index === 0 ? '#ffd666' : index === 1 ? '#adc6ff' : '#b3e5fc'
          const medalSymbol = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`

          return (
            <div key={item.name} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: medalColor,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 14,
                }}
              >
                {medalSymbol}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 'bold' }}>
                    {item.icon} {item.name}
                  </span>
                  <span style={{ color: '#666' }}>{item.value}</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 6,
                    background: '#f0f0f0',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #1890ff, #52c41a)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/**
 * 分布图 - 显示各分类的占比
 */
export function DistributionChart({
  data,
  title,
}: {
  data: { name: string; value: number; color: string }[]
  title?: string
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card title={title || '分布统计'} className="card-with-shadow">
      <div style={{ padding: '20px' }}>
        <div
          style={{
            display: 'flex',
            height: 40,
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 20,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {data.map((item) => (
            <div
              key={item.name}
              style={{
                flex: item.value,
                background: item.color,
                transition: 'flex 0.3s ease',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          {data.map((item) => {
            const percentage = ((item.value / total) * 100).toFixed(1)
            return (
              <div key={item.name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: item.color,
                      borderRadius: '50%',
                    }}
                  />
                  <span style={{ fontSize: 12 }}>{item.name}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                  {item.value}
                  <span style={{ fontSize: 12, color: '#999', marginLeft: 4 }}>
                    ({percentage}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

export default {
  FunnelChart,
  ComparisonChart,
  TrendCard,
  RankingChart,
  DistributionChart,
}
