import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

async function captureExport(page: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
  page.querySelectorAll('[data-export-hide]').forEach((el) => { (el as HTMLElement).style.display = 'none' })
  const noiseDiv = page.querySelector('[data-noise]') as HTMLElement | null
  if (noiseDiv) noiseDiv.style.display = 'none'

  const savedPageAttr = page.getAttribute('style') || ''
  page.style.boxShadow = 'none'
  page.style.background = '#ffffff'

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
        // Set inline on html and body directly (bypasses CSS cascade issues)
        clonedDoc.documentElement.setAttribute('style',
          'background:#ffffff!important;color:#000!important;margin:0;padding:0'
        )
        clonedDoc.body.setAttribute('style',
          'background:#ffffff!important;color:#000!important;margin:0;padding:0'
        )

        // Also force all elements to have black color via a style tag
        const override = clonedDoc.createElement('style')
        override.textContent = `
          html,body,#root{background:#ffffff!important;color:#000000!important}
          body::before,body::after{display:none!important}
          *.text-gray-500,*[class*=text-gray]{color:#000!important}
        `
        clonedDoc.head.appendChild(override)

        // Hide UI in clone too
        clonedDoc.querySelectorAll('[data-export-hide]').forEach((el) => {
          (el as HTMLElement).style.display = 'none'
        })
      },
    })
    return canvas
  } finally {
    page.setAttribute('style', savedPageAttr)
    if (noiseDiv) noiseDiv.style.display = ''
    page.querySelectorAll('[data-export-hide]').forEach((el) => { (el as HTMLElement).style.display = '' })
  }
}

export async function exportPNG(scale: number = 1): Promise<void> {
  const page = document.querySelector('[data-a4-page]') as HTMLElement | null
  if (!page) return
  const canvas = await captureExport(page, scale)
  const link = document.createElement('a')
  link.download = `chord-chart${scale > 1 ? '-hd' : ''}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportPDF(): Promise<void> {
  const page = document.querySelector('[data-a4-page]') as HTMLElement | null
  if (!page) return
  const canvas = await captureExport(page, 2)
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight())
  pdf.save('chord-chart.pdf')
}
