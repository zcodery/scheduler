import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ColorPresetPicker } from "./ColorPresetPicker"

type ColorOption = { name: string; hex?: string; class?: string; color?: string }

interface Props {
  value: string
  onChange: (val: string) => void
  presets: ColorOption[]
  columns?: number
  supportAlpha?: boolean
  disabled?: boolean
}

export const PopoverColorPicker: React.FC<Props> = ({ value, onChange, presets, columns = 11, supportAlpha = true, disabled = false }) => {
  const [open, setOpen] = useState(false)
  const [hex, setHex] = useState<string>("#ffffff")
  const [alpha, setAlpha] = useState<number>(1)
  const [draftHex, setDraftHex] = useState<string>("#ffffff")
  const [draftAlpha, setDraftAlpha] = useState<number>(1)
  const [draftText, setDraftText] = useState<string>("#ffffff")
  const anchorRef = useRef<HTMLButtonElement>(null)
  const panelPos = useRef<{ top: number; left: number } | null>(null)

  useEffect(() => {
    const parseRgba = (val: string) => {
      const m = val?.match(/rgba\((\d+),(\d+),(\d+),(\d+(?:\.\d+)?)\)/)
      if (!m) return null
      return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: Number(m[4]) }
    }
    const toHex = (r: number, g: number, b: number) => {
      const h = (x: number) => x.toString(16).padStart(2, "0")
      return `#${h(r)}${h(g)}${h(b)}`
    }
    const parsed = parseRgba(value)
    if (parsed) {
      setAlpha(parsed.a)
      setHex(toHex(parsed.r, parsed.g, parsed.b))
      setDraftAlpha(parsed.a)
      setDraftHex(toHex(parsed.r, parsed.g, parsed.b))
      setDraftText(`rgba(${parsed.r},${parsed.g},${parsed.b},${parsed.a})`)
    } else {
      setAlpha(1)
      setHex(value?.startsWith("#") ? value : "#ffffff")
      setDraftAlpha(1)
      setDraftHex(value?.startsWith("#") ? value : "#ffffff")
      setDraftText(value || "#ffffff")
    }
  }, [value])

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
  const rgbaString = (hex: string, a: number) => {
    const { r, g, b } = hexToRgb(hex)
    return `rgba(${r},${g},${b},${a})`
  }

  const rgbTextToHex = (rgb: string | undefined) => {
    if (!rgb) return draftHex
    const m = rgb.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+)\s*)?\)/i)
    if (!m) return draftHex
    const to2 = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0")
    return `#${to2(Number(m[1]))}${to2(Number(m[2]))}${to2(Number(m[3]))}`
  }

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
  const tryParseText = (t: string) => {
    const s = t.trim()
    const mRgba = s.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d*\.?\d+)\s*\)$/i)
    const mRgb = s.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)
    const mHex = s.match(/^#?[0-9a-fA-F]{3,6}$/)
    if (mRgba) {
      const r = clamp(Number(mRgba[1]), 0, 255)
      const g = clamp(Number(mRgba[2]), 0, 255)
      const b = clamp(Number(mRgba[3]), 0, 255)
      const a = clamp(Number(mRgba[4]), 0, 1)
      const h = `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`
      setDraftHex(h)
      setDraftAlpha(a)
      setDraftText(`rgba(${r},${g},${b},${a})`)
      return true
    }
    if (mRgb) {
      const r = clamp(Number(mRgb[1]), 0, 255)
      const g = clamp(Number(mRgb[2]), 0, 255)
      const b = clamp(Number(mRgb[3]), 0, 255)
      const h = `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`
      setDraftHex(h)
      setDraftAlpha(1)
      setDraftText(`rgb(${r},${g},${b})`)
      return true
    }
    if (mHex) {
      const h = s.startsWith("#") ? s : `#${s}`
      setDraftHex(h)
      setDraftText(h)
      return true
    }
    return false
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (anchorRef.current && (anchorRef.current === target || anchorRef.current.contains(target as Node))) return
      const panelEl = document.getElementById("color-popover-panel")
      if (panelEl && (panelEl === target || panelEl.contains(target as Node))) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const updatePanelPosition = () => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (!rect) return
    const top = rect.top + rect.height + 8
    let left = rect.right - 320
    if (left < 8) left = 8
    panelPos.current = { top, left }
  }

  useEffect(() => {
    if (!open) return
    updatePanelPosition()
    const onResize = () => updatePanelPosition()
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onResize, true)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onResize, true)
    }
  }, [open])

  return (
    <div className="inline-block">
      <button
        type="button"
        ref={anchorRef}
        className={`flex items-center gap-2 px-2 py-1 border rounded ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
        onClick={() => {
          if (disabled) return
          setDraftHex(hex)
          setDraftAlpha(alpha)
          setOpen(v => !v)
        }}
        title={value}
      >
        <span className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: value }}></span>
        <span className="text-xs text-gray-700 whitespace-nowrap">{value}</span>
      </button>

      {open &&
        panelPos.current &&
        createPortal(
          <div id="color-popover-panel" className="z-[1000] w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-3" style={{ position: "fixed", top: panelPos.current.top, left: panelPos.current.left }}>
            <div className="mb-3">
              <ColorPresetPicker
                colors={presets}
                selectedKey={draftHex}
                onSelect={c => {
                  const h = c.hex || rgbTextToHex(c.color)
                  setDraftHex(h)
                  setDraftText(supportAlpha ? rgbaString(h, draftAlpha) : h)
                }}
                columns={columns}
              />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <input
                type="color"
                value={draftHex}
                onChange={e => {
                  const h = e.target.value
                  setDraftHex(h)
                  setDraftText(supportAlpha ? rgbaString(h, draftAlpha) : h)
                }}
                className="h-8 w-10 border rounded p-0"
              />
              {supportAlpha && (
                <>
                  <span className="text-xs text-gray-600">A</span>
                  <div className="flex-1">
                    <div
                      className="h-2 rounded mb-1"
                      style={{
                        background: (() => {
                          const { r, g, b } = hexToRgb(draftHex)
                          return `linear-gradient(to right, rgba(${r},${g},${b},0) 0%, rgba(${r},${g},${b},1) 100%)`
                        })(),
                      }}
                    ></div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(draftAlpha * 100)}
                      onChange={e => {
                        const a = Number(e.target.value) / 100
                        setDraftAlpha(a)
                        setDraftText(rgbaString(draftHex, a))
                      }}
                      className="w-full"
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right">{Math.round(draftAlpha * 100)}%</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={draftText}
                onChange={e => {
                  const t = e.target.value
                  setDraftText(t)
                  tryParseText(t)
                }}
                placeholder="#3B82F6 或 rgba(59,130,246,1)"
                className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-300"
              />
              <div className="flex justify-end gap-2">
                <button type="button" className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded text-nowrap" onClick={() => setOpen(false)}>
                  取消
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded text-nowrap"
                  onClick={() => {
                    const next = supportAlpha ? rgbaString(draftHex, draftAlpha) : draftHex
                    setHex(draftHex)
                    setAlpha(draftAlpha)
                    onChange(next)
                    setOpen(false)
                  }}
                >
                  确定
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
