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

type RestoreFn = () => void

function patchPage(): RestoreFn {
  const cache = new Map<string, string>()
  const restorers: RestoreFn[] = []

  // 1. Scan all <style> tags for oklch values
  const styleTags = document.querySelectorAll('style')
  styleTags.forEach((tag) => {
    let css = tag.textContent || ''
    const matches = css.matchAll(/oklch\([^)]*\)/g)
    for (const m of matches) {
      const val = m[0]
      if (!cache.has(val)) {
        const rgb = oklchToRgb(val)
        if (rgb) cache.set(val, rgb)
      }
    }
  })

  // 2. Also scan inline styles and SVG elements
  const allEls = document.querySelectorAll('[style], svg *, svg')
  allEls.forEach((el) => {
    const htmlEl = el as HTMLElement
    const style = htmlEl.getAttribute('style') || ''
    if (!style.includes('oklch')) return
    const matches = style.matchAll(/oklch\([^)]*\)/g)
    for (const m of matches) {
      const val = m[0]
      if (!cache.has(val)) {
        const rgb = oklchToRgb(val)
        if (rgb) cache.set(val, rgb)
      }
    }
  })

  if (cache.size === 0) return () => {}

  // 3. Replace oklch in all style tags
  styleTags.forEach((tag) => {
    let css = tag.textContent || ''
    let modified = false
    for (const [oklch, rgb] of cache) {
      if (css.includes(oklch)) {
        css = css.replaceAll(oklch, rgb)
        modified = true
      }
    }
    if (modified) {
      const original = tag.textContent || ''
      tag.textContent = css
      restorers.push(() => { tag.textContent = original })
    }
  })

  // 4. Replace oklch in all inline style attributes
  allEls.forEach((el) => {
    const htmlEl = el as HTMLElement
    const style = htmlEl.getAttribute('style') || ''
    if (!style.includes('oklch')) return
    let newStyle = style
    for (const [oklch, rgb] of cache) {
      newStyle = newStyle.replaceAll(oklch, rgb)
    }
    if (newStyle !== style) {
      htmlEl.setAttribute('style', newStyle)
      restorers.push(() => { htmlEl.setAttribute('style', style) })
    }
  })

  return () => restorers.forEach((r) => r())
}

const HIDE_SELECTOR = [
  '[data-export-hide]',
].join(',')

function hideUIElements(page: HTMLElement): Map<HTMLElement, string> {
  const hidden = new Map<HTMLElement, string>()
  page.querySelectorAll(HIDE_SELECTOR).forEach((el) => {
    const htmlEl = el as HTMLElement
    hidden.set(htmlEl, htmlEl.style.display || '')
    htmlEl.style.display = 'none'
  })
  return hidden
}

function showUIElements(hidden: Map<HTMLElement, string>): void {
  hidden.forEach((display, el) => {
    el.style.display = display
  })
}

export async function exportPNG(scale: number = 1): Promise<void> {
  const page = document.querySelector('[data-a4-page]') as HTMLElement | null
  if (!page) {
    console.error('A4 page element not found')
    return
  }

  await document.fonts.ready

  const savedShadow = page.style.boxShadow
  page.style.boxShadow = 'none'

  const hidden = hideUIElements(page)
  const restoreStyles = patchPage()

  try {
    const canvas = await html2canvas(page, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: page.offsetWidth,
      windowHeight: page.offsetHeight,
    })

    const link = document.createElement('a')
    link.download = `chord-chart${scale > 1 ? '-hd' : ''}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    page.style.boxShadow = savedShadow
    showUIElements(hidden)
    restoreStyles()
  }
}

export async function exportPDF(): Promise<void> {
  const page = document.querySelector('[data-a4-page]') as HTMLElement | null
  if (!page) {
    console.error('A4 page element not found')
    return
  }

  await document.fonts.ready

  const savedShadow = page.style.boxShadow
  page.style.boxShadow = 'none'

  const hidden = hideUIElements(page)
  const restoreStyles = patchPage()

  try {
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: page.offsetWidth,
      windowHeight: page.offsetHeight,
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
    page.style.boxShadow = savedShadow
    showUIElements(hidden)
    restoreStyles()
  }
}
