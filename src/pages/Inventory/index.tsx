import React, { useState } from 'react'
import { Card, Tabs, Button, Space, Row, Col, Statistic, Input, Select } from 'antd'
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons'
import BackButton from '@/components/BackButton'

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('1')

  return (
    <div className="inventory-page fade-in-down">
      <div className="page-header">
        <BackButton fallback="/dashboard" />
        <h1 className="page-title">库存管理</h1>
      </div>

      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="云仓总库存" value={12580} valueStyle={{ color: '#667eea' }} suffix="件" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="本地仓库存" value={3240} valueStyle={{ color: '#28c76f' }} suffix="件" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="库存金额" value={2456800} prefix="¥" valueStyle={{ color: '#ff7a45' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="预警商品" value={12} valueStyle={{ color: '#f4b500' }} />
          </Card>
        </Col>
      </Row>

      <Card className="card-with-shadow">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: '云仓管理',
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={6}>
                      <Input placeholder="搜索商品..." prefix={<SearchOutlined />} allowClear />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Select placeholder="按分类筛选" style={{ width: '100%' }} options={[
                        { label: '电子产品', value: 'electronics' },
                        { label: '生活用品', value: 'lifestyle' },
                      ]} />
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button icon={<DownloadOutlined />}>导出</Button>
                      </Space>
                    </Col>
                  </Row>
                  <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                    云仓库存列表开发中...
                  </div>
                </div>
              ),
            },
            {
              key: '2',
              label: '本地仓管理',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  本地仓管理功能开发中...
                </div>
              ),
            },
            {
              key: '3',
              label: '库存调拨',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  库存调拨功能开发中...
                </div>
              ),
            },
            {
              key: '4',
              label: '库存预警',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  库存预警功能开发中...
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
