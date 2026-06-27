import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

async function captureExport(page: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
  // Hide UI elements
  page.querySelectorAll('[data-export-hide]').forEach((el) => { (el as HTMLElement).style.display = 'none' })

  // Remove page noise texture
  const noiseDiv = page.querySelector('[data-noise]') as HTMLElement | null
  if (noiseDiv) noiseDiv.style.display = 'none'

  // Save original values
  const savedPageStyle = page.getAttribute('style') || ''

  // Force page to look clean
  page.style.boxShadow = 'none'
  page.style.background = '#ffffff'

  // Force body clean
  const savedBodyStyle = document.body.getAttribute('style') || ''
  document.body.style.background = '#ffffff'
  document.body.style.color = '#000000'

  // Add a <style> at end of head to override body::before and dark backgrounds
  // Must be last to have highest cascade priority
  const overrideStyle = document.createElement('style')
  overrideStyle.id = 'export-fix'
  overrideStyle.textContent = `
    html, body, #root { background: #ffffff !important; color: #000000 !important; }
    body::before, body::after { display: none !important; content: none !important; }
  `
  document.head.appendChild(overrideStyle)

  // Force style recalculation
  void document.body.offsetHeight

  await document.fonts.ready

  try {
    const canvas = await html2canvas(page, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: page.offsetWidth,
      windowHeight: page.offsetHeight,
      onclone: (clonedDoc) => {
        // In the clone, ensure clean rendering
        clonedDoc.body.style.background = '#ffffff'
        clonedDoc.body.style.color = '#000000'
        clonedDoc.documentElement.style.background = '#ffffff'
        
        // Add override in clone too
        const cloneStyle = clonedDoc.createElement('style')
        cloneStyle.textContent = `
          html, body { background: #ffffff !important; color: #000000 !important; }
          body::before, body::after { display: none !important; content: none !important; }
        `
        clonedDoc.head.appendChild(cloneStyle)
        
        // Hide UI in clone
        clonedDoc.querySelectorAll('[data-export-hide]').forEach((el) => {
          (el as HTMLElement).style.display = 'none'
        })
      },
    })
    return canvas
  } finally {
    // Restore
    page.setAttribute('style', savedPageStyle)
    document.body.setAttribute('style', savedBodyStyle)
    if (noiseDiv) noiseDiv.style.display = ''
    page.querySelectorAll('[data-export-hide]').forEach((el) => { (el as HTMLElement).style.display = '' })
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
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight())
  pdf.save('chord-chart.pdf')
}
