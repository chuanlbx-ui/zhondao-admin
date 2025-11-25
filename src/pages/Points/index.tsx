import React, { useState } from 'react'
import { Card, Tabs, Button, Space, Row, Col, Statistic, Input, Select } from 'antd'
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons'
import BackButton from '@/components/BackButton'

export default function Points() {
  const [activeTab, setActiveTab] = useState('1')

  return (
    <div className="points-page fade-in-down">
      <div className="page-header">
        <BackButton fallback="/dashboard" />
        <h1 className="page-title">通券管理</h1>
      </div>

      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="总余额" value={5680000} prefix="¥" valueStyle={{ color: '#667eea' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="今日流转" value={456800} prefix="¥" valueStyle={{ color: '#28c76f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="待审核提现" value={5} valueStyle={{ color: '#ff7a45' }} suffix="件" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="本月佣金" value={356800} prefix="¥" valueStyle={{ color: '#f4b500' }} />
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
              label: '通券账户',
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                      <Input placeholder="搜索用户ID或手机号..." prefix={<SearchOutlined />} allowClear />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Select placeholder="用户等级" style={{ width: '100%' }} options={[
                        { label: '一星店长', value: 1 },
                        { label: '二星店长', value: 2 },
                        { label: '三星店长', value: 3 },
                      ]} />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button icon={<DownloadOutlined />}>导出</Button>
                      </Space>
                    </Col>
                  </Row>
                  <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                    通券账户列表开发中...
                  </div>
                </div>
              ),
            },
            {
              key: '2',
              label: '流水记录',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  通券流水记录开发中...
                </div>
              ),
            },
            {
              key: '3',
              label: '充值申请',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  充值申请管理开发中...
                </div>
              ),
            },
            {
              key: '4',
              label: '提现申请',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  提现申请审批开发中...
                </div>
              ),
            },
            {
              key: '5',
              label: '佣金分配',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  佣金分配管理开发中...
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
