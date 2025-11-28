import React from "react"
import { Check } from "lucide-react"

type ColorOption = { name: string; hex?: string; class?: string; color?: string }

interface Props {
  colors: ColorOption[]
  selectedKey?: string
  onSelect: (color: ColorOption) => void
  size?: number
  columns?: number
  disabled?: boolean
}

export const ColorPresetPicker: React.FC<Props> = ({ colors, selectedKey, onSelect, size = 20, columns = 11, disabled = false }) => {
  const boxStyle = { width: size, height: size }
  const rgbToHex = (rgb: string) => {
    const m = rgb.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+)\s*)?\)/i)
    if (!m) return rgb.toLowerCase()
    const to2 = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0")
    return `#${to2(Number(m[1]))}${to2(Number(m[2]))}${to2(Number(m[3]))}`.toLowerCase()
  }
  const toKey = (c: ColorOption) => (c.hex ? c.hex.toLowerCase() : c.color ? rgbToHex(c.color) : c.class || "")
  const hexToRgb = (hex: string) => {
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
  const luminance = (hex?: string) => {
    if (!hex) return 0.5
    const { r, g, b } = hexToRgb(hex)
    const a = [r, g, b].map(v => {
      const c = v / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
  }
  const needsBorder = (hex?: string) => {
    const l = luminance(hex)
    return l > 0.85 || l < 0.15
  }
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {colors.map((c, idx) => {
        const key = toKey(c)
        const isSelected = selectedKey ? selectedKey.toLowerCase() === key.toLowerCase() : false
        const base = `relative rounded ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-orange-300`
        const computedHex = c.hex ? c.hex : c.color ? rgbToHex(c.color) : undefined
        const border = computedHex ? (needsBorder(computedHex) ? "border border-gray-300" : "") : "border border-gray-300"
        const ring = isSelected ? "ring-1 ring-indigo-600 ring-offset-1" : ""
        const title = c.hex ? `${c.name} ${c.hex}` : c.color ? `${c.name} ${c.color}` : c.name
        return (
          <button key={idx} type="button" title={title} className={`${base} ${border} ${ring} ${c.class ?? ""}`} style={{ ...boxStyle, backgroundColor: c.hex ?? c.color ?? undefined }} onClick={() => !disabled && onSelect(c)} tabIndex={disabled ? -1 : 0}>
            {isSelected && <Check size={16} className="text-white drop-shadow" />}
          </button>
        )
      })}
    </div>
  )
}
