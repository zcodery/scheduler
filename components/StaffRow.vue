<template>
  <div :data-staff-id="staff.id" class="flex border-b border-gray-100 bg-white transition-all duration-300 ease-in-out" :style="dynamicStyle">
    <div class="w-64 flex-shrink-0 p-4 border-r border-gray-200 flex flex-col justify-center select-none bg-white relative group z-20 transition-colors hover:bg-gray-50/50" @contextmenu.prevent="onContextStaff" @mousedown.stop="onSidebarMouseDown" @click.stop>
      <div class="absolute left-1 top-1/2 -translate-y-1/2 text-gray-300 p-1 opacity-0 group-hover:opacity-100 rs-staff-handle">≡</div>
      <div class="flex items-center gap-3 pl-4">
        <button class="text-gray-400 hover:text-gray-600" @click="$emit('update-staff', staff.id, { isCollapsed: !staff.isCollapsed })">{{ staff.isCollapsed ? "▸" : "▾" }}</button>
        <slot name="avatar" :staff="staff">
          <img v-if="staff.avatar" :src="staff.avatar" :alt="staff.name" class="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 select-none" />
          <div v-else :class="avatarClass" :style="avatarStyle" @click.stop="cycleAvatarColor">{{ staff.name.charAt(0) }}</div>
        </slot>
        <div class="flex-1 min-w-0">
          <div v-if="editingField === 'name'" class="w-full">
            <el-input autofocus size="mini" v-model="staff.name" @blur="saveEdit('name', $event)" @keydown.enter.prevent="blurInput" />
          </div>
          <div v-else class="text-sm font-bold text-gray-900 truncate cursor-pointer" @dblclick="startEdit('name')" @click.stop="emitFocus">{{ staff.name }}</div>
          <div v-if="editingField === 'role'" class="w-full">
            <el-input autofocus size="mini" v-model="staff.role" @blur="saveEdit('role', $event)" @keydown.enter.prevent="blurInput" />
          </div>
          <div v-else class="text-xs text-gray-500 truncate cursor-text" @dblclick="startEdit('role')">{{ staff.role }}</div>
        </div>
      </div>
      <slot name="workload" v-if="!staff.isCollapsed" :staff="staff"></slot>
    </div>

    <div class="flex-1 relative overflow-hidden bg-white" @contextmenu.prevent="onContextRow">
      <div class="relative h-full" :style="{ width: viewMode === 'month' ? headers.length * dayWidth + 'px' : '100%', transform: viewMode === 'month' ? `translateX(${-scrollX}px)` : undefined, willChange: viewMode === 'month' ? 'transform' : undefined }">
        <div class="absolute inset-0 grid pointer-events-none" :style="{ gridTemplateColumns: viewMode === 'month' ? `repeat(${headers.length}, ${dayWidth}px)` : `repeat(${headers.length}, 1fr)` }">
          <div v-for="(h, i) in headers" :key="i" :class="['border-r border-gray-100 h-full', h.isToday ? 'bg-blue-50/60' : h.isWeekend ? 'bg-gray-50/80' : '']"></div>
        </div>
        <div v-show="!staff.isCollapsed" class="relative w-full h-full pt-3 pb-2" @dblclick="onGridDblClick">
          <div v-for="t in staff.tasks" :key="t.id" class="absolute z-10" :style="taskStyle(t)">
            <el-popover trigger="hover" popper-class="!p-0" :visible-arrow="false" :disabled="!readonly">
              <div class="bg-gray-900 text-white text-xs px-2 py-1.5 rounded">
                <div>开始: {{ t.startDate }}</div>
                <div>结束: {{ displyEndDate(t.startDate, t.duration) }}</div>
                <div>工期: {{ t.duration }} 天</div>
              </div>
              <TaskCard slot="reference" :task="t" :viewMode="viewMode" :readonly="readonly" :conflict="isConflict(t)" @dblclick.native="openEditTask(t)" @contextmenu.native.prevent="onContextTask(t, $event)" @update="onUpdateTaskName(t, $event)" @resize-start="onResizeStart" @mouse-down="onTaskMouseDown" @editing-start="onTaskEditingStart" @editing-end="onTaskEditingEnd" />
            </el-popover>
          </div>
        </div>
      </div>
      <div v-if="staff.isCollapsed" class="absolute inset-0 flex items-center px-2 z-10">
        <span class="ml-2 text-xs text-gray-400 whitespace-nowrap bg-white/80 px-2 rounded-full border border-gray-200">{{ staff.tasks.length }} 任务</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Staff, Task, DayInfo, ViewMode } from "../types"
import TaskCard from "./TaskCard.vue"
import WorkloadBar from "./WorkloadBar.vue"

export default {
  components: { TaskCard, WorkloadBar },
  props: {
    staff: { type: Object as () => Staff, required: true },
    headers: { type: Array as () => DayInfo[], required: true },
    viewStartDate: { type: Date, required: true },
    viewDurationMs: { type: Number, required: true },
    viewMode: { type: String as () => ViewMode, required: true },
    readonly: { type: Boolean, required: false, default: false },
    dayWidth: { type: Number, required: false, default: 50 },
    scrollX: { type: Number, required: false, default: 0 },
  },
  data() {
    return { editingField: null as null | "name" | "role" }
  },
  computed: {
    dynamicStyle(): Record<string, string> {
      if (this.staff.isCollapsed) return { height: "64px" }
      const maxRowIndex = this.staff.tasks.length > 0 ? Math.max(...this.staff.tasks.map(t => t.rowOffset)) : 0
      const h = Math.max(128, (maxRowIndex + 2) * 36 + 20)
      return { minHeight: "128px", height: `${h}px` }
    },
    avatarIsColor(): boolean {
      const v = this.staff.avatarColor || ""
      return v.startsWith("#") || v.startsWith("rgb")
    },
    avatarClass(): any {
      const base = ["w-10", "h-10", "rounded-full", "flex", "items-center", "justify-center", "text-sm", "font-bold", "flex-shrink-0", "select-none", "cursor-pointer"]
      return this.avatarIsColor ? base : [...base, this.staff.avatarColor]
    },
    avatarStyle(): any {
      if (!this.avatarIsColor) return {}
      const bg = this.staff.avatarColor
      const hex = bg.startsWith("rgb") ? this.rgbTextToHex(bg) : bg
      const l = this.luminance(hex)
      const color = l > 0.6 ? "#1f2937" : "#ffffff"
      return { backgroundColor: hex, color }
    },
  },
  methods: {
    onSidebarMouseDown(e: MouseEvent) {
      this.$emit("pan-start", e)
    },
    rgbTextToHex(rgb: string | undefined) {
      if (!rgb) return "#ffffff"
      const m = rgb.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+)\s*)?\)/i)
      if (!m) return rgb
      const to2 = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0")
      return `#${to2(Number(m[1]))}${to2(Number(m[2]))}${to2(Number(m[3]))}`
    },
    hexToRgb(hex: string) {
      let h = hex.replace("#", "")
      if (h.length === 3)
        h = h
          .split("")
          .map(x => x + x)
          .join("")
      const r = parseInt(h.slice(0, 2), 16),
        g = parseInt(h.slice(2, 4), 16),
        b = parseInt(h.slice(4, 6), 16)
      return { r, g, b }
    },
    luminance(hex?: string) {
      if (!hex) return 0.5
      const { r, g, b } = this.hexToRgb(hex)
      const a = [r, g, b].map(v => {
        const c = v / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
    },
    taskStyle(task: Task) {
      const sDate = new Date(task.startDate)
      sDate.setHours(0, 0, 0, 0)
      const start = sDate.getTime()
      const startOffset = start - this.viewStartDate.getTime()
      const topOffset = (task.rowOffset || 0) * 36
      if (this.viewMode === "month") {
        const baseDate = this.headers && this.headers.length > 0 ? new Date(this.headers[0].date) : new Date(this.viewStartDate)
        baseDate.setHours(0, 0, 0, 0)
        const baseStartMs = baseDate.getTime()
        const leftPx = ((start - baseStartMs) / 86400000) * this.dayWidth
        const widthPx = Math.max(1, task.duration * this.dayWidth)
        return { left: `${leftPx}px`, width: `${widthPx}px`, top: `${12 + topOffset}px` }
      }
      const durationMs = task.duration * 86400000
      let left = (startOffset / this.viewDurationMs) * 100
      let width = (durationMs / this.viewDurationMs) * 100
      return { left: `${left}%`, width: `${Math.max(width, 0.5)}%`, top: `${12 + topOffset}px` }
    },
    startEdit(field: "name" | "role") {
      if (this.readonly) return
      this.editingField = field
    },
    blurInput(e: Event) {
      ;(e.target as HTMLInputElement).blur()
    },
    saveEdit(field: "name" | "role", e: any) {
      const v = String(e.target.value || "").trim()
      if (v) this.$emit("update-staff", this.staff.id, field === "name" ? { name: v } : { role: v })
      this.editingField = null
    },
    emitFocus() {
      this.$emit("focus-staff", this.staff.id)
    },
    cycleAvatarColor() {
      if (this.staff.avatar) return
      const colors = ["bg-blue-100 text-blue-600", "bg-emerald-100 text-emerald-600", "bg-purple-100 text-purple-600", "bg-orange-100 text-orange-600", "bg-rose-100 text-rose-600", "bg-indigo-100 text-indigo-600"]
      const idx = colors.indexOf(this.staff.avatarColor)
      const next = colors[(idx + 1) % colors.length]
      this.$emit("update-staff", this.staff.id, { avatarColor: next })
    },
    onContextStaff(e: MouseEvent) {
      if (this.readonly) return
      this.$emit("context-menu", { clientX: (e as any).clientX, clientY: (e as any).clientY, type: "staff", staffId: this.staff.id })
    },
    onContextRow(e: MouseEvent) {
      if (this.readonly) return
      this.$emit("context-menu", { clientX: (e as any).clientX, clientY: (e as any).clientY, type: "row", staffId: this.staff.id })
    },
    onContextTask(task: Task, e?: MouseEvent) {
      if (this.readonly) return
      const clientX = e ? (e as any).clientX : 0
      const clientY = e ? (e as any).clientY : 0
      this.$emit("context-menu", { clientX, clientY, type: "task", staffId: this.staff.id, taskId: task.id })
    },
    openEditTask(task: Task) {
      if (this.readonly) return
      return console.log(task)
      this.$emit("open-edit-task", task)
    },
    onUpdateTaskName(task: Task, newName: string) {
      this.$emit("update-task", this.staff.id, task.id, { name: newName })
    },
    onResizeStart(e: MouseEvent, dir: "left" | "right", task: Task) {
      if (this.readonly) return
      this.$emit("resize-start", e, dir, task, this.staff.id)
    },
    onTaskMouseDown(e: MouseEvent, task: Task) {
      if (this.readonly) return
      this.$emit("task-mouse-down", task, this.staff.id, e)
    },
    onGridDblClick(e: MouseEvent) {
      if (this.readonly) return
      if ((e.target as HTMLElement).closest(".task-card")) return
      const rowRect = (this.$el as HTMLElement).getBoundingClientRect()
      const timelineLeft = rowRect.left + 260
      const relativeX = e.clientX - timelineLeft
      let d: Date
      if (this.viewMode === "month") {
        const baseDate = this.headers && this.headers.length > 0 ? new Date(this.headers[0].date) : new Date(this.viewStartDate as Date)
        baseDate.setHours(0, 0, 0, 0)
        const baseStartMs = baseDate.getTime()
        const daysOffset = Math.floor((this.scrollX + relativeX) / this.dayWidth)
        d = new Date(baseStartMs + daysOffset * 86400000)
      } else {
        const timelineWidth = Math.max(1, rowRect.width - 260)
        const msPerPixel = this.viewDurationMs / timelineWidth
        const startMs = (this.viewStartDate as Date).getTime()
        const newStart = startMs + relativeX * msPerPixel
        d = new Date(newStart)
      }
      d.setHours(0, 0, 0, 0)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      const dateStr = `${y}-${m}-${day}`
      this.$emit("add-task-at", this.staff.id, dateStr)
    },
    isConflict(t: Task): boolean {
      const startA = new Date(t.startDate).getTime()
      const endA = startA + t.duration * 86400000
      return this.staff.tasks.some(
        x =>
          x.id !== t.id &&
          (() => {
            const startB = new Date(x.startDate).getTime()
            const endB = startB + x.duration * 86400000
            return Math.max(startA, startB) < Math.min(endA, endB)
          })()
      )
    },
    displyEndDate(startDate: string, duration: number) {
      const dEnd = new Date(startDate)
      dEnd.setDate(dEnd.getDate() + duration)
      return `${dEnd.getFullYear()}-${String(dEnd.getMonth() + 1).padStart(2, "0")}-${String(dEnd.getDate()).padStart(2, "0")}`
    },
    onTaskEditingStart() {
      this.$emit("task-edit-start")
    },
    onTaskEditingEnd() {
      this.$emit("task-edit-end")
    },
  },
}
</script>

<style scoped></style>
