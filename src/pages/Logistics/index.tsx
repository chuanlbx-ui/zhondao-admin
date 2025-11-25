import React, { useState } from 'react'
import { Card, Tabs, Button, Space, Row, Col, Statistic, Input, Select } from 'antd'
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons'
import BackButton from '@/components/BackButton'

export default function Logistics() {
  const [activeTab, setActiveTab] = useState('1')

  return (
    <div className="logistics-page fade-in-down">
      <div className="page-header">
        <BackButton fallback="/dashboard" />
        <h1 className="page-title">物流管理</h1>
      </div>

      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="今日发货" value={128} valueStyle={{ color: '#667eea' }} suffix="件" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="在途订单" value={564} valueStyle={{ color: '#28c76f' }} suffix="件" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="物流成本" value={45680} prefix="¥" valueStyle={{ color: '#ff7a45' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card-with-shadow">
            <Statistic title="异常件数" value={8} valueStyle={{ color: '#f4b500' }} />
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
              label: '物流订单',
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={6}>
                      <Input placeholder="搜索订单号或物流单号..." prefix={<SearchOutlined />} allowClear />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Select placeholder="物流状态" style={{ width: '100%' }} options={[
                        { label: '待发货', value: 'pending' },
                        { label: '已发货', value: 'shipped' },
                        { label: '配送中', value: 'delivering' },
                        { label: '已送达', value: 'delivered' },
                      ]} />
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button icon={<DownloadOutlined />}>导出</Button>
                      </Space>
                    </Col>
                  </Row>
                  <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                    物流订单列表开发中...
                  </div>
                </div>
              ),
            },
            {
              key: '2',
              label: '发货管理',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  发货管理功能开发中...
                </div>
              ),
            },
            {
              key: '3',
              label: '物流商管理',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  物流商管理功能开发中...
                </div>
              ),
            },
            {
              key: '4',
              label: '物流统计',
              children: (
                <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  物流数据统计开发中...
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
