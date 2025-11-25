import React, { useState } from 'react'
import { Card, Form, Input, Button, Row, Col, message, Avatar, Divider, Space, Tabs, Modal, Upload } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store'
import BackButton from '@/components/BackButton'
import './Profile.css'

export default function Profile() {
  const { user, logout } = useAuthStore()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [passwordForm] = Form.useForm()

  const handleSaveProfile = async (values: any) => {
    setLoading(true)
    try {
      // 模拟保存
      message.success('个人信息更新成功')
      setEditMode(false)
    } catch (error) {
      message.error('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    try {
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (error) {
      message.error('密码修改失败')
    }
  }

  const handleLogout = () => {
    Modal.confirm({
      title: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        logout()
        window.location.href = '/login'
      },
    })
  }

  return (
    <div className="profile-page fade-in-down">
      {/* 页面头部 */}
      <div className="page-header">
        <BackButton fallback="/dashboard" />
        <h1 className="page-title">个人中心</h1>
      </div>

      {/* 用户基本信息卡 */}
      <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Avatar size={120} icon={<UserOutlined />} style={{ backgroundColor: '#667eea', marginBottom: 16 }} />
            <p style={{ fontWeight: 500 }}>{user?.username || '用户'}</p>
            <p style={{ color: '#999', fontSize: 12 }}>账号ID: {user?.id || '-'}</p>
          </Col>
          <Col xs={24} sm={18}>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <div>
                  <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>用户名</label>
                  <p>{user?.username}</p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>邮箱</label>
                  <p>{user?.email || '未设置'}</p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>角色</label>
                  <p>{user?.role === 'ADMIN' ? '管理员' : '用户'}</p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>加入时间</label>
                  <p>2024-01-01</p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* 选项卡 */}
      <Card className="card-with-shadow">
        <Tabs
          items={[
            {
              key: '1',
              label: '编辑个人信息',
              children: (
                <div>
                  {!editMode ? (
                    <div>
                      <Row gutter={[16, 16]}>
                        <Col xs={24}>
                          <div>
                            <label style={{ fontWeight: 500, display: 'block', marginBottom: 8 }}>用户名</label>
                            <p style={{ color: '#666' }}>{user?.username}</p>
                          </div>
                        </Col>
                        <Col xs={24}>
                          <div>
                            <label style={{ fontWeight: 500, display: 'block', marginBottom: 8 }}>邮箱</label>
                            <p style={{ color: '#666' }}>{user?.email || '未设置'}</p>
                          </div>
                        </Col>
                        <Col xs={24}>
                          <div>
                            <label style={{ fontWeight: 500, display: 'block', marginBottom: 8 }}>联系方式</label>
                            <p style={{ color: '#666' }}>13800138000</p>
                          </div>
                        </Col>
                      </Row>
                      <Divider />
                      <Button type="primary" onClick={() => setEditMode(true)}>
                        编辑信息
                      </Button>
                    </div>
                  ) : (
                    <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
                      <Form.Item
                        name="username"
                        label="用户名"
                        initialValue={user?.username}
                        rules={[{ required: true, message: '请输入用户名' }]}
                      >
                        <Input prefix={<UserOutlined />} />
                      </Form.Item>
                      <Form.Item
                        name="email"
                        label="邮箱"
                        initialValue={user?.email}
                        rules={[
                          { required: true, message: '请输入邮箱' },
                          { type: 'email', message: '邮箱格式不正确' },
                        ]}
                      >
                        <Input prefix={<MailOutlined />} />
                      </Form.Item>
                      <Form.Item name="phone" label="联系方式" initialValue="13800138000">
                        <Input />
                      </Form.Item>
                      <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                          保存修改
                        </Button>
                        <Button onClick={() => setEditMode(false)}>取消</Button>
                      </Space>
                    </Form>
                  )}
                </div>
              ),
            },
            {
              key: '2',
              label: '修改密码',
              children: (
                <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
                  <Form.Item
                    name="oldPassword"
                    label="当前密码"
                    rules={[{ required: true, message: '请输入当前密码' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="输入当前密码" />
                  </Form.Item>
                  <Form.Item
                    name="newPassword"
                    label="新密码"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 6, message: '密码长度至少6位' },
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="输入新密码" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label="确认密码"
                    rules={[{ required: true, message: '请确认新密码' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="再次输入新密码" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    修改密码
                  </Button>
                </Form>
              ),
            },
            {
              key: '3',
              label: '账号安全',
              children: (
                <div>
                  <Row gutter={[16, 24]}>
                    <Col xs={24}>
                      <div style={{ border: '1px solid #f0f0f0', padding: 16, borderRadius: 4 }}>
                        <Row justify="space-between" align="middle">
                          <Col>
                            <div>
                              <p style={{ fontWeight: 500, marginBottom: 4 }}>登录密码</p>
                              <p style={{ color: '#999', fontSize: 12 }}>最后修改于2024-01-15</p>
                            </div>
                          </Col>
                          <Col>
                            <Button type="primary" size="small">
                              修改密码
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                    <Col xs={24}>
                      <div style={{ border: '1px solid #f0f0f0', padding: 16, borderRadius: 4 }}>
                        <Row justify="space-between" align="middle">
                          <Col>
                            <div>
                              <p style={{ fontWeight: 500, marginBottom: 4 }}>登录日志</p>
                              <p style={{ color: '#999', fontSize: 12 }}>查看最近的登录记录</p>
                            </div>
                          </Col>
                          <Col>
                            <Button type="primary" size="small">
                              查看
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* 登出按钮 */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button danger size="large" onClick={handleLogout}>
          退出登录
        </Button>
      </div>
    </div>
  )
}
