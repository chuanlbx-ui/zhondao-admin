import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Modal, Form, Input, InputNumber, message, Space, Tag, Select, Row, Col, Tabs, Tree, Checkbox, Badge, Timeline, Empty, Upload, Image } from 'antd'
import { EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined, DownloadOutlined, UserAddOutlined, PlusOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons'
import { adminBannerApi } from '@/api'
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

  // Banner管理状态
  const [banners, setBanners] = useState<any[]>([])
  const [bannerLoading, setBannerLoading] = useState(false)
  const [bannerModalVisible, setBannerModalVisible] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<any>(null)
  const [bannerForm] = Form.useForm()

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

  const onFinish = async (values: any) => {
    try {
      message.success(selectedConfig ? '配置更新成功' : '配置添加成功')
      setModalVisible(false)
      fetchConfigs()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleCreateConfig = () => {
    form.resetFields()
    setSelectedConfig(null)
    setModalVisible(true)
  }

  const handleEditConfig = (config: any) => {
    form.setFieldsValue(config)
    setSelectedConfig(config)
    setModalVisible(true)
  }

  const handleDeleteConfig = async (key: string) => {
    try {
      message.success('配置删除成功')
      fetchConfigs()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const fetchAdmins = async () => {
    setAdminLoading(true)
    try {
      // 本地模拟数据
      const mockAdmins = [
        { id: 1, name: '超级管理员', username: 'admin', email: 'admin@example.com', role: 'super_admin' },
        { id: 2, name: '用户管理', username: 'user_manager', email: 'user@example.com', role: 'user_manager' },
      ]
      setAdmins(mockAdmins)
    } catch (error) {
      message.error('加载管理员列表失败')
    } finally {
      setAdminLoading(false)
    }
  }

  const onAdminFinish = async (values: any) => {
    try {
      message.success(selectedAdmin ? '管理员更新成功' : '管理员添加成功')
      setAdminModalVisible(false)
      fetchAdmins()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleCreateAdmin = () => {
    adminForm.resetFields()
    setSelectedAdmin(null)
    setAdminModalVisible(true)
  }

  const handleEditAdmin = (admin: any) => {
    adminForm.setFieldsValue(admin)
    setSelectedAdmin(admin)
    setAdminModalVisible(true)
  }

  const handleDeleteAdmin = async (id: number) => {
    try {
      message.success('管理员删除成功')
      fetchAdmins()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const fetchRoles = async () => {
    setRoleLoading(true)
    try {
      // 本地模拟数据
      const mockRoles = [
        { id: 1, name: '超级管理员', permissions: ['all'] },
        { id: 2, name: '用户管理', permissions: ['user_view', 'user_edit'] },
      ]
      setRoles(mockRoles)
    } catch (error) {
      message.error('加载角色列表失败')
    } finally {
      setRoleLoading(false)
    }
  }

  const fetchLogs = async () => {
    setLogLoading(true)
    try {
      // 本地模拟数据
      const mockLogs = [
        { id: 1, admin_name: 'admin', action: '登录', details: '用户登录系统', created_at: new Date().toLocaleString() },
        { id: 2, admin_name: 'admin', action: '修改配置', details: '修改系统配置', created_at: new Date().toLocaleString() },
      ]
      setLogs(mockLogs)
    } catch (error) {
      message.error('加载日志失败')
    } finally {
      setLogLoading(false)
    }
  }

  const fetchBanners = async () => {
    setBannerLoading(true)
    try {
      // 本地模拟数据
      const mockBanners = [
        { id: 1, title: '首页轮播1', link: 'https://example.com', order: 1, status: 'active', imageUrl: 'https://via.placeholder.com/1200x400' },
        { id: 2, title: '首页轮播2', link: 'https://example.com', order: 2, status: 'active', imgUrl: 'https://via.placeholder.com/1200x400' },
      ]
      setBanners(mockBanners)
    } catch (error) {
      message.error('加载Banner列表失败')
    } finally {
      setBannerLoading(false)
    }
  }

  const handleBannerUpload = async () => {
    try {
      message.success(selectedBanner ? 'Banner更新成功' : 'Banner添加成功')
      setBannerModalVisible(false)
      fetchBanners()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleCreateBanner = () => {
    bannerForm.resetFields()
    setSelectedBanner(null)
    setBannerModalVisible(true)
  }

  const handleEditBanner = (banner: any) => {
    const bannerWithFileList = {
      ...banner,
      fileList: banner.imageUrl || banner.imgUrl ? [
        {
          uid: banner.id,
          name: `banner-${banner.id}.jpg`,
          status: 'done',
          url: banner.imageUrl || banner.imgUrl,
          thumbUrl: banner.imageUrl || banner.imgUrl,
        }
      ] : []
    }
    // 先重置表单，然后设置值
    bannerForm.resetFields()
    // 使用setTimeout确保重置完成后再设置值
    setTimeout(() => {
      bannerForm.setFieldsValue(bannerWithFileList)
    }, 0)
    setSelectedBanner(banner)
    setBannerModalVisible(true)
  }

  const handleDeleteBanner = async (id: number) => {
    try {
      message.success('Banner删除成功')
      fetchBanners()
    } catch (error) {
      message.error('删除失败')
    }
  }

  useEffect(() => {
    fetchConfigs()
    fetchAdmins()
    fetchRoles()
    fetchLogs()
    fetchBanners()
  }, [])

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
                        <Button type="primary" onClick={handleCreateConfig}>
                          <PlusOutlined /> 新增配置
                        </Button>
                      </Col>
                      <Col xs={24} sm={12} md={12} style={{ textAlign: 'right' }}>
                        <Space>
                          <Input
                            placeholder="搜索配置名或描述"
                            allowClear
                            style={{ width: 200 }}
                            onChange={(e) => handleSearch(e.target.value)}
                            suffix={<SearchOutlined />}
                          />
                          <Button onClick={handleExport}>
                            <DownloadOutlined /> 导出
                          </Button>
                          <Button onClick={() => fetchConfigs()}>
                            <ReloadOutlined /> 刷新
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                    <Table
                      columns={[
                        { title: '配置名', dataIndex: 'key', key: 'key' },
                        { title: '配置值', dataIndex: 'value', key: 'value' },
                        { title: '数据类型', dataIndex: 'type', key: 'type' },
                        { title: '描述', dataIndex: 'description', key: 'description' },
                        {
                          title: '操作',
                          key: 'action',
                          render: (_, record) => (
                            <Space size="middle">
                              <Button type="link" onClick={() => handleEditConfig(record)}>
                                <EditOutlined /> 编辑
                              </Button>
                              <Button type="link" danger onClick={() => handleDeleteConfig(record.key)}>
                                <DeleteOutlined /> 删除
                              </Button>
                            </Space>
                          ),
                        },
                      ]}
                      dataSource={filteredConfigs}
                      pagination={pagination}
                      loading={loading}
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
                        <Button type="primary" onClick={handleCreateAdmin}>
                          <UserAddOutlined /> 新增管理员
                        </Button>
                      </Col>
                      <Col xs={24} sm={12} md={12} style={{ textAlign: 'right' }}>
                        <Space>
                          <Button onClick={() => fetchAdmins()}>
                            <ReloadOutlined /> 刷新
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                    <Table
                      columns={[
                        { title: 'ID', dataIndex: 'id', key: 'id' },
                        { title: '管理员名称', dataIndex: 'name', key: 'name' },
                        { title: '管理员账户', dataIndex: 'username', key: 'username' },
                        { title: '邮箱', dataIndex: 'email', key: 'email' },
                        { title: '角色', dataIndex: 'role', key: 'role', render: (role: string) => (
                          <Tag color={role === 'super_admin' ? 'red' : 'blue'}>
                            {role === 'super_admin' ? '超级管理员' : role === 'user_manager' ? '用户管理' : role === 'shop_manager' ? '店铺管理' : '财务管理'}
                          </Tag>
                        )},
                        {
                          title: '操作',
                          key: 'action',
                          render: (_, record) => (
                            <Space size="middle">
                              <Button type="link" onClick={() => handleEditAdmin(record)}>
                                <EditOutlined /> 编辑
                              </Button>
                              <Button type="link" danger onClick={() => handleDeleteAdmin(record.id)}>
                                <DeleteOutlined /> 删除
                              </Button>
                            </Space>
                          ),
                        },
                      ]}
                      dataSource={admins}
                      loading={adminLoading}
                      rowKey="id"
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: '3',
              label: '操作日志',
              children: (
                <div>
                  <Card className="card-with-shadow">
                    <Table
                      columns={[
                        { title: 'ID', dataIndex: 'id', key: 'id' },
                        { title: '操作人', dataIndex: 'admin_name', key: 'admin_name' },
                        { title: '操作类型', dataIndex: 'action', key: 'action' },
                        { title: '操作详情', dataIndex: 'details', key: 'details' },
                        { title: '操作时间', dataIndex: 'created_at', key: 'created_at' },
                      ]}
                      dataSource={logs}
                      pagination={logPagination}
                      loading={logLoading}
                      rowKey="id"
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: '4',
              label: 'Banner管理',
              children: (
                <div>
                  <Card className="card-with-shadow" style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
                      <Col xs={24} sm={12} md={12}>
                        <Button type="primary" onClick={handleCreateBanner}>
                          <PlusOutlined /> 新增Banner
                        </Button>
                      </Col>
                      <Col xs={24} sm={12} md={12} style={{ textAlign: 'right' }}>
                        <Space>
                          <Button onClick={() => fetchBanners()}>
                            <ReloadOutlined /> 刷新
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                    <Table
                      columns={[
                        { title: 'ID', dataIndex: 'id', key: 'id' },
                        { title: '标题', dataIndex: 'title', key: 'title' },
                        { title: '链接', dataIndex: 'link', key: 'link' },
                        { title: '排序', dataIndex: 'order', key: 'order' },
                        { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => (
                          <Tag color={status === 'active' ? 'green' : 'gray'}>
                            {status === 'active' ? '启用' : '禁用'}
                          </Tag>
                        )},
                        {
                          title: '操作',
                          key: 'action',
                          render: (_, record) => (
                            <Space size="middle">
                              <Button type="link" onClick={() => handleEditBanner(record)}>
                                <EditOutlined /> 编辑
                              </Button>
                              <Button type="link" danger onClick={() => handleDeleteBanner(record.id)}>
                                <DeleteOutlined /> 删除
                              </Button>
                            </Space>
                          ),
                        },
                      ]}
                      dataSource={banners}
                      loading={bannerLoading}
                      rowKey="id"
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

      {/* Banner编辑模态框 */}
      <Modal
        title={selectedBanner ? '编辑Banner' : '新增Banner'}
        open={bannerModalVisible}
        onOk={handleBannerUpload}
        onCancel={() => {
          const fileList = bannerForm.getFieldValue('fileList') || [];
          fileList.forEach((file: any) => {
            if (file.url && file.url.startsWith('blob:')) URL.revokeObjectURL(file.url);
            if (file.thumbUrl && file.thumbUrl.startsWith('blob:')) URL.revokeObjectURL(file.thumbUrl);
          });
          setBannerModalVisible(false);
          bannerForm.resetFields();
          setSelectedBanner(null);
        }}
        width={600}
      >
        <Form form={bannerForm} layout="vertical" preserve={false}>
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入Banner标题' }]}>
            <Input placeholder="输入Banner标题" />
          </Form.Item>
          <Form.Item label="链接" name="link" rules={[{ required: true, message: '请输入Banner链接' }]}>
            <Input placeholder="输入Banner链接" />
          </Form.Item>
          <Form.Item label="排序" name="order" rules={[{ required: true, message: '请输入排序号' }]}>
            <InputNumber placeholder="输入排序号" />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select placeholder="选择状态" options={[{ label: '启用', value: 'active' }, { label: '禁用', value: 'inactive' }]} />
          </Form.Item>
          <Form.Item label="图片上传" name="fileList" rules={[{ required: true, message: '请上传Banner图片' }]}>
            <Upload
              listType="picture-card"
              beforeUpload={(file) => {
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('图片大小不能超过5MB');
                  return Upload.LIST_IGNORE;
                }
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('请上传图片文件');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              fileList={bannerForm.getFieldValue('fileList') || []}
              onChange={(info) => {
                const newFileList = info.fileList.map((file: any) => ({
                  ...file,
                  url: file.originFileObj ? URL.createObjectURL(file.originFileObj) : file.url,
                  thumbUrl: file.originFileObj ? URL.createObjectURL(file.originFileObj) : file.thumbUrl,
                  status: 'done'
                }));
                bannerForm.setFieldsValue({ fileList: newFileList });
              }}
              onRemove={(file) => {
                if (file.url && file.url.startsWith('blob:')) URL.revokeObjectURL(file.url);
                if (file.thumbUrl && file.thumbUrl.startsWith('blob:')) URL.revokeObjectURL(file.thumbUrl);
                const currentList = bannerForm.getFieldValue('fileList') || [];
                bannerForm.setFieldsValue({ fileList: currentList.filter((f: any) => f.uid !== file.uid) });
                return true;
              }}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>点击上传</div>
              </div>
            </Upload>
          </Form.Item>
          <div style={{ marginTop: 8, marginBottom: 16, fontSize: 12, color: '#999' }}>支持JPG、PNG格式，建议尺寸：1200x400像素</div>
          {selectedBanner && (selectedBanner.imageUrl || selectedBanner.imgUrl) && (
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>当前图片</div>
              <Image
                src={selectedBanner.imageUrl || selectedBanner.imgUrl}
                width={200}
                height={120}
                style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #d9d9d9' }}
                fallback="https://via.placeholder.com/200x120?text=暂无图片"
              />
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}