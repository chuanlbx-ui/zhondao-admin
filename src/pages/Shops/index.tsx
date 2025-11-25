import React, { useState } from 'react'
import { Card, Tabs, Button, Space, Tag, Select, Input, Row, Col, Statistic } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import BackButton from '@/components/BackButton'

export default function Shops() {
  const [activeTab, setActiveTab] = useState('1')
  const [searchText, setSearchText] = useState('')

  return (
    <div className="shops-page fade-in-down">
      {/* 页面头部 */}
      <div className="page-header">
        <BackButton fallback="/dashboard" />
        <h1 className="page-title">店铺管理</h1>
      </div>

      {/* 统计卡片 */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="云店总数" value={245} valueStyle={{ color: '#667eea' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="五通店数" value={32} valueStyle={{ color: '#ff7a45' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="待审核" value={5} valueStyle={{ color: '#f4b500' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="本月营收" value={156800} prefix="¥" valueStyle={{ color: '#28c76f' }} />
          </Card>
        </Col>
      </Row>

      {/* 功能选项卡 */}
      <Card className="card-with-shadow">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: '云店列表',
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={6}>
                      <Input
                        placeholder="搜索店铺名称..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                      />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Select
                        placeholder="筛选店铺等级"
                        style={{ width: '100%' }}
                        options={[
                          { label: '一星', value: 1 },
                          { label: '二星', value: 2 },
                          { label: '三星', value: 3 },
                          { label: '四星', value: 4 },
                          { label: '五星', value: 5 },
                          { label: '董事', value: 6 },
                        ]}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button type="primary" icon={<PlusOutlined />}>
                          新增店铺
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                  <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                    云店列表功能开发中...
                  </div>
                </div>
              ),
            },
            {
              key: '2',
              label: '五通店列表',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  五通店列表功能开发中...
                </div>
              ),
            },
            {
              key: '3',
              label: '店铺申请审批',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  店铺申请审批功能开发中...
                </div>
              ),
            },
            {
              key: '4',
              label: '等级权益配置',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  等级权益配置功能开发中...
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
