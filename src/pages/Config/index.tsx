import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Modal, Form, Input, InputNumber, message, Space, Tag, Select, Row, Col, Tabs, Tree, Checkbox, Badge, Timeline, Empty } from 'antd'
import { EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined, DownloadOutlined, UserAddOutlined, PlusOutlined, LockOutlined } from '@ant-design/icons'
import { adminConfigApi, adminPermissionApi } from '@/api'
import BackButton from '@/components/BackButton'

export default function Config() {
  // 系统配置状态
  const [loading, setLoading] = useState(false)
  const [configs, setConfigs] = useState<any[]>([])
  const [filteredConfigs, setFilteredConfigs] = useState<any[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<any>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')

  // 管理员管理状态
  const [admins, setAdmins] = useState<any[]>([])
  const [adminModalVisible, setAdminModalVisible] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminForm] = Form.useForm()
  const [adminSearchText, setAdminSearchText] = useState('')

  // 角色权限管理状态
  const [roles, setRoles] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [roleForm] = Form.useForm()
  const [roleLoading, setRoleLoading] = useState(false)
  const [menuPermissions, setMenuPermissions] = useState<any[]>([])
  const [checkedKeys, setCheckedKeys] = useState<string[]>([])

  // 操作日志状态
  const [logs, setLogs] = useState<any[]>([])
  const [logLoading, setLogLoading] = useState(false)
  const [logPagination, setLogPagination] = useState({ current: 1, pageSize: 20, total: 0 })

  const fetchConfigs = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      // 本地模拟数据
      const mockConfigs = [
        { key: 'SITE_NAME', value: '中道商城', type: 'STRING', description: '网站名称' },
        { key: 'MAX_UPLOAD_SIZE', value: '10485760', type: 'NUMBER', description: '最大上传文件大小' },
        { key: 'ENABLE_REGISTER', value: 'true', type: 'BOOLEAN', description: '是否开放注册' },
        { key: 'COMMISSION_LEVEL_ONE', value: '0.1', type: 'NUMBER', description: '一级佐金比例' },
        { key: 'COMMISSION_LEVEL_TWO', value: '0.05', type: 'NUMBER', description: '二级佐金比例' },
      ]
      setConfigs(mockConfigs)
      applyFilters(mockConfigs, searchText)
      setPagination({ current: page, pageSize, total: mockConfigs.length })
    } catch (error) {
      message.error('加载配置列表失败')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (data: any[], search: string) => {
    let filtered = data
    if (search) {
      filtered = filtered.filter(c => 
        c.key.includes(search) || 
        c.description.includes(search)
      )
    }
    setFilteredConfigs(filtered)
    setPagination(prev => ({ ...prev, total: filtered.length }))
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    applyFilters(configs, value)
  }

  const handleExport = () => {
    try {
      const csvData = [
        ['配置名', '配置值', '数据类型', '描述'],
        ...filteredConfigs.map(c => [c.key, c.value, c.type, c.description])
      ]
      const csvString = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `配置列表_${new Date().getTime()}.csv`
      link.click()
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  useEffect(() => {
    fetchConfigs()
    fetchAdmins()
    fetchRoles()
    fetchLogs()
  }, [])

  const columns = [
    { title: '配置名', dataIndex: 'key', key: 'key', width: 150, sorter: (a: any, b: any) => a.key.localeCompare(b.key) },
    { title: '配置值', dataIndex: 'value', key: 'value' },
    { title: '数据类型', dataIndex: 'type', key: 'type', render: (type: string) => <Tag>{type}</Tag>, width: 100 },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => editConfig(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteConfig(record.key)} />
        </Space>
      ),
    },
  ]

  const editConfig = (config: any) => {
    form.setFieldsValue(config)
    setSelectedConfig(config)
    setModalVisible(true)
  }

  const deleteConfig = (key: string) => {
    Modal.confirm({
      title: '确定删除该配置吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 本地模拟删除
          message.success('删除成功')
          fetchConfigs()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const onFinish = async (values: any) => {
    try {
      if (selectedConfig) {
        // 本地模拟更新
        message.success('更新成功')
      }
      setModalVisible(false)
      fetchConfigs()
    } catch (error) {
      message.error('操作失败')
    }
  }

  // ==================== 管理员管理函数 ====================
  const fetchAdmins = async (search = '') => {
    setAdminLoading(true)
    try {
      // 本地模拟数据
      const mockAdmins = [
        { id: '1', username: 'admin', name: '超级管理员', role: 'super_admin', email: 'admin@example.com', status: 'active', createdAt: '2024-01-01', lastLogin: '2024-11-20 10:30' },
        { id: '2', username: 'user_manager', name: '用户管理员', role: 'user_manager', email: 'usermgr@example.com', status: 'active', createdAt: '2024-02-01', lastLogin: '2024-11-19 15:45' },
        { id: '3', username: 'shop_manager', name: '店铺管理员', role: 'shop_manager', email: 'shopmgr@example.com', status: 'active', createdAt: '2024-03-01', lastLogin: '2024-11-18 09:20' },
      ]
      const filtered = search ? mockAdmins.filter(a => a.name.includes(search) || a.username.includes(search)) : mockAdmins
      setAdmins(filtered)
    } catch (error) {
      message.error('加载管理员列表失败')
    } finally {
      setAdminLoading(false)
    }
  }

  const editAdmin = (admin: any) => {
    adminForm.setFieldsValue(admin)
    setSelectedAdmin(admin)
    setAdminModalVisible(true)
  }

  const deleteAdmin = (id: string) => {
    Modal.confirm({
      title: '确定删除该管理员吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          message.success('删除成功')
          fetchAdmins()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const onAdminFinish = async (values: any) => {
    try {
      if (selectedAdmin) {
        // 更新管理员
        message.success('更新成功')
      } else {
        // 创建管理员
        message.success('创建成功')
      }
      setAdminModalVisible(false)
      adminForm.resetFields()
      setSelectedAdmin(null)
      fetchAdmins()
    } catch (error) {
      message.error('操作失败')
    }
  }

  // ==================== 角色权限管理函数 ====================
  const fetchRoles = async () => {
    setRoleLoading(true)
    try {
      // 本地模拟数据
      const mockRoles = [
        { id: '1', name: '超级管理员', description: '拥有全部权限', adminCount: 1, status: 'active' },
        { id: '2', name: '用户管理', description: '管理用户信息和权限', adminCount: 1, status: 'active' },
        { id: '3', name: '店铺管理', description: '管理店铺和商品', adminCount: 1, status: 'active' },
        { id: '4', name: '财务管理', description: '管理订单和佣金', adminCount: 0, status: 'active' },
      ]
      setRoles(mockRoles)
    } catch (error) {
      message.error('加载角色列表失败')
    } finally {
      setRoleLoading(false)
    }
  }

  const handleRoleSelect = (role: any) => {
    setSelectedRole(role)
    // 模拟加载菜单权限
    const mockMenus = [
      { title: '仪表板', key: 'dashboard', checked: true },
      { title: '业务管理', key: 'business', checked: true, children: [
        { title: '店铺管理', key: 'shops', checked: true },
        { title: '商品管理', key: 'products', checked: true },
        { title: '用户管理', key: 'users', checked: true },
      ]},
      { title: '供应链管理', key: 'supply', checked: false, children: [
        { title: '采购管理', key: 'purchases', checked: false },
        { title: '库存管理', key: 'inventory', checked: false },
        { title: '物流管理', key: 'logistics', checked: false },
      ]},
      { title: '财务管理', key: 'finance', checked: true, children: [
        { title: '订单管理', key: 'orders', checked: true },
        { title: '通券管理', key: 'points', checked: false },
        { title: '佣金管理', key: 'commission', checked: true },
      ]},
      { title: '系统管理', key: 'system', checked: false, children: [
        { title: '管理员管理', key: 'admin_users', checked: false },
        { title: '角色权限', key: 'admin_roles', checked: false },
        { title: '系统配置', key: 'admin_config', checked: false },
        { title: '操作日志', key: 'admin_logs', checked: false },
      ]},
    ]
    setMenuPermissions(mockMenus)
    const checkedKeys = mockMenus.reduce((acc: string[], m: any) => {
      if (m.checked) acc.push(m.key)
      if (m.children) {
        m.children.forEach((child: any) => {
          if (child.checked) acc.push(child.key)
        })
      }
      return acc
    }, [])
    setCheckedKeys(checkedKeys)
  }

  const onRoleFinish = async (values: any) => {
    try {
      // 保存角色
      message.success('角色保存成功')
      setRoleModalVisible(false)
      roleForm.resetFields()
      setSelectedRole(null)
      fetchRoles()
    } catch (error) {
      message.error('保存失败')
    }
  }

  // ==================== 操作日志函数 ====================
  const fetchLogs = async (page = 1) => {
    setLogLoading(true)
    try {
      // 本地模拟数据
      const mockLogs = [
        { id: '1', admin: 'admin', action: '创建商品', resource: '产品管理', details: '创建商品 iPhone 15', status: 'success', timestamp: '2024-11-20 14:30:45' },
        { id: '2', admin: 'user_manager', action: '删除用户', resource: '用户管理', details: '删除用户 user_123', status: 'success', timestamp: '2024-11-20 13:15:20' },
        { id: '3', admin: 'shop_manager', action: '审核店铺', resource: '店铺管理', details: '店铺申请已审核通过', status: 'success', timestamp: '2024-11-20 11:45:30' },
        { id: '4', admin: 'admin', action: '修改配置', resource: '系统配置', details: '修改佣金比例', status: 'success', timestamp: '2024-11-20 10:20:15' },
        { id: '5', admin: 'user_manager', action: '导出数据', resource: '用户管理', details: '导出用户列表', status: 'success', timestamp: '2024-11-19 16:00:00' },
      ]
      setLogs(mockLogs)
      setLogPagination({ current: page, pageSize: 20, total: mockLogs.length })
    } catch (error) {
      message.error('加载操作日志失败')
    } finally {
      setLogLoading(false)
    }
  }

  return (
    <div className="config-page fade-in-down">
      {/* 页面头部 */}
      <div className="page-header">
        <BackButton fallback="/dashboard" />
        <h1 className="page-title">系统管理</h1>
      </div>

      <Card className="card-with-shadow">
        <Tabs
          items={[
            {
              key: '1',
              label: '系统配置',
              children: (
                <div>
                  <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
                      <Col xs={24} sm={12} md={12}>
                        <Input
                          placeholder="搜索配置名或描述"
                          prefix={<SearchOutlined />}
                          value={searchText}
                          onChange={(e) => handleSearch(e.target.value)}
                          allowClear
                        />
                      </Col>
                      <Col xs={24} sm={12} md={12}>
                        <Space>
                          <Button icon={<ReloadOutlined />} onClick={() => fetchConfigs()}>刷新</Button>
                          <Button type="primary" onClick={() => { form.resetFields(); setSelectedConfig(null); setModalVisible(true) }}>新增配置</Button>
                          <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
                        </Space>
                      </Col>
                    </Row>
                  </Card>

                  <Card className="card-with-shadow">
                    <Table
                      columns={columns}
                      dataSource={filteredConfigs}
                      loading={loading}
                      pagination={pagination}
                      onChange={(pag: any) => fetchConfigs(pag.current || 1, pag.pageSize || 10)}
                      rowKey="key"
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: '2',
              label: '管理员管理',
              children: (
                <div>
                  <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
                      <Col xs={24} sm={12} md={12}>
                        <Input
                          placeholder="搜索管理员名称或账户"
                          prefix={<SearchOutlined />}
                          value={adminSearchText}
                          onChange={(e) => fetchAdmins(e.target.value)}
                          allowClear
                        />
                      </Col>
                      <Col xs={24} sm={12} md={12}>
                        <Space>
                          <Button icon={<ReloadOutlined />} onClick={() => fetchAdmins()}>刷新</Button>
                          <Button type="primary" icon={<UserAddOutlined />} onClick={() => { adminForm.resetFields(); setSelectedAdmin(null); setAdminModalVisible(true) }}>新增管理员</Button>
                        </Space>
                      </Col>
                    </Row>
                  </Card>

                  <Card className="card-with-shadow">
                    <Table
                      loading={adminLoading}
                      dataSource={admins}
                      rowKey="id"
                      columns={[
                        { title: '管理员名称', dataIndex: 'name', key: 'name' },
                        { title: '管理员账户', dataIndex: 'username', key: 'username' },
                        { title: '邮箱', dataIndex: 'email', key: 'email' },
                        { title: '角色', dataIndex: 'role', key: 'role', render: (role: string) => <Tag color="blue">{role === 'super_admin' ? '超级管理员' : role === 'user_manager' ? '用户管理' : '店铺管理'}</Tag> },
                        { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Badge status={status === 'active' ? 'success' : 'error'} text={status === 'active' ? '正常' : '禁用'} /> },
                        { title: '最后登陆', dataIndex: 'lastLogin', key: 'lastLogin' },
                        {
                          title: '操作',
                          key: 'action',
                          render: (_: any, record: any) => (
                            <Space size="small">
                              <Button type="text" icon={<EditOutlined />} onClick={() => editAdmin(record)} />
                              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteAdmin(record.id)} />
                            </Space>
                          ),
                        },
                      ]}
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: '3',
              label: '角色权限管理',
              children: (
                <div>
                  <Row gutter={24}>
                    <Col xs={24} sm={24} md={8}>
                      <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
                        <div style={{ marginBottom: 16 }}>
                          <Button type="primary" icon={<PlusOutlined />} block onClick={() => { roleForm.resetFields(); setSelectedRole(null); setRoleModalVisible(true) }}>
                            新增角色
                          </Button>
                        </div>
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                          {roles.length === 0 ? (
                            <Empty description="暂无角色" />
                          ) : (
                            roles.map(role => (
                              <div
                                key={role.id}
                                onClick={() => handleRoleSelect(role)}
                                style={{
                                  padding: '12px',
                                  marginBottom: '8px',
                                  backgroundColor: selectedRole?.id === role.id ? '#e6f7ff' : '#fafafa',
                                  border: selectedRole?.id === role.id ? '1px solid #1890ff' : '1px solid #f0f0f0',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s',
                                }}
                              >
                                <div style={{ fontWeight: selectedRole?.id === role.id ? 'bold' : 'normal' }}>{role.name}</div>
                                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{role.adminCount} 个管理员</div>
                              </div>
                            ))
                          )}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={16}>
                      {selectedRole ? (
                        <Card className="card-with-shadow">
                          <div style={{ marginBottom: 16 }}>
                            <h3>角色: {selectedRole.name}</h3>
                            <p style={{ color: '#999', marginBottom: 0 }}>{selectedRole.description}</p>
                          </div>
                          <div style={{ marginBottom: 16 }}>
                            <h4 style={{ marginBottom: 12 }}>权限配置</h4>
                            <Tree
                              checkable
                              defaultExpandAll
                              checkedKeys={checkedKeys}
                              onCheck={(keys: any) => setCheckedKeys(keys)}
                              treeData={menuPermissions.map((menu: any) => ({
                                title: menu.title,
                                key: menu.key,
                                children: menu.children?.map((child: any) => ({
                                  title: child.title,
                                  key: child.key,
                                })),
                              }))}
                            />
                          </div>
                          <div style={{ marginTop: 24 }}>
                            <Space>
                              <Button type="primary" onClick={() => onRoleFinish({})}>  保存权限</Button>
                              <Button onClick={() => setSelectedRole(null)}>取消</Button>
                            </Space>
                          </div>
                        </Card>
                      ) : (
                        <Card className="card-with-shadow" style={{ textAlign: 'center', color: '#999' }}>
                          选择一个角色来配置权限
                        </Card>
                      )}
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: '4',
              label: '操作日志',
              children: (
                <div>
                  <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
                    <Button icon={<ReloadOutlined />} onClick={() => fetchLogs()}>刷新</Button>
                  </Card>

                  <Card className="card-with-shadow">
                    <Table
                      loading={logLoading}
                      dataSource={logs}
                      rowKey="id"
                      columns={[
                        { title: '操作人', dataIndex: 'admin', key: 'admin' },
                        { title: '操作类型', dataIndex: 'action', key: 'action' },
                        { title: '资源模块', dataIndex: 'resource', key: 'resource' },
                        { title: '操作详情', dataIndex: 'details', key: 'details' },
                        { title: '结果', dataIndex: 'status', key: 'status', render: (status: string) => <Badge status={status === 'success' ? 'success' : 'error'} text={status === 'success' ? '成功' : '失败'} /> },
                        { title: '操作时间', dataIndex: 'timestamp', key: 'timestamp' },
                      ]}
                      pagination={{ current: logPagination.current, pageSize: logPagination.pageSize, total: logPagination.total }}
                    />
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* 配置修改模态框 */}
      <Modal
        title={selectedConfig ? '编辑配置' : '新增配置'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="key" label="配置名" rules={[{ required: true }]} hidden={!!selectedConfig}>
            <Input placeholder="输入配置名" disabled={!!selectedConfig} />
          </Form.Item>
          <Form.Item name="type" label="数据类型" rules={[{ required: true }]}>
            <Select
              placeholder="选择数据类型"
              options={[
                { label: '字符串', value: 'STRING' },
                { label: '数字', value: 'NUMBER' },
                { label: '布尔值', value: 'BOOLEAN' },
                { label: 'JSON', value: 'JSON' },
              ]}
            />
          </Form.Item>
          <Form.Item name="value" label="配置值" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="输入配置值" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="输入配置描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 管理员编辑模态框 */}
      <Modal
        title={selectedAdmin ? '编辑管理员' : '新增管理员'}
        open={adminModalVisible}
        onOk={() => adminForm.submit()}
        onCancel={() => setAdminModalVisible(false)}
        width={600}
      >
        <Form form={adminForm} onFinish={onAdminFinish} layout="vertical">
          <Form.Item name="name" label="管理员名称" rules={[{ required: true, message: '请输入管理员名称' }]}>
            <Input placeholder="输入管理员名称" />
          </Form.Item>
          <Form.Item name="username" label="管理员账户" rules={[{ required: true, message: '请输入管理员账户' }]}>
            <Input placeholder="输入管理员账户" disabled={!!selectedAdmin} />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input placeholder="输入邮箱" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              placeholder="选择角色"
              options={[
                { label: '超级管理员', value: 'super_admin' },
                { label: '用户管理', value: 'user_manager' },
                { label: '店铺管理', value: 'shop_manager' },
                { label: '财务管理', value: 'finance_manager' },
              ]}
            />
          </Form.Item>
          {!selectedAdmin && (
            <Form.Item name="password" label="初始密码" rules={[{ required: true, message: '请输入初始密码' }]}>
              <Input.Password placeholder="输入初始密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
