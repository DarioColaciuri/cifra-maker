import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

function oklchToRgb(oklchStr: string): string | null {
  try {
    const el = document.createElement('div')
    el.style.color = oklchStr
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    if (computed && computed.startsWith('rgb')) return computed
    return null
  } catch {
    return null
  }
}

function fixOklchColors(clone: HTMLElement): void {
  const allElements = clone.querySelectorAll('*')
  const cache = new Map<string, string>()

  // Fix stylesheets in the clone that contain oklch
  const styleTags = clone.querySelectorAll('style')
  styleTags.forEach((styleTag) => {
    let css = styleTag.textContent || ''
    const oklchMatches = css.matchAll(/oklch\([^)]+\)/g)
    for (const match of oklchMatches) {
      const oklchVal = match[0]
      if (!cache.has(oklchVal)) {
        const rgb = oklchToRgb(oklchVal)
        if (rgb) cache.set(oklchVal, rgb)
      }
      const rgb = cache.get(oklchVal)
      if (rgb) css = css.replaceAll(oklchVal, rgb)
    }
    styleTag.textContent = css
  })

  // Fix inline styles
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement
    const style = htmlEl.getAttribute('style')
    if (!style || !style.includes('oklch')) return
    let newStyle = style
    const oklchMatches = style.matchAll(/oklch\([^)]+\)/g)
    for (const match of oklchMatches) {
      const oklchVal = match[0]
      if (!cache.has(oklchVal)) {
        const rgb = oklchToRgb(oklchVal)
        if (rgb) cache.set(oklchVal, rgb)
      }
      const rgb = cache.get(oklchVal)
      if (rgb) newStyle = newStyle.replaceAll(oklchVal, rgb)
    }
    if (newStyle !== style) htmlEl.setAttribute('style', newStyle)
  })
}

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
    onclone: (clonedDoc) => {
      const clonedPage = clonedDoc.querySelector('[data-a4-page]') as HTMLElement
      if (clonedPage) fixOklchColors(clonedPage)
    },
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
    onclone: (clonedDoc) => {
      const clonedPage = clonedDoc.querySelector('[data-a4-page]') as HTMLElement
      if (clonedPage) fixOklchColors(clonedPage)
    },
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
