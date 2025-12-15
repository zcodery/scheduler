<template>
  <div :data-staff-id="staff.id" class="flex border-b border-gray-100 bg-white transition-all duration-300 ease-in-out" :style="dynamicStyle">
    <div class="flex-shrink-0 p-4 border-r border-gray-200 flex flex-col justify-center select-none bg-white relative group z-20 transition-colors hover:bg-gray-50/50" :style="{ width: sidebarWidth + 'px' }" @contextmenu.prevent="onContextStaff" @mousedown.stop="onSidebarMouseDown" @click.stop>
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

    <div class="flex-1 relative overflow-hidden bg-white" ref="timeline" @contextmenu.prevent="onContextRow">
      <div class="relative h-full" :style="{ width: viewMode === 'month' ? headers.length * dayWidth + 'px' : headers.length * MONTH_COLUMN_PX + 'px', transform: `translateX(${-scrollX}px)`, willChange: 'transform' }">
        <div class="absolute inset-0 grid pointer-events-none" :style="{ gridTemplateColumns: viewMode === 'month' ? `repeat(${headers.length}, ${dayWidth}px)` : `repeat(${headers.length}, ${MONTH_COLUMN_PX}px)` }">
          <div v-for="(h, i) in headers" :key="i" :class="['border-r border-gray-100 h-full', h.isToday ? 'bg-blue-50/60' : h.isWeekend ? 'bg-gray-50/80' : '']"></div>
        </div>
        <div v-show="!staff.isCollapsed" class="relative w-full h-full pt-3 pb-2" @dblclick="onGridDblClick">
          <div v-for="t in visibleTasks" :key="t.id" class="absolute z-10" :style="taskStyle(t)">
            <TaskCard :task="t" :viewMode="viewMode" :readonly="readonly" :conflict="isConflict(t)" @dblclick.native="openEditTask(t)" @contextmenu.native.prevent="onContextTask(t, $event)" @update="onUpdateTaskName" @resize-start="onResizeStart" @mouse-down="onTaskMouseDown" @mouse-move="onTaskMouseMove" @mouse-leave="onTaskMouseLeave" @editing-start="onTaskEditingStart" @editing-end="onTaskEditingEnd" />
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
import TaskCard from "./TaskCard.vue"
import { Staff, Task, DayInfo, ViewMode } from "../types"
import { AVATAR_COLOR_CLASSES, SIDEBAR_WIDTH, ONE_DAY_MS, MONTH_COLUMN_PX } from "../utils/constants"
import { rgbTextToHex, luminance, calcEnd, parseDateStr } from "../utils/index"

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
    dragState: { type: Object as () => { taskId: string; staffId: string; type: "move" | "resize"; dateStr?: string; duration?: number; rowOffset?: number } | null, required: false, default: null },
    visibleLeftDate: { type: Date, required: true },
    visibleRightDate: { type: Date, required: true },
  },
  data() {
    return { editingField: null as null | "name" }
  },
  computed: {
    visibleTasks(): Task[] {
      const left = this.visibleLeftDate ? this.visibleLeftDate.getTime() : 0
      const right = this.visibleRightDate ? this.visibleRightDate.getTime() : left
      return (this.staff.tasks || []).filter(t => {
        const start = parseDateStr(t.startDate).getTime()
        const end = start + t.duration * ONE_DAY_MS
        return end >= left && start < right
      })
    },
    rangeDays(): number {
      if (!this.headers || this.headers.length === 0) return 0
      const start = new Date(this.headers[0].date).getTime()
      const end = new Date(this.headers[this.headers.length - 1].date).getTime()
      const days = Math.max(1, Math.round((end - start) / ONE_DAY_MS) + 1)
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
    sidebarWidth(): number {
      return SIDEBAR_WIDTH
    },
    MONTH_COLUMN_PX(): number {
      return MONTH_COLUMN_PX
    },
  },
  methods: {
    calcEnd,
    onTaskMouseMove(payload: { clientX: number; clientY: number; task: Task; rect: DOMRect }) {
      if (!this.readonly) return
      this.$emit("task-mouse-move", { ...payload, staffId: this.staff.id })
    },
    onTaskMouseLeave() {
      this.$emit("task-mouse-leave")
    },
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
        px += MONTH_COLUMN_PX
        cur.setMonth(cur.getMonth() + 1)
      }
      const dim = this.daysInMonth(cur)
      const dayIndex = Math.max(0, Math.min(dim - 1, d.getDate() - 1))
      px += dayIndex * (MONTH_COLUMN_PX / dim)
      return px
    },
    taskStyle(task: Task) {
      const isDraggingThis = this.dragState && this.dragState.staffId === this.staff.id && this.dragState.taskId === task.id
      const startStr = isDraggingThis && this.dragState!.dateStr ? this.dragState!.dateStr! : task.startDate
      const durationVal = isDraggingThis && this.dragState!.duration != null ? this.dragState!.duration! : task.duration
      const rowOffsetVal = isDraggingThis && this.dragState!.rowOffset != null ? this.dragState!.rowOffset! : task.rowOffset || 0
      const sDate = parseDateStr(startStr)
      sDate.setHours(0, 0, 0, 0)
      const start = sDate.getTime()
      const startOffset = start - this.viewStartDate.getTime()
      const topOffset = rowOffsetVal * 36
      if (this.viewMode === "year") {
        const leftPx = this.dateToPixelYear(sDate)
        const end = new Date(sDate)
        end.setDate(end.getDate() + durationVal)
        const rightPx = this.dateToPixelYear(end)
        const widthPx = Math.max(1, rightPx - leftPx)
        return { transform: `translate3d(${leftPx}px, ${12 + topOffset}px, 0)`, width: `${widthPx}px`, willChange: "transform" }
      }
      if (this.viewMode === "month" || this.viewMode === "quarter") {
        const baseDate = this.headers && this.headers.length > 0 ? new Date(this.headers[0].date) : new Date(this.viewStartDate)
        baseDate.setHours(0, 0, 0, 0)
        const baseStartMs = baseDate.getTime()
        const leftPx = ((start - baseStartMs) / 86400000) * this.dayWidth
        const widthPx = Math.max(1, durationVal * this.dayWidth)
        return { transform: `translate3d(${leftPx}px, ${12 + topOffset}px, 0)`, width: `${widthPx}px`, willChange: "transform" }
      }
      const durationMs = durationVal * 86400000
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
      const timelineLeft = rowRect.left + this.sidebarWidth
      const relativeX = e.clientX - timelineLeft
      let d: Date
      if (this.viewMode === "year" && this.headers && this.headers.length > 0) {
        const x = Math.max(0, this.scrollX + relativeX)
        const monthIndex = Math.min(this.headers.length - 1, Math.floor(x / MONTH_COLUMN_PX))
        const monthStart = new Date(this.headers[monthIndex].date)
        const dim = this.daysInMonth(monthStart)
        const within = x - monthIndex * MONTH_COLUMN_PX
        const dayOffset = Math.max(0, Math.floor(within / (MONTH_COLUMN_PX / dim)))
        d = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1)
        d.setDate(d.getDate() + dayOffset)
      } else if (this.viewMode === "month" || this.viewMode === "quarter") {
        const baseDate = this.headers && this.headers.length > 0 ? new Date(this.headers[0].date) : new Date(this.viewStartDate as Date)
        baseDate.setHours(0, 0, 0, 0)
        const baseStartMs = baseDate.getTime()
        const daysOffset = Math.floor((this.scrollX + relativeX) / this.dayWidth)
        d = new Date(baseStartMs + daysOffset * ONE_DAY_MS)
      } else {
        const timelineWidth = Math.max(1, rowRect.width - this.sidebarWidth)
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
      const endA = startA + t.duration * ONE_DAY_MS
      return this.staff.tasks.some(
        x =>
          x.id !== t.id &&
          (() => {
            const startB = parseDateStr(x.startDate).getTime()
            const endB = startB + x.duration * ONE_DAY_MS
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
