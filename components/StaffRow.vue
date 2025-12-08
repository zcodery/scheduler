<template>
  <div :data-staff-id="staff.id" class="flex border-b border-gray-100 bg-white transition-all duration-300 ease-in-out" :style="dynamicStyle">
    <div class="flex-shrink-0 p-4 border-r border-gray-200 flex flex-col justify-center select-none bg-white relative group z-20 transition-colors hover:bg-gray-50/50" style="width: 260px" @contextmenu.prevent="onContextStaff" @mousedown.stop="onSidebarMouseDown" @click.stop>
      <div class="absolute left-1 top-1/2 -translate-y-1/2 text-gray-300 p-1 opacity-0 group-hover:opacity-100 rs-staff-handle">≡</div>
      <div class="flex items-center gap-3 pl-4">
        <i class="text-xs text-gray-400 hover:text-gray-600 cursor-pointer" :class="[staff.isCollapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-down']" @click="$emit('update-staff', staff.id, { isCollapsed: !staff.isCollapsed })"></i>
        <slot name="avatar" :staff="staff">
          <img v-if="staff.avatar" :src="staff.avatar" :alt="staff.name" class="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 select-none" />
          <div v-else :class="avatarClass" :style="avatarStyle" @click.stop="cycleAvatarColor">{{ staff.name.charAt(0) }}</div>
        </slot>
        <div class="flex-1 min-w-0">
          <div v-if="editingField === 'name'" class="w-full">
            <el-input ref="nameInput" autofocus size="mini" v-model="staff.name" @blur="saveEdit('name', $event)" @keydown.enter.prevent="blurInput" />
          </div>
          <div v-else class="text-sm font-bold text-gray-900 truncate cursor-pointer" @dblclick="startEdit('name')" @click.stop="emitFocus">{{ staff.name }}</div>
          <slot name="staffDescription" :staff="staff"></slot>
        </div>
      </div>
      <slot name="workload" v-if="!staff.isCollapsed" :staff="staff"></slot>
    </div>

    <div class="flex-1 relative overflow-hidden bg-white" @contextmenu.prevent="onContextRow">
      <div class="relative h-full" :style="{ width: viewMode === 'month' ? headers.length * dayWidth + 'px' : headers.length * 120 + 'px', transform: `translateX(${-scrollX}px)`, willChange: 'transform' }">
        <div class="absolute inset-0 grid pointer-events-none" :style="{ gridTemplateColumns: viewMode === 'month' ? `repeat(${headers.length}, ${dayWidth}px)` : `repeat(${headers.length}, 120px)` }">
          <div v-for="(h, i) in headers" :key="i" :class="['border-r border-gray-100 h-full', h.isToday ? 'bg-blue-50/60' : h.isWeekend ? 'bg-gray-50/80' : '']"></div>
        </div>
        <div v-show="!staff.isCollapsed" class="relative w-full h-full pt-3 pb-2" @dblclick="onGridDblClick">
          <div v-for="t in staff.tasks" :key="t.id" class="absolute z-10" :style="taskStyle(t)">
            <el-popover trigger="hover" popper-class="rs-nopadding" :visible-arrow="false" :disabled="!readonly">
              <div class="bg-gray-900 text-white text-xs px-2 py-1.5 rounded">
                <div>开始: {{ t.startDate }}</div>
                <div>结束: {{ calcEnd(t.startDate, t.duration) }}</div>
                <div>工期: {{ t.duration }} 天</div>
              </div>
              <TaskCard slot="reference" :task="t" :viewMode="viewMode" :readonly="readonly" :conflict="isConflict(t)" @dblclick.native="openEditTask(t)" @contextmenu.native.prevent="onContextTask(t, $event)" @update="onUpdateTaskName" @resize-start="onResizeStart" @mouse-down="onTaskMouseDown" @editing-start="onTaskEditingStart" @editing-end="onTaskEditingEnd" />
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
import { AVATAR_COLOR_CLASSES } from "../utils/constants"
import { rgbTextToHex, luminance, calcEnd, parseDateStr } from "../utils"

export default {
  components: { TaskCard },
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
    return { editingField: null as null | "name" }
  },
  computed: {
    rangeDays(): number {
      if (!this.headers || this.headers.length === 0) return 0
      const start = new Date(this.headers[0].date).getTime()
      const end = new Date(this.headers[this.headers.length - 1].date).getTime()
      const days = Math.max(1, Math.round((end - start) / 86400000) + 1)
      return days
    },
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
      const hex = bg.startsWith("rgb") ? rgbTextToHex(bg) : bg
      const l = luminance(hex)
      const color = l > 0.6 ? "#1f2937" : "#ffffff"
      return { backgroundColor: hex, color }
    },
  },
  methods: {
    calcEnd,
    onSidebarMouseDown(e: MouseEvent) {
      return
    },
    daysInMonth(d: Date): number {
      return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    },
    dateToPixelYear(d: Date): number {
      if (!this.headers || this.headers.length === 0) return 0
      const base = new Date(this.headers[0].date)
      let px = 0
      let cur = new Date(base)
      while (cur.getFullYear() < d.getFullYear() || cur.getMonth() < d.getMonth()) {
        px += 120
        cur.setMonth(cur.getMonth() + 1)
      }
      const dim = this.daysInMonth(cur)
      const dayIndex = Math.max(0, Math.min(dim - 1, d.getDate() - 1))
      px += dayIndex * (120 / dim)
      return px
    },
    taskStyle(task: Task) {
      const sDate = parseDateStr(task.startDate)
      sDate.setHours(0, 0, 0, 0)
      const start = sDate.getTime()
      const startOffset = start - this.viewStartDate.getTime()
      const topOffset = (task.rowOffset || 0) * 36
      if (this.viewMode === "year") {
        const leftPx = this.dateToPixelYear(sDate)
        const end = new Date(sDate)
        end.setDate(end.getDate() + task.duration)
        const rightPx = this.dateToPixelYear(end)
        const widthPx = Math.max(1, rightPx - leftPx)
        return { left: `${leftPx}px`, width: `${widthPx}px`, top: `${12 + topOffset}px` }
      }
      if (this.viewMode === "month" || this.viewMode === "quarter") {
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
    startEdit(field: "name") {
      if (this.readonly) return
      this.$emit("focus-staff", this.staff.id)
      this.editingField = field
      this.$nextTick(() => {
        const r = (this.$refs as any).nameInput
        if (r && typeof r.focus === "function") r.focus()
      })
    },
    blurInput(e: Event) {
      ;(e.target as HTMLInputElement).blur()
    },
    saveEdit(field: "name", e: any) {
      const v = String(e.target.value || "").trim()
      if (v) this.$emit("update-staff", this.staff.id, { name: v })
      this.editingField = null
    },
    emitFocus() {
      this.$emit("focus-staff", this.staff.id)
    },
    cycleAvatarColor() {
      if (this.staff.avatar) return
      const colors = AVATAR_COLOR_CLASSES
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
      if (this.viewMode === "year" && this.headers && this.headers.length > 0) {
        const x = Math.max(0, this.scrollX + relativeX)
        const monthIndex = Math.min(this.headers.length - 1, Math.floor(x / 120))
        const monthStart = new Date(this.headers[monthIndex].date)
        const dim = this.daysInMonth(monthStart)
        const within = x - monthIndex * 120
        const dayOffset = Math.max(0, Math.floor(within / (120 / dim)))
        d = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1)
        d.setDate(d.getDate() + dayOffset)
      } else if (this.viewMode === "month" || this.viewMode === "quarter") {
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
      const startA = parseDateStr(t.startDate).getTime()
      const endA = startA + t.duration * 86400000
      return this.staff.tasks.some(
        x =>
          x.id !== t.id &&
          (() => {
            const startB = parseDateStr(x.startDate).getTime()
            const endB = startB + x.duration * 86400000
            return Math.max(startA, startB) < Math.min(endA, endB)
          })()
      )
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

<style scoped>
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}
.relative {
  position: relative;
}
.absolute {
  position: absolute;
}
.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.left-1 {
  left: 0.25rem;
}
.top-1\/2 {
  top: 50%;
}
.-translate-y-1\/2 {
  transform: translateY(-50%);
}
.grid {
  display: grid;
}
.pointer-events-none {
  pointer-events: none;
}
.pointer-events-auto {
  pointer-events: auto;
}
.overflow-hidden {
  overflow: hidden;
}

.flex-1 {
  flex: 1 1 auto;
}
.flex-shrink-0 {
  flex-shrink: 0;
}
.min-w-0 {
  min-width: 0;
}

.p-1 {
  padding: 0.25rem;
}
.p-3 {
  padding: 0.75rem;
}
.p-4 {
  padding: 1rem;
}
.pl-4 {
  padding-left: 1rem;
}
.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.py-1\.5 {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
}
.pt-3 {
  padding-top: 0.75rem;
}
.pb-2 {
  padding-bottom: 0.5rem;
}
.ml-2 {
  margin-left: 0.5rem;
}
.gap-3 {
  gap: 0.75rem;
}
.gap-2 {
  gap: 0.5rem;
}

.w-full {
  width: 100%;
}
.w-10 {
  width: 2.5rem;
}
.h-full {
  height: 100%;
}
.h-10 {
  height: 2.5rem;
}

.border {
  border-width: 1px;
  border-style: solid;
  border-color: #e5e7eb;
}
.border-b {
  border-bottom-width: 1px;
  border-bottom-style: solid;
}
.border-r {
  border-right-width: 1px;
  border-right-style: solid;
}
.border-gray-100 {
  border-color: #f3f4f6;
}
.border-gray-200 {
  border-color: #e5e7eb;
}
.rounded {
  border-radius: 0.25rem;
}
.rounded-full {
  border-radius: 9999px;
}

.bg-white {
  background: #ffffff;
}
.bg-gray-50 {
  background: #f9fafb;
}
.bg-white\/80 {
  background: rgba(255, 255, 255, 0.8);
}
.bg-blue-50\/60 {
  background: rgba(239, 246, 255, 0.6);
}
.bg-gray-50\/80 {
  background: rgba(249, 250, 251, 0.8);
}
.bg-gray-200\/50 {
  background: rgba(229, 231, 235, 0.5);
}
.bg-gray-900 {
  background: #111827;
}

.text-xs {
  font-size: 12px;
}
.text-sm {
  font-size: 14px;
}
.font-bold {
  font-weight: 700;
}
.font-medium {
  font-weight: 500;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.select-none {
  user-select: none;
}
.cursor-pointer {
  cursor: pointer;
}
.text-white {
  color: #ffffff;
}
.text-gray-900 {
  color: #111827;
}
.text-gray-700 {
  color: #374151;
}
.text-gray-500 {
  color: #6b7280;
}
.text-gray-400 {
  color: #9ca3af;
}
.text-gray-300 {
  color: #d1d5db;
}

.opacity-0 {
  opacity: 0;
}
.z-10 {
  z-index: 10;
}
.z-20 {
  z-index: 20;
}

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
.transition-all {
  transition: all 0.3s ease-in-out;
}
.duration-300 {
  transition-duration: 300ms;
}
.ease-in-out {
  transition-timing-function: ease-in-out;
}
.hover\:bg-gray-50\/50:hover {
  background-color: rgba(249, 250, 251, 0.5);
}
.hover\:text-gray-600:hover {
  color: #4b5563;
}
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.object-cover {
  object-fit: cover;
}
.rounded-full {
  border-radius: 9999px;
}
.rs-toggle {
  background: transparent;
  border: none;
  padding: 0;
}
.rs-toggle:focus {
  outline: none;
}
</style>
