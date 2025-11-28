<template>
  <div class="inline-block">
    <button type="button" ref="anchorRef" :class="['flex items-center gap-2 px-2 py-1 border rounded', disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50']" @click="toggle" :title="value">
      <span class="w-5 h-5 rounded border border-gray-300" :style="{ backgroundColor: value }"></span>
      <span class="text-xs text-gray-700 whitespace-nowrap">{{ value }}</span>
    </button>
    <div v-if="open && panelPos" id="color-popover-panel" class="z-[1000] w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-3" :style="{ position: 'fixed', top: panelPos.top+'px', left: panelPos.left+'px' }">
      <div class="mb-3">
        <ColorPresetPicker :colors="presets" :selectedKey="draftHex" :columns="columns" @select="onPreset" />
      </div>
      <div class="flex items-center gap-2 mb-1">
        <input type="color" v-model="draftHex" class="h-8 w-10 border rounded p-0" @input="syncDraftTextFromHex" />
        <template v-if="supportAlpha">
          <span class="text-xs text-gray-600">A</span>
          <div class="flex-1">
            <div class="h-2 rounded mb-1" :style="{ background: alphaGradient }"></div>
            <input type="range" min="0" max="100" :value="Math.round(draftAlpha*100)" @input="onAlphaRange" class="w-full" />
          </div>
          <span class="text-xs text-gray-600 w-8 text-right">{{ Math.round(draftAlpha*100) }}%</span>
        </template>
      </div>
      <div class="flex items-center gap-2 pt-1">
        <input type="text" v-model="draftText" @input="tryParseText" placeholder="#3B82F6 或 rgba(59,130,246,1)" class="flex-1 px-2 py-1 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-300" />
        <div class="flex justify-end gap-2">
          <button type="button" class="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded" @click="open=false">取消</button>
          <button type="button" class="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded" @click="confirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ColorPresetPicker from './ColorPresetPicker.vue'

type ColorOption = { name: string; hex?: string; class?: string; color?: string }

export default Vue.extend({
  components: { ColorPresetPicker },
  props: {
    value: { type: String, required: true },
    presets: { type: Array as () => ColorOption[], required: true },
    columns: { type: Number, required: false, default: 11 },
    supportAlpha: { type: Boolean, required: false, default: true },
    disabled: { type: Boolean, required: false, default: false }
  },
  data() {
    return { open: false, hex: '#ffffff', alpha: 1, draftHex: '#ffffff', draftAlpha: 1, draftText: '#ffffff', panelPos: null as null | { top: number; left: number } }
  },
  computed: {
    alphaGradient(): string {
      const { r,g,b } = this.hexToRgb(this.draftHex)
      return `linear-gradient(to right, rgba(${r},${g},${b},0) 0%, rgba(${r},${g},${b},1) 100%)`
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val: string) {
        const parsed = this.parseRgba(val)
        if (parsed) {
          this.alpha = parsed.a; this.hex = this.toHex(parsed.r,parsed.g,parsed.b)
          this.draftAlpha = parsed.a; this.draftHex = this.toHex(parsed.r,parsed.g,parsed.b)
          this.draftText = `rgba(${parsed.r},${parsed.g},${parsed.b},${parsed.a})`
        } else {
          this.alpha = 1; this.hex = val && val.startsWith('#') ? val : '#ffffff'
          this.draftAlpha = 1; this.draftHex = val && val.startsWith('#') ? val : '#ffffff'
          this.draftText = val || '#ffffff'
        }
      }
    }
  },
  mounted() {
    document.addEventListener('mousedown', this.onDocClick)
  },
  beforeDestroy() {
    document.removeEventListener('mousedown', this.onDocClick)
  },
  methods: {
    parseRgba(val: string) { const m = val?.match(/rgba\((\d+),(\d+),(\d+),(\d+(?:\.\d+)?)\)/); return m ? { r:Number(m[1]), g:Number(m[2]), b:Number(m[3]), a:Number(m[4]) } : null },
    toHex(r:number,g:number,b:number) { const h=(x:number)=> x.toString(16).padStart(2,'0'); return `#${h(r)}${h(g)}${h(b)}` },
    hexToRgb(hex: string) { let h = hex.replace('#',''); if (h.length===3) h = h.split('').map(x=>x+x).join(''); const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16); return { r,g,b } },
    rgbaString(hex: string, a: number) { const { r,g,b } = this.hexToRgb(hex); return `rgba(${r},${g},${b},${a})` },
    rgbTextToHex(rgb: string | undefined) {
      if (!rgb) return this.draftHex
      const m = rgb.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+)\s*)?\)/i)
      if (!m) return this.draftHex
      const to2 = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
      return `#${to2(Number(m[1]))}${to2(Number(m[2]))}${to2(Number(m[3]))}`
    },
    clamp(n:number,min:number,max:number) { return Math.max(min, Math.min(max,n)) },
    tryParseText() {
      const s = this.draftText.trim()
      const mRgba = s.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d*\.?\d+)\s*\)$/i)
      const mRgb = s.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)
      const mHex = s.match(/^#?[0-9a-fA-F]{3,6}$/)
      if (mRgba) {
        const r = this.clamp(Number(mRgba[1]),0,255), g = this.clamp(Number(mRgba[2]),0,255), b = this.clamp(Number(mRgba[3]),0,255), a = this.clamp(Number(mRgba[4]),0,1)
        const h = `#${[r,g,b].map(x=> x.toString(16).padStart(2,'0')).join('')}`
        this.draftHex = h; this.draftAlpha = a; this.draftText = `rgba(${r},${g},${b},${a})`
        return
      }
      if (mRgb) {
        const r = this.clamp(Number(mRgb[1]),0,255), g = this.clamp(Number(mRgb[2]),0,255), b = this.clamp(Number(mRgb[3]),0,255)
        const h = `#${[r,g,b].map(x=> x.toString(16).padStart(2,'0')).join('')}`
        this.draftHex = h; this.draftAlpha = 1; this.draftText = `rgb(${r},${g},${b})`
        return
      }
      if (mHex) { const h = s.startsWith('#') ? s : `#${s}`; this.draftHex = h; this.draftText = h }
    },
    onDocClick(e: MouseEvent) {
      const target = e.target as Node
      const anchorEl = this.$refs.anchorRef as HTMLButtonElement
      if (anchorEl && (anchorEl===target || anchorEl.contains(target))) return
      const panelEl = document.getElementById('color-popover-panel')
      if (panelEl && (panelEl===target || panelEl.contains(target))) return
      this.open = false
    },
    updatePanelPosition() {
      const rect = (this.$refs.anchorRef as HTMLButtonElement)?.getBoundingClientRect()
      if (!rect) return
      const top = rect.top + rect.height + 8
      let left = rect.right - 320
      if (left < 8) left = 8
      this.panelPos = { top, left }
    },
    toggle() {
      if (this.disabled) return
      this.draftHex = this.hex; this.draftAlpha = this.alpha; this.open = !this.open; if (this.open) this.$nextTick(()=> this.updatePanelPosition())
    },
    onPreset(c: ColorOption) { const h = c.hex || this.rgbTextToHex(c.color); this.draftHex = h; this.draftText = this.supportAlpha ? this.rgbaString(h, this.draftAlpha) : h },
    onAlphaRange(e: any) { const a = Number(e.target.value)/100; this.draftAlpha = a; this.draftText = this.rgbaString(this.draftHex, a) },
    syncDraftTextFromHex() { this.draftText = this.supportAlpha ? this.rgbaString(this.draftHex, this.draftAlpha) : this.draftHex },
    confirm() { const next = this.supportAlpha ? this.rgbaString(this.draftHex, this.draftAlpha) : this.draftHex; this.hex = this.draftHex; this.alpha = this.draftAlpha; this.$emit('change', next); this.open=false }
  }
})
</script>

<style scoped>
</style>
