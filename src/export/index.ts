import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useUIStore } from '@/stores/uiStore'

async function captureExport(page: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
  // Clear selection to remove amber glow
  const uiStore = useUIStore.getState()
  const savedIds = [...uiStore.selectedSectionIds]
  uiStore.clearSelection()

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
        // Force clean rendering
        clonedDoc.documentElement.style.background = '#ffffff'
        clonedDoc.documentElement.style.color = '#000000'
        clonedDoc.body.style.background = '#ffffff'
        clonedDoc.body.style.color = '#000000'
        clonedDoc.body.style.margin = '0'
        clonedDoc.body.style.padding = '0'

        // Kill ALL animations and force full opacity on every element
        clonedDoc.querySelectorAll('*').forEach((el) => {
          const htmlEl = el as HTMLElement
          htmlEl.style.animation = 'none'
          htmlEl.style.transition = 'none'
          htmlEl.style.opacity = '1'
        })

        // Add style override at end of head
        const override = clonedDoc.createElement('style')
        override.textContent = `
          html,body,#root{background:#ffffff!important;color:#000000!important;margin:0;padding:0;height:auto}
          body::before,body::after,#root::before,#root::after{display:none!important;content:none!important}
          *,*::before,*::after{animation:none!important;transition:none!important;opacity:1!important}
        `
        clonedDoc.head.appendChild(override)

        clonedDoc.querySelectorAll('[data-export-hide]').forEach((el) => {
          (el as HTMLElement).style.display = 'none'
        })
      },
    })
    return canvas
  } finally {
    // Restore selection
    if (savedIds.length > 0) {
      useUIStore.getState().setSelectedSection(savedIds[0])
    }
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
