import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

function oklchToRgb(oklchStr: string): string | null {
  try {
    const el = document.createElement('div')
    el.style.color = oklchStr
    el.style.display = 'none'
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    if (computed && /^rgb/.test(computed)) return computed
    return null
  } catch {
    return null
  }
}

interface StyleRestore {
  el: HTMLStyleElement
  original: string
}

function fixAllOklch(): StyleRestore[] {
  const restores: StyleRestore[] = []
  const cache = new Map<string, string>()

  // Preload cache: find all unique oklch values in all style tags
  const allStyleTags = document.querySelectorAll('style')
  allStyleTags.forEach((tag) => {
    const css = tag.textContent || ''
    const matches = css.matchAll(/oklch\([^)]+\)/g)
    for (const match of matches) {
      const val = match[0]
      if (!cache.has(val)) {
        const rgb = oklchToRgb(val)
        if (rgb) cache.set(val, rgb)
      }
    }
  })

  // Fix all style tags on the page (not clone)
  allStyleTags.forEach((tag) => {
    let css = tag.textContent || ''
    let modified = false
    for (const [oklch, rgb] of cache) {
      if (css.includes(oklch)) {
        css = css.replaceAll(oklch, rgb)
        modified = true
      }
    }
    if (modified) {
      restores.push({ el: tag as HTMLStyleElement, original: tag.textContent || '' })
      tag.textContent = css
    }
  })

  return restores
}

function restoreAllOklch(restores: StyleRestore[]): void {
  restores.forEach(({ el, original }) => {
    el.textContent = original
  })
}

export async function exportPNG(scale: number = 1): Promise<void> {
  const page = document.querySelector('[data-a4-page]') as HTMLElement | null
  if (!page) {
    console.error('A4 page element not found')
    return
  }

  const restores = fixAllOklch()

  try {
    const canvas = await html2canvas(page, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const link = document.createElement('a')
    link.download = `chord-chart${scale > 1 ? '-hd' : ''}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    restoreAllOklch(restores)
  }
}

export async function exportPDF(): Promise<void> {
  const page = document.querySelector('[data-a4-page]') as HTMLElement | null
  if (!page) {
    console.error('A4 page element not found')
    return
  }

  const restores = fixAllOklch()

  try {
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
  } finally {
    restoreAllOklch(restores)
  }
}
