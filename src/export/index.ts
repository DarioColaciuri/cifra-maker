import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportPNG(scale: number = 1): Promise<void> {
  const page = document.querySelector('[data-a4-page]') as HTMLElement | null
  if (!page) {
    console.error('A4 page element not found')
    return
  }

  const canvas = await html2canvas(page, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const link = document.createElement('a')
  link.download = `chord-chart${scale > 1 ? '-hd' : ''}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportPDF(): Promise<void> {
  const page = document.querySelector('[data-a4-page]') as HTMLElement | null
  if (!page) {
    console.error('A4 page element not found')
    return
  }

  const canvas = await html2canvas(page, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save('chord-chart.pdf')
}
