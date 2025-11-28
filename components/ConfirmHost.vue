<template>
  <div class="fixed inset-0 z-[2000]" :class="open ? '' : 'pointer-events-none'">
    <div class="absolute inset-0 bg-black/40 transition-opacity" :class="open ? 'opacity-100' : 'opacity-0'" @click="onClose('cancel')"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-[90vw] sm:max-w-md transition-all"
           :class="[options.className || '', open ? 'opacity-100 scale-100' : 'opacity-0 scale-95']">
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div class="text-sm font-semibold text-gray-800">{{ options.title || '提示' }}</div>
          <button v-if="options.showClose" class="text-gray-400 hover:text-gray-600" @click="onClose('cancel')">×</button>
        </div>
        <div class="px-4 py-4 text-sm text-gray-700 break-words">
          <span v-if="typeof options.message === 'string'">{{ options.message }}</span>
          <span v-else>{{ options.message }}</span>
        </div>
        <div class="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button class="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded" @click="onClose('cancel')">{{ options.cancelButtonText || '取消' }}</button>
          <button class="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded" @click="onClose('confirm')">{{ options.confirmButtonText || '确定' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

type ConfirmOptions = {
  title?: string
  message?: any
  confirmButtonText?: string
  cancelButtonText?: string
  showClose?: boolean
  beforeClose?: (action: 'confirm' | 'cancel') => boolean | Promise<boolean>
  className?: string
}

export default Vue.extend({
  props: {
    options: { type: Object as () => ConfirmOptions, required: true },
    resolve: { type: Function as () => (v: boolean) => void, required: true },
    reject: { type: Function as () => (v: boolean) => void, required: true },
    closeHost: { type: Function as () => () => void, required: true }
  },
  data() {
    return { open: true }
  },
  methods: {
    async onClose(action: 'confirm'|'cancel') {
      try {
        if (typeof this.options.beforeClose === 'function') {
          const r = await this.options.beforeClose(action)
          if (r === false) return
        }
      } catch {}
      this.open = false
      setTimeout(() => {
        try { this.closeHost() } catch {}
        if (action === 'confirm') this.resolve(true)
        else this.reject(false)
      }, 160)
    },
    onKey(e: KeyboardEvent) { if (e.key === 'Escape') this.onClose('cancel') }
  },
  mounted() { document.addEventListener('keydown', this.onKey) },
  beforeDestroy() { document.removeEventListener('keydown', this.onKey) }
})
</script>

<style scoped>
</style>
