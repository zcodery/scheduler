/**
 * 将 CSS 的 rgb/rgba 文本转换为十六进制颜色
 * 入参示例："rgb(255, 0, 0)"、"rgba(255, 0, 0, 0.5)"
 * 返回值示例："#ff0000"
 */
export function rgbTextToHex(rgb: string | undefined): string {
  if (!rgb) return "#ffffff"
  const m = rgb.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+)\s*)?\)/i)
  if (!m) return rgb
  const to2 = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0")
  return `#${to2(Number(m[1]))}${to2(Number(m[2]))}${to2(Number(m[3]))}`
}

/**
 * 将十六进制颜色转换为 RGB 数值
 * 支持 3 位与 6 位写法，例如："#fff"、"#ffffff"
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "")
  if (h.length === 3)
    h = h
      .split("")
      .map(x => x + x)
      .join("")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return { r, g, b }
}

/**
 * 计算颜色相对亮度值，用于决定前景文字颜色（深/浅）
 * 返回范围约为 0~1，越大越亮
 */
export function luminance(hex?: string): number {
  if (!hex) return 0.5
  const { r, g, b } = hexToRgb(hex)
  const a = [r, g, b].map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

/**
 * 解析 YYYY-MM-DD 字符串为本地时区的 Date
 * 避免使用 Date 构造函数的跨时区偏移导致日期跨月
 */
export function parseDateStr(s: string): Date {
  const parts = String(s).split("-")
  const y = Number(parts[0] || 0)
  const m = Number(parts[1] || 1)
  const d = Number(parts[2] || 1)
  return new Date(y, Math.max(0, m - 1), Math.max(1, d))
}

/**
 * 将日期格式化为 YYYY-MM-DD 字符串
 */
export function formatDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * 根据开始日期与工期（天）计算结束日期（闭区间右端）
 * 入参示例：start="2025-01-01"，duration=3 => 返回 "2025-01-04"
 */
export function calcEnd(start: string, duration: number): string {
  if (!start) return ""
  const d = new Date(start)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + Math.round(duration))
  return formatDateYYYYMMDD(d)
}

/**
 * 计算两个日期之间的天数（按天对齐，最少 1 天）
 * 入参示例：start="2025-01-01"，end="2025-01-04" => 返回 3
 */
export function calcDuration(start: string, end: string): number {
  if (!start || !end) return 0
  const d1 = new Date(start)
  const d2 = new Date(end)
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  const diff = d2.getTime() - d1.getTime()
  return Math.max(1, Math.round(diff / 86400000))
}
