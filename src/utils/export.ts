/**
 * 数据导出工具库
 * 支持多种格式的导出
 */

/**
 * 导出为CSV格式
 */
export function exportToCSV(
  data: any[],
  columns: { key: string; label: string }[],
  filename: string = 'export'
) {
  const headers = columns.map(c => c.label).join(',')
  const rows = data.map(item =>
    columns
      .map(col => {
        const value = item[col.key]
        // 如果值包含逗号，用引号包装
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value
      })
      .join(',')
  )

  const csv = [headers, ...rows].join('\n')
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

/**
 * 导出为Excel格式（简单版本）
 */
export function exportToExcel(
  data: any[],
  columns: { key: string; label: string }[],
  filename: string = 'export'
) {
  // 创建表格HTML
  let html = '<table border="1">'

  // 表头
  html += '<tr>'
  columns.forEach(col => {
    html += `<th>${col.label}</th>`
  })
  html += '</tr>'

  // 数据行
  data.forEach(item => {
    html += '<tr>'
    columns.forEach(col => {
      html += `<td>${item[col.key]}</td>`
    })
    html += '</tr>'
  })

  html += '</table>'

  // 转换为Excel格式
  const blob = new Blob(
    ['\uFEFF' + html], // UTF-8 BOM
    { type: 'application/vnd.ms-excel;charset=utf-8;' }
  )

  downloadFile(
    URL.createObjectURL(blob),
    `${filename}.xls`,
    'application/vnd.ms-excel;charset=utf-8;',
    true
  )
}

/**
 * 导出为JSON格式
 */
export function exportToJSON(data: any[], filename: string = 'export') {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, `${filename}.json`, 'application/json;charset=utf-8;')
}

/**
 * 导出为PDF格式（需要html2pdf库）
 */
export function exportToPDF(
  element: HTMLElement,
  filename: string = 'export'
) {
  // 简单的打印实现
  const printWindow = window.open('', '', 'width=800,height=600')
  if (printWindow) {
    printWindow.document.write('<html><head><title>' + filename + '</title></head><body>')
    printWindow.document.write(element.innerHTML)
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.print()
    setTimeout(() => printWindow.close(), 100)
  }
}

/**
 * 打印表格
 */
export function printTable(
  tableId: string,
  title?: string
) {
  const table = document.getElementById(tableId)
  if (!table) {
    console.error('Table not found')
    return
  }

  const printWindow = window.open('', '', 'width=1200,height=800')
  if (printWindow) {
    let html = `<html><head><title>${title || '表格'}</title>`
    html += `<style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { text-align: center; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f5f5f5; font-weight: bold; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .print-time { text-align: right; color: #999; margin-top: 20px; font-size: 12px; }
    </style>`
    html += '</head><body>'
    if (title) {
      html += `<h1>${title}</h1>`
    }
    html += table.innerHTML
    html += `<div class="print-time">打印时间: ${new Date().toLocaleString()}</div>`
    html += '</body></html>'

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }
}

/**
 * 导出为HTML文件
 */
export function exportToHTML(
  element: HTMLElement,
  filename: string = 'export',
  title?: string
) {
  let html = `<html><head><meta charset="utf-8"><title>${title || filename}</title>`
  html += `<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #667eea; color: white; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .card { border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
    .stat-item { background: #f5f5f5; padding: 15px; border-radius: 4px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
    .stat-label { color: #999; font-size: 12px; margin-top: 5px; }
  </style>`
  html += '</head><body>'

  if (title) {
    html += `<h1>${title}</h1>`
  }

  html += element.innerHTML
  html += `<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
    导出时间: ${new Date().toLocaleString()}
  </div>`
  html += '</body></html>'

  downloadFile(html, `${filename}.html`, 'text/html;charset=utf-8;')
}

/**
 * 生成并下载文件
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
  isUrl: boolean = false
) {
  const element = document.createElement('a')

  if (isUrl) {
    element.href = content
  } else {
    const blob = new Blob([content], { type: mimeType })
    element.href = URL.createObjectURL(blob)
  }

  element.download = filename
  element.style.display = 'none'

  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)

  // 清理Object URL
  if (!isUrl) {
    setTimeout(() => {
      URL.revokeObjectURL(element.href)
    }, 100)
  }
}

/**
 * 报表生成器
 */
export class ReportGenerator {
  private data: any[] = []
  private title: string = '报表'
  private columns: { key: string; label: string }[] = []

  constructor(title: string) {
    this.title = title
  }

  setData(data: any[]) {
    this.data = data
    return this
  }

  setColumns(columns: { key: string; label: string }[]) {
    this.columns = columns
    return this
  }

  generateCSV() {
    exportToCSV(this.data, this.columns, this.title)
  }

  generateExcel() {
    exportToExcel(this.data, this.columns, this.title)
  }

  generateJSON() {
    exportToJSON(this.data, this.title)
  }

  generateHTML() {
    const table = this.createHTMLTable()
    exportToHTML(table, this.title, this.title)
  }

  private createHTMLTable(): HTMLElement {
    const div = document.createElement('div')
    let html = '<table border="1">'

    // 表头
    html += '<tr>'
    this.columns.forEach(col => {
      html += `<th>${col.label}</th>`
    })
    html += '</tr>'

    // 数据行
    this.data.forEach(item => {
      html += '<tr>'
      this.columns.forEach(col => {
        html += `<td>${item[col.key]}</td>`
      })
      html += '</tr>'
    })

    html += '</table>'
    div.innerHTML = html
    return div
  }
}

export default {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  printTable,
  exportToHTML,
  ReportGenerator,
}
