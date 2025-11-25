import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Progress, List, Avatar, Badge, Space, Button } from 'antd'
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import * as echarts from 'echarts'
import { adminDashboardApi } from '@/api'
import { FunnelChart, RankingChart, DistributionChart, ComparisonChart } from '@/components/Charts'
import './Dashboard.css'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // 尝试调用真实API，失败时使用模拟数据
        try {
          const [usersStats, ordersStats] = await Promise.all([
            adminDashboardApi.getUsersStatistics?.() || Promise.resolve({}),
            adminDashboardApi.getOrdersStatistics?.() || Promise.resolve({}),
          ])
          
          setStats({
            totalUsers: usersStats.total || 2456,
            totalOrders: ordersStats.total || 1320,
            totalSales: ordersStats.totalAmount || 156800,
            activeShops: usersStats.activeShops || 523,
          })
        } catch (apiError) {
          console.warn('API调用失败，使用模拟数据:', apiError)
          // 使用模拟数据
          setStats({
            totalUsers: 2456,
            totalOrders: 1320,
            totalSales: 156800,
            activeShops: 523,
          })
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // 初始化用户增长趋势图表
  useEffect(() => {
    const userChartElement = document.getElementById('userGrowthChart')
    if (userChartElement && !loading) {
      const userChart = echarts.init(userChartElement)
      const userOption = {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['新增用户', '活跃用户'],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '新增用户',
            data: [120, 140, 180, 165, 200, 240, 210, 250, 290, 310, 340, 380],
            type: 'line',
            smooth: true,
            itemStyle: {
              color: '#667eea',
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                { offset: 1, color: 'rgba(102, 126, 234, 0.1)' },
              ]),
            },
          },
          {
            name: '活跃用户',
            data: [80, 100, 140, 130, 160, 200, 170, 210, 250, 280, 310, 350],
            type: 'line',
            smooth: true,
            itemStyle: {
              color: '#764ba2',
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(118, 75, 162, 0.3)' },
                { offset: 1, color: 'rgba(118, 75, 162, 0.1)' },
              ]),
            },
          },
        ],
      }
      userChart.setOption(userOption)
      window.addEventListener('resize', () => userChart.resize())
      return () => {
        userChart.dispose()
        window.removeEventListener('resize', () => userChart.resize())
      }
    }
  }, [loading])

  // 初始化销售数据速度表
  useEffect(() => {
    const salesChartElement = document.getElementById('salesChart')
    if (salesChartElement && !loading) {
      const salesChart = echarts.init(salesChartElement)
      const salesOption = {
        tooltip: {
          trigger: 'axis',
          formatter: function (params: any) {
            let result = params[0].axisValue + '<br/>'
            params.forEach((param: any) => {
              result += param.marker + param.seriesName + ': ¥' + param.value + '<br/>'
            })
            return result
          },
        },
        legend: {
          data: ['销售额', '订单数'],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
        },
        yAxis: [
          {
            type: 'value',
            name: '销售额',
          },
          {
            type: 'value',
            name: '订单数',
          },
        ],
        series: [
          {
            name: '销售额',
            data: [28000, 32000, 45000, 38000, 52000, 61000, 48000],
            type: 'bar',
            itemStyle: {
              color: '#28c76f',
            },
          },
          {
            name: '订单数',
            data: [120, 145, 210, 180, 250, 310, 220],
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            itemStyle: {
              color: '#ff7a45',
            },
          },
        ],
      }
      salesChart.setOption(salesOption)
      window.addEventListener('resize', () => salesChart.resize())
      return () => {
        salesChart.dispose()
        window.removeEventListener('resize', () => salesChart.resize())
      }
    }
  }, [loading])

  const statCards = [
    {
      title: '总用户数',
      value: stats?.totalUsers || 0,
      icon: <UserOutlined />,
      color: '#667eea',
      change: '+12.5%',
    },
    {
      title: '订单总数',
      value: stats?.totalOrders || 0,
      icon: <ShoppingCartOutlined />,
      color: '#ff7a45',
      change: '+8.3%',
    },
    {
      title: '销售总额',
      value: `¥${(stats?.totalSales || 0).toLocaleString()}`,
      icon: <DollarOutlined />,
      color: '#28c76f',
      change: '+23.5%',
    },
    {
      title: '活跃商户',
      value: stats?.activeShops || 0,
      icon: <TeamOutlined />,
      color: '#f4b500',
      change: '+5.2%',
    },
  ]

  const recentOrders = [
    { id: 'ORDER-001', customer: '张三', amount: 2500, status: '已完成', time: '2分钟前' },
    { id: 'ORDER-002', customer: '李四', amount: 1800, status: '处理中', time: '15分钟前' },
    { id: 'ORDER-003', customer: '王五', amount: 3200, status: '待发货', time: '1小时前' },
    { id: 'ORDER-004', customer: '赵六', amount: 950, status: '已完成', time: '2小时前' },
    { id: 'ORDER-005', customer: '孙七', amount: 4100, status: '已完成', time: '3小时前' },
  ]

  const topProducts = [
    { name: '爆款商品A', sales: 1250, revenue: 62500 },
    { name: '爆款商品B', sales: 980, revenue: 49000 },
    { name: '爆款商品C', sales: 756, revenue: 45360 },
    { name: '爆款商品D', sales: 543, revenue: 27150 },
    { name: '爆款商品E', sales: 421, revenue: 21050 },
  ]

  return (
    <div className="dashboard fade-in-down">
      <h1 style={{ marginBottom: 24 }}>仪表板</h1>

      {/* 核心指标卡 */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        {statCards.map((card, index) => (
          <Col key={index} xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <div className="stat-content">
                <div className="stat-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                  {card.icon}
                </div>
                <div className="stat-info">
                  <div className="stat-title">{card.title}</div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-change" style={{ color: card.color }}>
                    <ArrowUpOutlined /> {card.change}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区域 */}
      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="用户增长趋势" className="card-with-shadow">
            <div id="userGrowthChart" style={{ height: 300 }}></div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="销售数据" className="card-with-shadow">
            <div id="salesChart" style={{ height: 300 }}></div>
          </Card>
        </Col>
      </Row>

      {/* 最近订单和销售排行 */}
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="最近订单" className="card-with-shadow" extra={<Button type="link">查看全部</Button>}>
            <List
              dataSource={recentOrders}
              renderItem={(order) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#667eea' }}>{order.customer[0]}</Avatar>}
                    title={
                      <Space>
                        <span className="order-id">{order.id}</span>
                        <Badge status="success" text={order.status} />
                      </Space>
                    }
                    description={`${order.customer} • ${order.time}`}
                  />
                  <div style={{ fontWeight: 'bold', color: '#28c76f' }}>¥{order.amount}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="销售排行" className="card-with-shadow" extra={<Button type="link">查看更多</Button>}>
            <div className="top-products">
              {topProducts.map((product, index) => (
                <div key={index} className="product-item">
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <span className="rank" style={{ marginRight: 12, fontWeight: 'bold', fontSize: 16 }}>
                      {index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{product.name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>销量: {product.sales} 件</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: '#28c76f' }}>¥{product.revenue}</div>
                      <Progress percent={(index + 1) * 20} size="small" status="active" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 高级图表统计 */}
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <FunnelChart
            data={[
              { name: '访问量', value: 50000 },
              { name: '加车', value: 15000 },
              { name: '下单', value: 8000 },
              { name: '支付', value: 6500 },
            ]}
            title="用户转化漏斗"
          />
        </Col>
        <Col xs={24} lg={12}>
          <RankingChart
            data={[
              { name: '张三（五星店长）', value: 1200000, icon: '👑' },
              { name: '李四（三星店长）', value: 720000, icon: '⭐⭐⭐' },
              { name: '赵六（一星店长）', value: 120000, icon: '⭐' },
            ]}
            title="转路超级明星"
          />
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <DistributionChart
            data={[
              { name: '普通会员', value: 1200, color: '#bfbfbf' },
              { name: 'VIP会员', value: 800, color: '#f5222d' },
              { name: '店长', value: 450, color: '#faad14' },
              { name: '董事', value: 6, color: '#ff7a45' },
            ]}
            title="用户等级分布"
          />
        </Col>
        <Col xs={24} lg={12}>
          <ComparisonChart
            data={[
              { name: '零售订单', value1: 320, value2: 280 },
              { name: '采购订单', value1: 180, value2: 220 },
              { name: '分配订单', value1: 150, value2: 190 },
            ]}
            title="订单类型对比（上周 vs 本周）"
            colors={['#667eea', '#764ba2']}
          />
        </Col>
      </Row>

      {/* 佣金统计 */}
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="佣金统计" className="card-with-shadow">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="本月佣金总额"
                  value={45680}
                  prefix="¥"
                  valueStyle={{ color: '#28c76f' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="待结算佣金"
                  value={12350}
                  prefix="¥"
                  valueStyle={{ color: '#ff7a45' }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>一级佣金</span>
                  <span>30%</span>
                </div>
                <Progress percent={30} status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>二级佣金</span>
                  <span>45%</span>
                </div>
                <Progress percent={45} status="active" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
