import React from 'react'
import { Card, Row, Col, Tag, Table, Tabs, Button, Tooltip, Progress, Space, Empty, Divider } from 'antd'
import { ArrowRightOutlined, CheckOutlined, LockOutlined } from '@ant-design/icons'
import BackButton from '@/components/BackButton'
import { USER_LEVELS, getAllLevels, UserLevel } from '@/constants/userLevels'
import './UserLevelSystem.css'

export default function UserLevelSystem() {
  const levels = getAllLevels()

  const columns = [
    {
      title: '等级',
      key: 'level',
      width: 150,
      render: (_: any, record: UserLevel) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>{record.icon}</span>
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>折扣: {record.discount}</div>
          </div>
        </div>
      ),
    },
    {
      title: '升级要求',
      dataIndex: 'upgradeRequires',
      key: 'upgradeRequires',
      width: 300,
      render: (text: string) => (
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          {text}
        </div>
      ),
    },
    {
      title: '每月权益',
      key: 'monthly',
      width: 200,
      render: (_: any, record: UserLevel) => (
        <div style={{ fontSize: 13 }}>
          <div>✨ 赠送 {record.monthlyReward} 通券</div>
          {record.monthlyBonus && (
            <div style={{ color: '#faad14' }}>💰 奖励 ¥{record.monthlyBonus}</div>
          )}
        </div>
      ),
    },
    {
      title: '主要权益',
      key: 'benefits',
      render: (_: any, record: UserLevel) => (
        <div>
          {record.benefits.slice(0, 3).map((benefit, idx) => (
            <div key={idx} style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              <CheckOutlined style={{ color: '#52c41a', marginRight: 4 }} />
              {benefit}
            </div>
          ))}
          {record.benefits.length > 3 && (
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              + 更多权益
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="user-level-system fade-in-down">
      {/* 页面头部 */}
      <div className="page-header">
        <BackButton fallback="/users" />
        <h1 className="page-title">用户等级体系</h1>
      </div>

      {/* 等级体系概览 */}
      <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 16 }}>等级体系说明</h2>
        <p style={{ color: '#666', lineHeight: 1.8, marginBottom: 16 }}>
          中道商城采用多层级的用户体系，从普通会员到董事级别，共7个等级。用户可以通过直推人数和团队销售额来逐步升级，
          每个等级都有相应的权益和奖励。高等级用户可以享受更大的折扣、更多的通券奖励，以及更多的市场代理权。
        </p>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>等级总数</div>
              <div style={{ fontSize: 20, color: '#1890ff' }}>{levels.length}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>💎</div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>最高折扣</div>
              <div style={{ fontSize: 20, color: '#faad14 ' }}>2.2折</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🎁</div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>最高月奖</div>
              <div style={{ fontSize: 20, color: '#52c41a' }}>¥132万</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🌍</div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>最高权力</div>
              <div style={{ fontSize: 20, color: '#ff7a45' }}>全国代理</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 等级升级路径 */}
      <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 16 }}>等级升级路径</h2>
        <div style={{ display: 'flex', overflowX: 'auto', gap: 8, paddingBottom: 16 }}>
          {levels.map((level, idx) => (
            <React.Fragment key={level.key}>
              <Tooltip title={level.description}>
                <div 
                  style={{
                    padding: '12px 16px',
                    backgroundColor: level.color,
                    color: '#fff',
                    borderRadius: 8,
                    minWidth: 80,
                    textAlign: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{level.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 'bold' }}>{level.name}</div>
                  <div style={{ fontSize: 10, opacity: 0.9 }}>{level.discount}</div>
                </div>
              </Tooltip>
              {idx < levels.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', margin: '0 8px' }}>
                  <ArrowRightOutlined style={{ fontSize: 20, color: '#ccc' }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* 等级对比表 */}
      <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 16 }}>等级对比详情</h2>
        <Table
          columns={columns}
          dataSource={levels}
          rowKey="key"
          pagination={false}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* 等级详情 */}
      <Card className="card-with-shadow">
        <h2 style={{ marginBottom: 16 }}>各等级详细权益</h2>
        <Tabs
          items={levels.map(level => ({
            key: level.key,
            label: (
              <span>
                <span style={{ fontSize: 16, marginRight: 4 }}>{level.icon}</span>
                {level.name}
              </span>
            ),
            children: (
              <div style={{ padding: '16px 0' }}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <h4 style={{ marginBottom: 12 }}>📊 等级信息</h4>
                      <div style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 8 }}>
                        <div style={{ marginBottom: 12 }}>
                          <span style={{ color: '#999' }}>等级名称：</span>
                          <strong>{level.name}</strong>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <span style={{ color: '#999' }}>商品折扣：</span>
                          <strong style={{ color: '#faad14', fontSize: 16 }}>{level.discount}</strong>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <span style={{ color: '#999' }}>月度通券：</span>
                          <strong style={{ color: '#52c41a' }}>+{level.monthlyReward}</strong>
                        </div>
                        {level.monthlyBonus && (
                          <div style={{ marginBottom: 12 }}>
                            <span style={{ color: '#999' }}>月度奖励：</span>
                            <strong style={{ color: '#faad14' }}>+¥{level.monthlyBonus}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <h4 style={{ marginBottom: 12 }}>🎯 升级要求</h4>
                      <div style={{ backgroundColor: '#f0f2f5', padding: 16, borderRadius: 8 }}>
                        <div style={{ fontSize: 13, lineHeight: 1.8, color: '#333' }}>
                          {level.upgradeRequires}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Divider />

                <h4 style={{ marginBottom: 12 }}>✨ 主要权益</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                  {level.benefits.map((benefit, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: 12,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <CheckOutlined style={{ color: level.color, fontSize: 16 }} />
                      <span style={{ fontSize: 13 }}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          }))}
        />
      </Card>

      {/* 升级建议 */}
      <Card className="card-with-shadow" style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 16 }}>💡 升级建议</h2>
        <div style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', padding: 16, borderRadius: 8 }}>
          <p style={{ margin: 0, color: '#0050b3' }}>
            用户升级需要满足两个条件：<strong>直推人数要求</strong> 和 <strong>团队销售额要求</strong>。
            系统会每月自动检查用户的升级条件，当条件满足时自动进行升级。
          </p>
          <p style={{ margin: '12px 0 0 0', color: '#0050b3' }}>
            💬 每次升级不仅能获得更好的折扣和权益，还能获得一次性的升级奖励和持续的月度奖励。
          </p>
        </div>
      </Card>
    </div>
  )
}
