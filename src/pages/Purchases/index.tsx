import React, { useState } from 'react'
import { Card, Tabs, Button, Space, Row, Col, Statistic, Input, Select } from 'antd'
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons'
import BackButton from '@/components/BackButton'

export default function Purchases() {
  const [activeTab, setActiveTab] = useState('1')

  return (
    <div className="purchases-page fade-in-down">
      <div className="page-header">
        <BackButton fallback="/dashboard" />
        <h1 className="page-title">采购管理</h1>
      </div>

      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="今日采购" value={45} valueStyle={{ color: '#667eea' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="采购总额" value={456800} prefix="¥" valueStyle={{ color: '#28c76f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="待支付" value={8} valueStyle={{ color: '#ff7a45' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="已完成" value={1245} valueStyle={{ color: '#667eea' }} />
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
              label: '采购订单列表',
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={6}>
                      <Input placeholder="搜索用户或订单号..." prefix={<SearchOutlined />} allowClear />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Select placeholder="订单状态" style={{ width: '100%' }} options={[
                        { label: '待支付', value: 'pending' },
                        { label: '待确认', value: 'confirming' },
                        { label: '已完成', value: 'completed' },
                      ]} />
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button icon={<DownloadOutlined />}>导出</Button>
                      </Space>
                    </Col>
                  </Row>
                  <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                    采购订单列表开发中...
                  </div>
                </div>
              ),
            },
            {
              key: '2',
              label: '采购权限管理',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  采购权限管理功能开发中...
                </div>
              ),
            },
            {
              key: '3',
              label: '采购业绩统计',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  采购业绩统计功能开发中...
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
