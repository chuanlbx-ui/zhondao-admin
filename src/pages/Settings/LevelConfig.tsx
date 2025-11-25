import React, { useState, useEffect } from 'react'
import { Card, Form, Button, Space, message, Modal, Table, Tabs, Input, InputNumber, Select, Switch, Empty, Spin } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd'
import { LEVEL_DISCOUNTS } from '@/utils/levelConfig'

interface LevelConfig {
  key: string
  name: string
  order: number
  discount: number
  monthlyReward: number
  monthlyBonus?: number
  upgradeRequires: {
    // 直推同级用户数要求
    directCountOfSameLevel?: number
    // 销售数量要求（由销售额/单价系数计算得出）
    salesQuantity?: {
      amount: number // 销售额基数
      unitPrice: number // 单价系数（如599）
      requiredQuantity: number // 要求的销售数量（向下取整）
    }
  }
  benefits: string[]
}

interface LevelConfigState {
  [key: string]: LevelConfig
}

const LevelConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [configs, setConfigs] = useState<LevelConfigState | null>(null)
  const [editingLevel, setEditingLevel] = useState<string | null>(null)
  const [form] = Form.useForm()

  // 获取配置
  const fetchLevelConfig = async () => {
    try {
      setLoading(true)
      // 使用统一的折扣配置，其他配置保持本地定义
      const localLevelConfig = {
        NORMAL: { monthlyReward: 0, monthlyBonus: 0, upgradeRequires: {}, benefits: ['基础购物功能'] },
        VIP: { monthlyReward: 100, monthlyBonus: 50, upgradeRequires: { salesQuantity: { amount: 1000, unitPrice: 1, requiredQuantity: 1000 } }, benefits: ['享受8折优惠'] },
        STAR_1: { monthlyReward: 200, monthlyBonus: 100, upgradeRequires: { directCountOfSameLevel: 1, salesQuantity: { amount: 5000, unitPrice: 599, requiredQuantity: 9 } }, benefits: ['享受7.5折优惠'] },
        STAR_2: { monthlyReward: 300, monthlyBonus: 150, upgradeRequires: { directCountOfSameLevel: 2, salesQuantity: { amount: 15000, unitPrice: 599, requiredQuantity: 25 } }, benefits: ['享受7折优惠'] },
        STAR_3: { monthlyReward: 500, monthlyBonus: 250, upgradeRequires: { directCountOfSameLevel: 3, salesQuantity: { amount: 30000, unitPrice: 599, requiredQuantity: 50 } }, benefits: ['享受6.5折优惠'] },
        STAR_4: { monthlyReward: 800, monthlyBonus: 400, upgradeRequires: { directCountOfSameLevel: 4, salesQuantity: { amount: 50000, unitPrice: 599, requiredQuantity: 84 } }, benefits: ['享受6折优惠'] },
        STAR_5: { monthlyReward: 1200, monthlyBonus: 600, upgradeRequires: { directCountOfSameLevel: 5, salesQuantity: { amount: 80000, unitPrice: 599, requiredQuantity: 134 } }, benefits: ['享受5.5折优惠'] },
        DIRECTOR: { monthlyReward: 2000, monthlyBonus: 1000, upgradeRequires: { directCountOfSameLevel: 6, salesQuantity: { amount: 150000, unitPrice: 599, requiredQuantity: 250 } }, benefits: ['享受5折优惠'] }
      }

      // 合并统一折扣配置和本地配置
      const defaultConfigs = Object.entries(LEVEL_DISCOUNTS).reduce((acc, [levelName, levelDiscount]) => {
        const localConfig = localLevelConfig[levelDiscount.key as keyof typeof localLevelConfig]
        acc[levelDiscount.key as keyof typeof acc] = {
          key: levelDiscount.key,
          name: levelDiscount.name,
          order: levelDiscount.order,
          discount: levelDiscount.discount,
          monthlyReward: localConfig.monthlyReward,
          monthlyBonus: localConfig.monthlyBonus,
          upgradeRequires: localConfig.upgradeRequires,
          benefits: localConfig.benefits
        }
        return acc
      }, {} as LevelConfigState)
      setConfigs(defaultConfigs)
      message.info('推迟：后端 API 尚未准备好，当前使用默认配置演示')
    } catch (error) {
      message.error('获取配置失败: ' + (error as any)?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLevelConfig()
  }, [])

  // 编辑等级
  const handleEdit = (levelKey: string) => {
    const levelConfig = configs?.[levelKey]
    if (!levelConfig) return

    setEditingLevel(levelKey)
    form.setFieldsValue({
      name: levelConfig.name,
      order: levelConfig.order,
      discount: levelConfig.discount,
      monthlyReward: levelConfig.monthlyReward,
      monthlyBonus: levelConfig.monthlyBonus || 0,
      directCountOfSameLevel: levelConfig.upgradeRequires?.directCountOfSameLevel,
      salesQuantityAmount: levelConfig.upgradeRequires?.salesQuantity?.amount,
      salesQuantityUnitPrice: levelConfig.upgradeRequires?.salesQuantity?.unitPrice,
      salesQuantityRequiredQuantity: levelConfig.upgradeRequires?.salesQuantity?.requiredQuantity,
      benefits: levelConfig.benefits.join('\n')
    })
  }

  // 保存配置
  const handleSave = async (values: any) => {
    if (!editingLevel || !configs) return

    try {
      setLoading(true)
      const updatedConfigs = {
        ...configs,
        [editingLevel]: {
          ...configs[editingLevel],
          name: values.name,
          order: values.order,
          discount: values.discount,
          monthlyReward: values.monthlyReward,
          monthlyBonus: values.monthlyBonus,
          upgradeRequires: {
            ...(values.directCountOfSameLevel && { directCountOfSameLevel: values.directCountOfSameLevel }),
            ...(values.salesQuantityAmount && {
              salesQuantity: {
                amount: values.salesQuantityAmount,
                unitPrice: values.salesQuantityUnitPrice,
                requiredQuantity: values.salesQuantityRequiredQuantity
              }
            })
          },
          benefits: values.benefits.split('\n').filter((b: string) => b.trim())
        }
      }

      // TODO: 应该执行后端 API 保存
      // await adminLevelConfigApi.updateSystem(updatedConfigs)
      message.success('配置已更新（推迟：待后端 API 准备）')
      setConfigs(updatedConfigs as any)
      setEditingLevel(null)
      form.resetFields()
    } catch (error) {
      message.error('保存配置失败: ' + (error as any)?.message)
    } finally {
      setLoading(false)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    setEditingLevel(null)
    form.resetFields()
  }

  // 刷新配置
  const handleRefresh = () => {
    fetchLevelConfig()
  }

  if (!configs) {
    return (
      <Card style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </Card>
    )
  }

  const levelList = Object.values(configs).sort((a, b) => a.order - b.order)

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title="用户等级体系配置"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      >
        {editingLevel ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            style={{ marginBottom: '20px' }}
          >
            <Form.Item
              label="等级名称"
              name="name"
              rules={[{ required: true, message: '请输入等级名称' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="等级顺序"
              name="order"
              rules={[{ required: true, message: '请输入等级顺序' }]}
            >
              <InputNumber min={1} max={10} />
            </Form.Item>

            <Form.Item
              label="折扣比例（0.1-1.0）"
              name="discount"
              rules={[{ required: true, message: '请输入折扣比例' }]}
            >
              <InputNumber min={0.1} max={1} step={0.05} precision={2} />
            </Form.Item>

            <Form.Item
              label="月度通券奖励"
              name="monthlyReward"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} />
            </Form.Item>

            <Form.Item
              label="月度现金奖励（元）"
              name="monthlyBonus"
            >
              <InputNumber min={0} />
            </Form.Item>

            <Form.Item
              label="直推同级用户数需求"
              name="directCountOfSameLevel"
            >
              <InputNumber min={0} placeholder="留空表示无要求" />
            </Form.Item>

            <Form.Item
              label="销售总额"
              name="salesQuantityAmount"
            >
              <InputNumber min={0} placeholder="留空表示无要求" />
            </Form.Item>

            <Form.Item
              label="单价系数（如599）"
              name="salesQuantityUnitPrice"
            >
              <InputNumber min={1} placeholder="留空表示无要求" />
            </Form.Item>

            <Form.Item
              label="需要的销售数量（销售额/单价系数 向下取整）"
              name="salesQuantityRequiredQuantity"
            >
              <InputNumber min={1} placeholder="留空表示无要求" />
            </Form.Item>

            <Form.Item
              label="权益列表（每行一个）"
              name="benefits"
              rules={[{ required: true, message: '请输入权益' }]}
            >
              <Input.TextArea rows={4} placeholder="每行一个权益" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存
                </Button>
                <Button onClick={handleCancel}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <Table
            dataSource={levelList}
            columns={[
              {
                title: '等级名称',
                dataIndex: 'name',
                key: 'name'
              },
              {
                title: '顺序',
                dataIndex: 'order',
                key: 'order',
                width: 80
              },
              {
                title: '折扣',
                dataIndex: 'discount',
                key: 'discount',
                render: (discount) => `${(discount * 100).toFixed(0)}%`
              },
              {
                title: '月度奖励',
                key: 'rewards',
                render: (_, record) => (
                  <div>
                    <div>通券: {record.monthlyReward}</div>
                    {record.monthlyBonus && <div>现金: ¥{record.monthlyBonus}</div>}
                  </div>
                )
              },
              {
                title: '升级要求',
                key: 'requirements',
                render: (_, record) => {
                  const reqs = []
                  if (record.upgradeRequires?.directCountOfSameLevel) {
                    reqs.push(`直推同级${record.upgradeRequires.directCountOfSameLevel}人`)
                  }
                  if (record.upgradeRequires?.salesQuantity) {
                    const { amount, unitPrice, requiredQuantity } = record.upgradeRequires.salesQuantity
                    reqs.push(`销售数量¥${amount}/¥${unitPrice} ≥ ${requiredQuantity}`)
                  }
                  return reqs.length ? reqs.join(' + ') : '无'
                }
              },
              {
                title: '操作',
                key: 'action',
                width: 100,
                render: (_, record) => (
                  <Space>
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(record.key)}
                      size="small"
                    >
                      编辑
                    </Button>
                  </Space>
                )
              }
            ]}
            rowKey="key"
            pagination={false}
          />
        )}

        <Card style={{ marginTop: '20px', backgroundColor: '#f5f5f5' }}>
          <h4>📝 说明</h4>
          <ul>
            <li>所有配置修改后会立即生效，无需重启系统</li>
            <li>折扣比例：0.5表示原价乚（即厫折）</li>
            <li>升级要求：直推同级人数 AND 销售数量 两项条件需同时满足</li>
            <li>销售数量 = 销售额 / 单价系数，向下取整</li>
            <li>月度奖励在用户完成订单后按等级自动发放</li>
          </ul>
        </Card>
      </Card>
    </div>
  )
}

export default LevelConfigPage
