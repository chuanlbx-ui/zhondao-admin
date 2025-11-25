/**
 * 打印预览组件
 */

import React, { useRef } from 'react'
import { Modal, Button, Space, message } from 'antd'
import { PrinterOutlined, DownloadOutlined, CloseOutlined } from '@ant-design/icons'
import { printTable, exportToHTML } from '@/utils/export'

interface PrintPreviewProps {
  visible: boolean
  onClose: () => void
  title: string
  tableId?: string
  children?: React.ReactNode
}

export default function PrintPreview({
  visible,
  onClose,
  title,
  tableId,
  children,
}: PrintPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (tableId) {
      printTable(tableId, title)
    } else if (contentRef.current) {
      const printWindow = window.open('', '', 'width=1200,height=800')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <meta charset="utf-8">
              <title>${title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              ${contentRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
    message.success('打印中...')
  }

  const handleExport = () => {
    if (contentRef.current) {
      exportToHTML(contentRef.current, title, title)
      message.success('导出成功')
    }
  }

  return (
    <Modal
      title={`打印预览 - ${title}`}
      visible={visible}
      onCancel={onClose}
      width="80vw"
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        <Button key="export" icon={<DownloadOutlined />} onClick={handleExport}>
          导出HTML
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
        >
          打印
        </Button>,
      ]}
    >
      <div
        ref={contentRef}
        style={{
          backgroundColor: '#fff',
          padding: '40px',
          maxHeight: '70vh',
          overflow: 'auto',
          border: '1px solid #f0f0f0',
          borderRadius: '4px',
        }}
      >
        {children}
      </div>
    </Modal>
  )
}
