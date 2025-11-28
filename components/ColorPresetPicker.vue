<template>
  <div class="grid gap-1" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
    <button v-for="(c,idx) in colors" :key="idx" type="button" :title="titleOf(c)" :class="buttonClass(c)" :style="styleOf(c)" :disabled="disabled" @click="onClick(c)">
      <span v-if="isSelected(c)" class="text-white text-xs">✓</span>
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

type ColorOption = { name: string; hex?: string; class?: string; color?: string }

export default Vue.extend({
  props: {
    colors: { type: Array as () => ColorOption[], required: true },
    selectedKey: { type: String, required: false },
    size: { type: Number, required: false, default: 20 },
    columns: { type: Number, required: false, default: 11 },
    disabled: { type: Boolean, required: false, default: false }
  },
  methods: {
    rgbToHex(rgb: string) {
      const m = rgb.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+)\s*)?\)/i)
      if (!m) return rgb.toLowerCase()
      const to2 = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
      return `#${to2(Number(m[1]))}${to2(Number(m[2]))}${to2(Number(m[3]))}`.toLowerCase()
    },
    toKey(c: ColorOption) { return c.hex ? c.hex.toLowerCase() : c.color ? this.rgbToHex(c.color) : c.class || '' },
    hexToRgb(hex: string) {
      let h = hex.replace('#','')
      if (h.length===3) h = h.split('').map(x=> x+x).join('')
      const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16)
      return { r,g,b }
    },
    luminance(hex?: string) {
      if (!hex) return 0.5
      const { r,g,b } = this.hexToRgb(hex)
      const a = [r,g,b].map(v=>{ const c = v/255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4) })
      return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2]
    },
    needsBorder(hex?: string) { const l = this.luminance(hex); return l>0.85 || l<0.15 },
    isSelected(c: ColorOption) { return this.selectedKey ? this.selectedKey.toLowerCase() === this.toKey(c).toLowerCase() : false },
    titleOf(c: ColorOption) { return c.hex ? `${c.name} ${c.hex}` : c.color ? `${c.name} ${c.color}` : c.name },
    styleOf(c: ColorOption) { return { width: this.size+'px', height: this.size+'px', backgroundColor: c.hex || c.color || undefined } },
    buttonClass(c: ColorOption) {
      const base = `relative rounded ${this.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex items-center justify-center focus:outline-none`
      const computedHex = c.hex ? c.hex : c.color ? this.rgbToHex(c.color) : undefined
      const border = computedHex ? (this.needsBorder(computedHex) ? 'border border-gray-300' : '') : 'border border-gray-300'
      const ring = this.isSelected(c) ? 'ring-1 ring-indigo-600 ring-offset-1' : ''
      return `${base} ${border} ${ring} ${c.class || ''}`
    },
    onClick(c: ColorOption) { if (this.disabled) return; this.$emit('select', c) }
  }
})
</script>

<style scoped>
</style>
