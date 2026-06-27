import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

async function captureExport(page: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
  // Hide UI elements
  const hiddenEls = page.querySelectorAll('[data-export-hide]')
  hiddenEls.forEach((el) => { (el as HTMLElement).style.display = 'none' })

  const savedShadow = page.style.boxShadow
  page.style.boxShadow = 'none'

  const savedPageBg = page.style.background
  page.style.background = '#ffffff'

  // Remove noise div inside page
  const noiseDiv = page.querySelector('[data-noise]') as HTMLElement | null
  if (noiseDiv) noiseDiv.style.display = 'none'

  // Save and modify body to prevent dark theme from bleeding
  const body = document.body
  const savedBodyBg = body.style.background || ''
  const savedBodyColor = body.style.color || ''
  body.style.background = '#ffffff'
  body.style.color = '#000000'

  // Remove body::before noise by temporarily hiding it
  // We do this by injecting a style override
  const overrideStyle = document.createElement('style')
  overrideStyle.id = 'export-override'
  overrideStyle.textContent = `
    body::before, body::after { display: none !important; }
    html, body { background: #ffffff !important; color: #000000 !important; }
    * { text-shadow: none !important; }
  `
  document.head.appendChild(overrideStyle)

  await document.fonts.ready

  try {
    const canvas = await html2canvas(page, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: page.offsetWidth,
      windowHeight: page.offsetHeight,
    })
    return canvas
  } finally {
    // Restore everything
    hiddenEls.forEach((el) => { (el as HTMLElement).style.display = '' })
    page.style.boxShadow = savedShadow
    page.style.background = savedPageBg
    if (noiseDiv) noiseDiv.style.display = ''
    body.style.background = savedBodyBg
    body.style.color = savedBodyColor
    overrideStyle.remove()
  }
}

export async function exportPNG(scale: number = 1): Promise<void> {
  const page = document.querySelector('[data-a4-page]') as HTMLElement | null
  if (!page) { console.error('A4 page element not found'); return }

  const canvas = await captureExport(page, scale)
  const link = document.createElement('a')
  link.download = `chord-chart${scale > 1 ? '-hd' : ''}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportPDF(): Promise<void> {
  const page = document.querySelector('[data-a4-page]') as HTMLElement | null
  if (!page) { console.error('A4 page element not found'); return }

  const canvas = await captureExport(page, 2)

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
