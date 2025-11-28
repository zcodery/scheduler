<template>
  <div v-if="isOpen && task" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl w-96 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="font-bold text-gray-800">编辑任务</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">&times;</button>
      </div>
      <form @submit.prevent="submit" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
          <input type="text" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" v-model="name" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input type="date" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" v-model="startDate" @input="handleStartDate" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input type="date" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" v-model="endDate" @input="handleEndDate" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">背景色</label>
            <PopoverColorPicker :value="bgColor || DEFAULT_TASK_BG" :presets="presets" :columns="11" :supportAlpha="true" @change="v=> bgColor=v" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">文字颜色</label>
            <PopoverColorPicker :value="textColor || DEFAULT_TASK_TEXT" :presets="presets" :columns="11" :supportAlpha="true" @change="v=> textColor=v" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">工期 (天)</label>
          <input type="number" min="1" step="1" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" v-model.number="duration" @input="handleDuration" />
        </div>
        <div class="pt-4 flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">取消</button>
          <button type="submit" class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded">保存</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Task } from '../types'
import { DEFAULT_TASK_BG, DEFAULT_TASK_TEXT, PRESET_TASK_COLORS } from '../constants'
import PopoverColorPicker from './PopoverColorPicker.vue'

export default Vue.extend({
  components: { PopoverColorPicker },
  props: {
    isOpen: { type: Boolean, required: true },
    task: { type: Object as () => Task | null, required: false }
  },
  data() {
    return { name: '', startDate: '', endDate: '', duration: 1, bgColor: '', textColor: '', presets: PRESET_TASK_COLORS, DEFAULT_TASK_BG, DEFAULT_TASK_TEXT }
  },
  watch: {
    task: {
      immediate: true,
      handler(t: Task | null) {
        if (t) {
          this.name = t.name
          this.startDate = t.startDate
          this.duration = t.duration
          this.endDate = this.calcEnd(t.startDate, t.duration)
          this.bgColor = t.bgColor || DEFAULT_TASK_BG
          this.textColor = t.textColor || DEFAULT_TASK_TEXT
        }
      }
    }
  },
  methods: {
    calcEnd(start: string, dur: number) {
      if (!start) return ''
      const d = new Date(start)
      d.setHours(0,0,0,0)
      d.setDate(d.getDate()+Math.round(dur))
      const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0')
      return `${y}-${m}-${day}`
    },
    calcDuration(start: string, end: string) {
      if (!start || !end) return 0
      const d1 = new Date(start); const d2 = new Date(end)
      d1.setHours(0,0,0,0); d2.setHours(0,0,0,0)
      const diff = d2.getTime() - d1.getTime()
      return Math.max(1, Math.round(diff/86400000))
    },
    handleStartDate() { if (this.duration>0) this.endDate = this.calcEnd(this.startDate, this.duration) },
    handleDuration() { if (this.startDate) this.endDate = this.calcEnd(this.startDate, this.duration) },
    handleEndDate() { if (this.startDate) this.duration = this.calcDuration(this.startDate, this.endDate) },
    submit() {
      if (!this.task) return
      this.$emit('save', this.task.id, { name: this.name, startDate: this.startDate, duration: Number(this.duration), bgColor: this.bgColor || undefined, textColor: this.textColor || undefined })
      this.$emit('close')
    }
  }
})
</script>

<style scoped>
</style>
