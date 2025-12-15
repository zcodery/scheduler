<template>
  <div class="bg-white text-slate-800 flex flex-col select-none overflow-hidden" @mousemove="onGlobalMouseMove" @mouseup="onGlobalMouseUp" @mouseleave="onGlobalMouseUp">
    <EditTaskModal :isOpen="editModal.isOpen" :task="editModal.task" @close="editModal.isOpen = false" @save="onSaveTask" />
    <EditStaffModal :isOpen="editStaffModal.isOpen" :staff="editStaffModal.staff" :staffConfig="staffConfig" @close="editStaffModal.isOpen = false" @save="onSaveStaff" />

    <div v-if="tooltip && tooltip.visible" ref="tooltipRef" class="fixed z-[9999] bg-gray-900 text-white text-xs px-2 py-1.5 rounded shadow-lg pointer-events-none space-y-0.5" :style="tooltipStyle">
      <slot name="tooltip" :task="tooltipTask">
        <div>名称: {{ tooltipTask && tooltipTask.name }}</div>
        <div>开始: {{ tooltipTask && tooltipTask.startDate }}</div>
        <div>结束: {{ tooltipTask && tooltipTask.endDate }}</div>
        <div>工期: {{ tooltipTask && tooltipTask.duration }} 天</div>
      </slot>
    </div>

    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white z-50 relative shadow-sm flex-shrink-0 flex-wrap">
      <div>
        <slot name="title">
          <h1 class="text-xl font-bold text-gray-900 flex gap-1 items-center my-0">
            <span>{{ title }}</span>
            <i v-if="readonly" class="el-icon-lock text-sm"></i>
          </h1>
        </slot>
        <slot name="description">
          <span class="text-xs text-gray-500">{{ description }}</span>
        </slot>
      </div>
      <div class="flex items-center gap-4">
        <el-button-group>
          <el-button v-for="m in viewModes" :key="m" size="mini" :type="viewMode === m ? 'primary' : 'default'" @click="viewMode = m">{{ modeLabel(m) }}视图</el-button>
        </el-button-group>
        <div class="rs-navbox">
          <i class="el-icon-arrow-left text-sm cursor-pointer hover:text-orange-600" @click="nav('prev')"></i>
          <span class="rs-navbox-label">{{ currentLabel }}</span>
          <i class="el-icon-arrow-right text-sm cursor-pointer hover:text-orange-600" @click="nav('next')"></i>
        </div>

        <div class="flex items-center gap-2">
          <el-dropdown @command="onToolbarCommand">
            <el-button size="mini" type="primary">
              操作
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="today" icon="el-icon-place">定位今天</el-dropdown-item>
              <el-dropdown-item command="collapse" icon="el-icon-minus">折叠全部</el-dropdown-item>
              <el-dropdown-item command="expand" icon="el-icon-plus">展开全部</el-dropdown-item>
              <el-dropdown-item command="jump-left" icon="el-icon-d-arrow-left">跳到左侧数据</el-dropdown-item>
              <el-dropdown-item command="jump-right" icon="el-icon-d-arrow-right">跳到右侧数据</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <slot name="extra"></slot>
        </div>
      </div>
    </div>

    <div ref="containerRef" class="flex-1 overflow-y-auto overflow-x-hidden relative" @mousedown="onPanMouseDown" @contextmenu.prevent @wheel="onWheel">
      <div class="sticky top-0 z-40 flex border-b border-gray-200 bg-gray-50 shadow-sm header-row">
        <div class="flex-shrink-0 p-4 border-r border-gray-200 text-xs font-semibold text-gray-500 flex items-center bg-gray-50" :style="{ width: consts.SIDEBAR_WIDTH + 'px' }" @contextmenu.prevent="onHeaderSidebarContext" @mousedown.stop>人员 / 饱和度</div>
        <div class="flex-1 overflow-hidden">
          <div
            class="grid"
            :style="{
              gridTemplateColumns: viewMode === 'month' ? `repeat(${headers.length}, ${consts.DAY_CELL_PX}px)` : `repeat(${headers.length}, ${consts.MONTH_COLUMN_PX}px)`,
              width: viewMode === 'month' ? headers.length * consts.DAY_CELL_PX + 'px' : headers.length * consts.MONTH_COLUMN_PX + 'px',
              transform: `translateX(${-scrollX}px)`,
              willChange: 'transform',
              height: '100%',
            }"
          >
            <div v-for="(h, i) in headers" :key="i" :class="['flex flex-col items-center justify-center py-2 border-r border-gray-200 text-xs', h.isToday ? 'bg-blue-100/50' : h.isWeekend ? 'bg-gray-200/50' : '']">
              <span :class="['font-medium whitespace-nowrap', h.isToday ? 'text-blue-600' : 'text-gray-700']">{{ h.label }}</span>
              <span class="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{{ h.subLabel }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="relative">
        <draggable v-model="staffData" item-key="id" :disabled="readonly || isEditingTask" handle=".rs-staff-handle" :animation="150">
          <div :style="{ height: topSpacerHeight + 'px' }"></div>
          <StaffRow v-for="s in visibleStaffs" :key="s.id" :staff="s" :headers="headers" :viewStartDate="headers.length ? new Date(headers[0].date) : new Date(viewStartDate)" :viewDurationMs="viewDurationMs" :viewMode="viewMode" :readonly="readonly" :dayWidth="effectiveDayWidth" :scrollX="scrollX" :dragState="dragState" :visibleLeftDate="visibleLeftDate" :visibleRightDate="visibleRightDate" @context-menu="onContextMenu" @update-task="updateTask" @open-edit-task="openEditTask(s)" @open-edit-staff="openEditStaff(s)" @resize-start="handleResizeStart" @task-mouse-down="handleTaskMouseDown" @task-mouse-move="onTaskMouseMove" @task-mouse-leave="onTaskMouseLeave" @update-staff="updateStaff" @add-task-at="addTaskAtDate" @focus-staff="focusStaff" @task-edit-start="onTaskEditStart" @task-edit-end="onTaskEditEnd">
            <template #avatar="{ staff }"><slot name="avatar" :staff="staff"></slot></template>
            <template #workload="{ staff }"><slot name="workloadBar" :staff="staff"></slot></template>
            <template #staffDescription="{ staff }"><slot name="staffDescription" :staff="staff"></slot></template>
            <template #tooltip="{ task }"><slot name="tooltip" :task="task"></slot></template>
          </StaffRow>
          <div :style="{ height: bottomSpacerHeight + 'px' }"></div>
        </draggable>
        <div v-if="quickJumpDir" class="fixed top-1/2 -translate-y-1/2 z-50 pointer-events-none flex justify-between px-6" :style="jumpOverlayStyle">
          <el-button v-if="quickJumpDir === 'left'" type="primary" plain circle icon="el-icon-d-arrow-left" class="pointer-events-auto" @click="jumpToData('right')"></el-button>
          <div class="flex-1"></div>
          <el-button v-if="quickJumpDir === 'right'" type="primary" plain circle icon="el-icon-d-arrow-right" class="pointer-events-auto" @click="jumpToData('left')"></el-button>
        </div>
        <div class="h-[100px]" @click="contextMenu = null"></div>
      </div>

      <div v-if="contextMenu && menuVisible" ref="contextMenuRef" class="fixed z-[1000]" :style="{ left: (contextMenu.clientX || 0) + 2 + 'px', top: (contextMenu.clientY || 0) + 2 + 'px' }">
        <div class="rs-menu">
          <template v-if="contextMenu.type === 'general'">
            <div class="rs-item" @click="ctxAddStaff">
              <i class="el-icon-plus"></i>
              <span>新增人员</span>
            </div>
          </template>
          <template v-else-if="contextMenu.type === 'staff' && contextMenu.staffId">
            <div class="rs-item" @click="ctxOpenEditStaff">
              <i class="el-icon-edit"></i>
              <span>编辑人员</span>
            </div>
            <div class="rs-item" @click="ctxFocusStaff">
              <i class="el-icon-location"></i>
              <span>定位到人员</span>
            </div>
            <div class="rs-item" @click="ctxToggleCollapse">
              <i class="el-icon-menu"></i>
              <span>{{ staffCollapseLabel() }}</span>
            </div>
            <div class="rs-sep"></div>
            <div class="rs-item" @click="ctxAddTask">
              <i class="el-icon-plus"></i>
              <span>新增任务</span>
            </div>
            <div class="rs-sep"></div>
            <div class="rs-item rs-item-danger" @click="ctxDeleteStaff">
              <i class="el-icon-delete"></i>
              <span>删除人员</span>
            </div>
          </template>
          <template v-else-if="contextMenu.type === 'row' && contextMenu.staffId">
            <div class="rs-item" @click="ctxAddTask">
              <i class="el-icon-plus"></i>
              <span>新增任务</span>
            </div>
          </template>
          <template v-else-if="contextMenu.type === 'task' && contextMenu.staffId && contextMenu.taskId">
            <div class="rs-item" @click="ctxOpenEditTask">
              <i class="el-icon-edit"></i>
              <span>编辑任务</span>
            </div>
            <div class="rs-item" @click="ctxDuplicateTask">
              <i class="el-icon-document-copy"></i>
              <span>复制任务</span>
            </div>
            <div class="rs-item" @click="ctxFocusTask">
              <i class="el-icon-location"></i>
              <span>定位到任务</span>
            </div>
            <div class="rs-sep"></div>
            <div class="rs-item" @click="ctxDurationPlus">
              <i class="el-icon-plus"></i>
              <span>工期 +1 天</span>
            </div>
            <div class="rs-item" @click="ctxDurationMinus">
              <i class="el-icon-minus"></i>
              <span>工期 -1 天</span>
            </div>
            <div class="rs-sep"></div>
            <div class="rs-item" :class="{ 'rs-item-disabled': !canMoveRowUp() }" @click="ctxMoveRowUp">
              <i class="el-icon-arrow-up"></i>
              <span>移到上一行</span>
            </div>
            <div class="rs-item" @click="ctxMoveRowDown">
              <i class="el-icon-arrow-down"></i>
              <span>移到下一行</span>
            </div>
            <div class="rs-sep"></div>
            <div class="rs-item rs-item-danger" @click="ctxDeleteTask">
              <i class="el-icon-delete"></i>
              <span>删除任务</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Staff, Task, ViewMode, DayInfo, TooltipState, EditTaskModalState, EditStaffModalState } from "./types"
import { WEEK_DAYS, SIDEBAR_WIDTH, ONE_DAY_MS, DAY_CELL_PX, MONTH_COLUMN_PX } from "./utils/constants"
import { calcEnd } from "./utils/index"
import StaffRow from "./children/StaffRow.vue"
import EditTaskModal from "./children/EditTaskModal.vue"
import EditStaffModal from "./children/EditStaffModal.vue"
import draggable from "vuedraggable"

export default {
  name: "gantt-scheduler",
  components: { StaffRow, EditTaskModal, EditStaffModal, draggable },
  props: {
    title: { type: String, default: "人员排期" },
    description: { type: String, default: "" },
    readonly: { type: Boolean, required: false, default: false },
    task: { type: Array as () => Staff[], required: true },
    staffConfig: { type: Array, default: () => [] },
    viewMode: { type: String, default: "month" },
  },
  data() {
    return {
      staffData: (this as any).task as Staff[],
      viewStartDate: new Date().setHours(0, 0, 0, 0) - 86400000 * 2,
      viewMode: (this as any).viewMode as ViewMode,
      scrollX: 0,
      consts: { ONE_DAY_MS, DAY_CELL_PX, MONTH_COLUMN_PX, SIDEBAR_WIDTH },
      dragState: null as null | { taskId: string; staffId: string; type: "move" | "resize"; dateStr?: string; duration?: number; rowOffset?: number },
      lastChangedStaff: {} as Staff,
      dragRaf: null as number | null,
      lastDragEvent: null as null | { clientX: number; clientY: number },
      visibleStartIndex: 0,
      visibleEndIndex: 20,
      overscanRows: 3,
      rowHeights: [] as number[],
      rowOffsets: [] as number[],
      headersStartDate: null as Date | null,
      headersEndDate: null as Date | null,
      tooltip: null as TooltipState | null,
      editModal: { isOpen: false, staffId: "", task: null } as EditTaskModalState,
      editStaffModal: { isOpen: false, staff: null } as EditStaffModalState,
      contextMenu: null as null | { x: number; y: number; type?: string; staffId?: string; taskId?: string },
      isPanning: false,
      panStartX: 0,
      panStartDate: 0,
      panStartScrollLeft: 0,
      interaction: null as null | { type: "resize" | "move"; taskId: string; staffId: string; direction?: "left" | "right"; initialDuration?: number; initialX: number; initialY: number; initialStartTime: number; initialRowOffset?: number; offsetMs?: number },
      autoScrollTimer: null as number | null,
      lastMouseX: 0,
      panRaf: null as number | null,
      lastPanDeltaX: 0,
      lastAnchorDays: 0,
      lastAnchorMonths: 0,
      ANCHOR_STEP_MONTHS: 2,
      adjustRangeTimer: null as number | null,
      ADJUST_DEBOUNCE_MS: 120,
      draggedStaffId: null as string | null,
      menuVisible: false,
      isEditingTask: false,
      hoverTask: null as Task | null,
    }
  },
  created() {
    this.initHeadersRange()
    this.lastAnchorDays = Math.floor(this.scrollX / this.effectiveDayWidth)
    this.lastAnchorMonths = Math.floor(this.scrollX / this.consts.MONTH_COLUMN_PX)
  },
  watch: {
    task: {
      deep: true,
      handler(val: Staff[]) {
        this.staffData = Array.isArray(val) ? [...val] : []
      },
    },
    staffData: {
      deep: true,
      handler(val: Staff[]) {
        const changedStaff = this.lastChangedStaff
        this.$emit("data-change", val, changedStaff)
        try {
          window.dispatchEvent(new CustomEvent("scheduler:data-change", { detail: { data: val, changedStaff } }))
        } catch {}
        this.computeRowMetrics()
        this.updateVisibleRange()
        this.lastChangedStaff = {} as Staff
      },
    },
    viewMode() {
      this.initHeadersRange()
      this.scrollX = 0
      this.lastAnchorDays = Math.floor(this.scrollX / this.effectiveDayWidth)
      this.lastAnchorMonths = Math.floor(this.scrollX / this.consts.MONTH_COLUMN_PX)
      this.scheduleAdjustRange(true)
    },
    scrollX() {
      if (this.viewMode === "month" && this.headersStartDate && this.headersEndDate) {
        const days = Math.floor(this.scrollX / this.effectiveDayWidth)
        if (this.isPanning && this.lastPanDeltaX < 0 && days < 0) {
          const visibleLeft = new Date(this.visibleLeftDate)
          const newStart = new Date(visibleLeft)
          newStart.setDate(newStart.getDate() - 30)
          const newEnd = new Date(visibleLeft)
          newEnd.setDate(newEnd.getDate() + 60)
          const oldStart = this.headersStartDate
          const diffDays = Math.round((newStart.getTime() - oldStart.getTime()) / this.consts.ONE_DAY_MS)
          if (diffDays !== 0) {
            this.headersStartDate = newStart
            this.headersEndDate = newEnd
            this.scrollX = this.scrollX - diffDays * this.consts.DAY_CELL_PX
            this.lastAnchorDays = days
            this.scheduleAdjustRange(true)
            return
          }
        }
      }
      this.scheduleAdjustRange(false)
    },
  },
  mounted() {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.contextMenu = null
        this.interaction = null
        this.tooltip = null
        document.body.classList.remove("resizing-left", "resizing-right")
        document.body.style.cursor = ""
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (this.contextMenu && this.contextMenu.type === "task" && this.contextMenu.staffId && this.contextMenu.taskId) {
          this.deleteTask(this.contextMenu.staffId, this.contextMenu.taskId)
        }
      }
    }
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      const menuEl = this.$refs.contextMenuRef as HTMLElement | undefined
      if (menuEl && (menuEl === target || menuEl.contains(target))) return
      this.menuVisible = false
      this.contextMenu = null
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onDocClick)
    const onDocMouseMove = (e: MouseEvent) => this.onGlobalMouseMove(e)
    document.addEventListener("mousemove", onDocMouseMove)
    ;(this as any)._onKey = onKey
    ;(this as any)._onDocClick = onDocClick
    ;(this as any)._onDocMouseMove = onDocMouseMove
    this.$nextTick(() => {
      this.computeRowMetrics()
      this.updateVisibleRange()
      const container = this.$refs.containerRef as HTMLDivElement
      if (container) container.addEventListener("scroll", this.onScrollUpdate)
    })
  },
  beforeDestroy() {
    const onKey = (this as any)._onKey as (e: KeyboardEvent) => void
    if (onKey) document.removeEventListener("keydown", onKey)
    const onDocClick = (this as any)._onDocClick as (e: MouseEvent) => void
    if (onDocClick) document.removeEventListener("mousedown", onDocClick)
    const onDocMouseMove = (this as any)._onDocMouseMove as (e: MouseEvent) => void
    if (onDocMouseMove) document.removeEventListener("mousemove", onDocMouseMove)
    if (this.adjustRangeTimer) {
      window.clearTimeout(this.adjustRangeTimer)
      this.adjustRangeTimer = null
    }
    const container = this.$refs.containerRef as HTMLDivElement
    if (container) container.removeEventListener("scroll", this.onScrollUpdate)
  },
  computed: {
    effectiveDayWidth(): number {
      return this.viewMode === "quarter" ? this.consts.MONTH_COLUMN_PX / 7 : this.viewMode === "year" ? this.consts.MONTH_COLUMN_PX / 30 : this.consts.DAY_CELL_PX
    },
    viewDurationMs(): number {
      if (this.viewMode === "month") return this.consts.ONE_DAY_MS * this.headers.length
      if (this.viewMode === "quarter") return this.consts.ONE_DAY_MS * 90
      return this.consts.ONE_DAY_MS * 365
    },
    headers(): DayInfo[] {
      const headers: DayInfo[] = []
      const startDate = new Date(this.viewStartDate)
      const isSameDay = (d1: Date, d2: Date) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
      const today = new Date()
      if (this.viewMode === "month") {
        const rangeStart = this.headersStartDate
          ? new Date(this.headersStartDate)
          : (() => {
              const b = new Date(startDate)
              b.setDate(1)
              b.setMonth(b.getMonth() - 1)
              return b
            })()
        const rangeEnd = this.headersEndDate
          ? new Date(this.headersEndDate)
          : (() => {
              const e = new Date(startDate)
              e.setMonth(e.getMonth() + 2)
              e.setDate(0)
              return e
            })()
        for (let d = new Date(rangeStart); d <= rangeEnd; ) {
          const dd = new Date(d)
          headers.push({ date: dd, label: `${dd.getMonth() + 1}月${dd.getDate()}`, subLabel: WEEK_DAYS[dd.getDay()], isToday: isSameDay(dd, today), isWeekend: dd.getDay() === 0 || dd.getDay() === 6 })
          d.setDate(d.getDate() + 1)
        }
      } else if (this.viewMode === "quarter") {
        const rangeStart = this.headersStartDate
          ? new Date(this.headersStartDate)
          : (() => {
              const b = new Date(startDate)
              b.setDate(b.getDate() - 30)
              return b
            })()
        const rangeEnd = this.headersEndDate
          ? new Date(this.headersEndDate)
          : (() => {
              const e = new Date(startDate)
              e.setDate(e.getDate() + 60)
              return e
            })()
        let d = new Date(rangeStart)
        const day = d.getDay()
        const delta = (((4 - day) % 7) + 7) % 7
        d.setDate(d.getDate() + delta)
        for (; d <= rangeEnd; d.setDate(d.getDate() + 7)) {
          const weekStart = new Date(d)
          const weekEnd = new Date(d)
          weekEnd.setDate(weekEnd.getDate() + 6)
          const sub = `${weekStart.getMonth() + 1}/${weekStart.getDate()} ~ ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`
          const dd = new Date(d)
          const inWeek = today.getTime() >= weekStart.getTime() && today.getTime() <= weekEnd.getTime()
          headers.push({ date: dd, label: `Q${Math.floor(dd.getMonth() / 3) + 1}/W${Math.ceil(dd.getDate() / 7)}`, subLabel: sub, isToday: inWeek, isWeekend: false })
        }
      } else {
        const container = this.$refs.containerRef as HTMLDivElement
        const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
        const viewportMonths = Math.max(1, Math.ceil(viewport / this.consts.MONTH_COLUMN_PX))
        const startCandidate = this.headersStartDate
          ? new Date(this.headersStartDate)
          : (() => {
              const b = new Date(startDate)
              b.setDate(1)
              b.setMonth(b.getMonth() - 3)
              return b
            })()
        const endCandidate = this.headersEndDate
          ? new Date(this.headersEndDate)
          : (() => {
              const e = new Date(startDate)
              e.setDate(1)
              e.setMonth(e.getMonth() + viewportMonths + 3)
              return e
            })()
        const rangeStart = new Date(startCandidate.getFullYear(), startCandidate.getMonth(), 1)
        const rangeEnd = new Date(endCandidate.getFullYear(), endCandidate.getMonth() + 1, 0)
        for (let d = new Date(rangeStart); d <= rangeEnd; ) {
          const dd = new Date(d)
          headers.push({ date: dd, label: `${dd.getMonth() + 1}月`, subLabel: `${dd.getFullYear()}`, isToday: dd.getMonth() === today.getMonth() && dd.getFullYear() === today.getFullYear(), isWeekend: false })
          d.setMonth(d.getMonth() + 1)
        }
      }
      return headers
    },
    headersStartMs(): number {
      return this.headers && this.headers.length > 0 ? this.headers[0].date.getTime() : this.viewStartDate
    },
    tooltipTask(): Task | null {
      if (this.hoverTask) {
        const t = this.hoverTask
        const start = this.tooltip && this.tooltip.startDate ? this.tooltip.startDate : t.startDate
        const dur = this.tooltip && this.tooltip.duration ? this.tooltip.duration : t.duration
        return { ...t, startDate: start, duration: dur, endDate: calcEnd(start, dur) }
      }
      const sid = this.dragState && this.dragState.staffId
      const tid = this.dragState && this.dragState.taskId
      if (!sid || !tid) return null
      const s = this.staffData.find(x => x.id === sid)
      const t = s && s.tasks.find(y => y.id === tid)
      if (!t) return null
      const start = this.tooltip && this.tooltip.startDate ? this.tooltip.startDate : t.startDate
      const dur = this.tooltip && this.tooltip.duration ? this.tooltip.duration : t.duration
      return { ...t, startDate: start, duration: dur, endDate: calcEnd(start, dur) }
    },
    tooltipStyle(): Record<string, string> {
      const tt = this.tooltip
      const offset = 15
      const margin = 8
      let x = (tt?.x || 0) + offset
      let y = (tt?.y || 0) + offset
      const container = this.$refs.containerRef as HTMLDivElement
      const tooltipEl = (this.$refs as any)?.tooltipRef as HTMLDivElement
      if (tt && container) {
        const rect = container.getBoundingClientRect()
        const leftBound = rect.left + this.consts.SIDEBAR_WIDTH + margin
        const rightBound = rect.left + Math.max(1, container.clientWidth) - margin
        const width = tooltipEl ? tooltipEl.offsetWidth : 220
        if (x + width > rightBound) x = rightBound - width
        if (x < leftBound) x = leftBound
        const height = tooltipEl ? tooltipEl.offsetHeight : 60
        const topBound = rect.top + margin
        const bottomBound = rect.top + Math.max(1, container.clientHeight) - height - margin
        if (y > bottomBound) y = bottomBound
        if (y < topBound) y = topBound
      }
      return { left: x + "px", top: y + "px" }
    },
    visibleLeftDate(): Date {
      if (this.viewMode === "year" && this.headers && this.headers.length > 0) {
        const startMonth = new Date(this.headers[0].date)
        let x = Math.max(0, this.scrollX)
        const monthIndex = Math.min(this.headers.length - 1, Math.floor(x / this.consts.MONTH_COLUMN_PX))
        const monthStart = new Date(this.headers[monthIndex].date)
        const dim = this.daysInMonth(monthStart)
        const within = x - monthIndex * this.consts.MONTH_COLUMN_PX
        const dayOffset = Math.max(0, Math.floor(within / (this.consts.MONTH_COLUMN_PX / dim)))
        const d = new Date(monthStart)
        d.setDate(d.getDate() + dayOffset)
        d.setHours(0, 0, 0, 0)
        return d
      }
      const start = this.headersStartDate ? new Date(this.headersStartDate) : new Date(this.viewStartDate)
      const days = Math.floor(this.scrollX / this.effectiveDayWidth)
      const d = new Date(start)
      d.setDate(d.getDate() + days)
      d.setHours(0, 0, 0, 0)
      return d
    },
    currentLabel(): string {
      if (this.viewMode === "month") {
        const d = new Date(this.visibleLeftDate)
        return `${d.getFullYear()}年 ${d.getMonth() + 1}月`
      }
      if (this.viewMode === "quarter") {
        const d = new Date(this.visibleLeftDate)
        const q = Math.floor(d.getMonth() / 3) + 1
        return `${d.getFullYear()}年 Q${q}`
      }
      const d = new Date(this.visibleLeftDate)
      return `${d.getFullYear()}年`
    },
    visibleRightDate(): Date {
      const container = this.$refs.containerRef as HTMLDivElement
      const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
      const visibleDays = Math.max(1, Math.floor(viewport / this.effectiveDayWidth))
      const d = new Date(this.visibleLeftDate)
      d.setDate(d.getDate() + visibleDays)
      d.setHours(0, 0, 0, 0)
      return d
    },
    viewModes(): ViewMode[] {
      return ["month", "quarter", "year"]
    },
    quickJumpDir(): "left" | "right" | null {
      return this.getQuickJumpDirection()
    },
    jumpOverlayStyle(): Record<string, string> {
      const container = this.$refs.containerRef as HTMLDivElement
      const rect = container ? container.getBoundingClientRect() : ({ left: 0, right: window.innerWidth } as any)
      void this.scrollX
      const left = rect.left + this.consts.SIDEBAR_WIDTH + 16
      const right = Math.max(0, window.innerWidth - rect.right)
      return { left: left + "px", right: right + "px" }
    },
    visibleStaffs(): Staff[] {
      const start = Math.max(0, Math.min(this.staffData.length, this.visibleStartIndex))
      const end = Math.max(start, Math.min(this.staffData.length, this.visibleEndIndex + 1))
      return this.staffData.slice(start, end)
    },
    topSpacerHeight(): number {
      const idx = Math.max(0, Math.min(this.rowOffsets.length - 1, this.visibleStartIndex))
      return this.rowOffsets[idx] || 0
    },
    bottomSpacerHeight(): number {
      const total = this.rowOffsets.length > 0 ? this.rowOffsets[this.rowOffsets.length - 1] + (this.rowHeights[this.rowHeights.length - 1] || 0) : 0
      const endIdx = Math.max(0, Math.min(this.rowOffsets.length - 1, this.visibleEndIndex))
      const renderedBottom = this.rowOffsets[endIdx] + (this.rowHeights[endIdx] || 0)
      const rem = Math.max(0, total - renderedBottom)
      return rem
    },
  },
  methods: {
    calcEnd,
    // 解析 YYYY-MM-DD 字符串为本地时区的 Date，避免跨月偏移
    parseDateStr(s: string): Date {
      const parts = String(s).split("-")
      const y = Number(parts[0] || 0)
      const m = Number(parts[1] || 1)
      const d = Number(parts[2] || 1)
      return new Date(y, Math.max(0, m - 1), Math.max(1, d))
    },
    // 将日期映射为横向像素位置，依据当前视图模式（月/季：按天；年：按月列+月内日宽）
    dateToPixel(date: Date): number {
      if (this.viewMode === "year" && this.headers && this.headers.length > 0) {
        const base = new Date(this.headers[0].date)
        let px = 0
        let cur = new Date(base)
        while (cur.getFullYear() < date.getFullYear() || cur.getMonth() < date.getMonth()) {
          px += this.consts.MONTH_COLUMN_PX
          cur.setMonth(cur.getMonth() + 1)
        }
        const dim = this.daysInMonth(cur)
        const dayIndex = Math.max(0, Math.min(dim - 1, date.getDate() - 1))
        px += dayIndex * (this.consts.MONTH_COLUMN_PX / dim)
        return px
      }
      if (this.headersStartDate) {
        const startMs = this.headersStartDate.getTime()
        const diffDays = Math.round((date.getTime() - startMs) / this.consts.ONE_DAY_MS)
        return Math.max(0, diffDays * this.effectiveDayWidth)
      }
      const msPerPixel = this.viewDurationMs / this.getTimelineWidth()
      return Math.max(0, (date.getTime() - this.viewStartDate) / msPerPixel)
    },
    onScrollUpdate() {
      this.updateVisibleRange()
    },
    computeRowMetrics() {
      const heights: number[] = []
      const offsets: number[] = []
      let acc = 0
      this.staffData.forEach(s => {
        const h = s.isCollapsed ? 64 : Math.max(128, ((s.tasks.length > 0 ? Math.max(...s.tasks.map(t => t.rowOffset)) : 0) + 2) * 36 + 20)
        heights.push(h)
        offsets.push(acc)
        acc += h
      })
      this.rowHeights = heights
      this.rowOffsets = offsets
    },
    updateVisibleRange() {
      const container = this.$refs.containerRef as HTMLDivElement
      const scrollTop = container ? container.scrollTop : 0
      const viewport = container ? container.clientHeight : window.innerHeight
      let start = 0
      for (let i = 0; i < this.rowOffsets.length; i++) {
        if (this.rowOffsets[i] + (this.rowHeights[i] || 0) >= scrollTop) {
          start = i
          break
        }
      }
      let end = start
      let y = this.rowOffsets[start] + (this.rowHeights[start] || 0)
      while (end + 1 < this.rowOffsets.length && y < scrollTop + viewport) {
        end++
        y += this.rowHeights[end] || 0
      }
      start = Math.max(0, start - this.overscanRows)
      end = Math.min(this.staffData.length - 1, end + this.overscanRows)
      this.visibleStartIndex = start
      this.visibleEndIndex = end
    },
    // 任务编辑开始：停止自动滚动并标记编辑状态
    onTaskEditStart() {
      this.stopAutoScroll()
      this.interaction = null
      this.isEditingTask = true
    },
    onTaskEditEnd() {
      this.stopAutoScroll()
      this.isEditingTask = false
    },
    // 预扩展左缓冲区：向左/右各扩展 30 天并同步滚动基准，防止临界自动滚动/拖拽时画面跳变
    preExtendLeftBuffer() {
      if (!this.headersStartDate || !this.headersEndDate) return
      const add = 30
      const ns = new Date(this.headersStartDate)
      ns.setDate(ns.getDate() - add)
      const ne = new Date(this.headersEndDate)
      ne.setDate(ne.getDate() + add)
      this.headersStartDate = ns
      this.headersEndDate = ne
      const px = add * this.effectiveDayWidth
      this.scrollX = this.scrollX + px
      if (this.isPanning) this.panStartScrollLeft = this.panStartScrollLeft + px
    },
    preExtendRightBuffer() {
      if (!this.headersStartDate || !this.headersEndDate) return
      const container = this.$refs.containerRef as HTMLDivElement
      const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
      const daysRange = Math.max(1, Math.round((this.headersEndDate.getTime() - this.headersStartDate.getTime()) / this.consts.ONE_DAY_MS) + 1)
      const contentWidth = daysRange * this.effectiveDayWidth
      const target = this.scrollX + viewport
      if (contentWidth - viewport >= target + 20) return
      const needPx = target + 20 + viewport - contentWidth
      const needDays = Math.max(1, Math.ceil(needPx / this.effectiveDayWidth))
      const ne = new Date(this.headersEndDate)
      ne.setDate(ne.getDate() + needDays)
      this.headersEndDate = ne
    },
    // 确保右侧容量：当目标滚动位置接近内容尾部时，按需扩展 headersEndDate 以避免到达边界
    ensureRightCapacity(nextRaw: number) {
      if (!this.headersStartDate || !this.headersEndDate) return
      const container = this.$refs.containerRef as HTMLDivElement
      const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
      const margin = 20
      let daysRange = Math.max(1, Math.round((this.headersEndDate.getTime() - this.headersStartDate.getTime()) / this.consts.ONE_DAY_MS) + 1)
      let contentWidth = daysRange * this.effectiveDayWidth
      if (contentWidth - viewport >= nextRaw + margin) return
      const needPx = nextRaw + margin + viewport - contentWidth
      const needDays = Math.max(1, Math.ceil(needPx / this.effectiveDayWidth))
      const ne = new Date(this.headersEndDate)
      ne.setDate(ne.getDate() + needDays)
      this.headersEndDate = ne
    },
    scheduleAdjustRange(force: boolean = false) {
      if (force) {
        if (this.adjustRangeTimer) {
          window.clearTimeout(this.adjustRangeTimer)
          this.adjustRangeTimer = null
        }
        this.adjustHeadersRange()
        return
      }
      if (this.adjustRangeTimer) window.clearTimeout(this.adjustRangeTimer)
      this.adjustRangeTimer = window.setTimeout(() => {
        this.adjustRangeTimer = null
        this.adjustHeadersRange()
      }, this.ADJUST_DEBOUNCE_MS)
    },
    initHeadersRange() {
      const base = new Date(this.viewStartDate)
      base.setHours(0, 0, 0, 0)
      if (this.viewMode === "month") {
        base.setDate(1)
        const prevFirst = new Date(base)
        prevFirst.setMonth(prevFirst.getMonth() - 1)
        prevFirst.setDate(1)
        const nextEnd = new Date(base)
        nextEnd.setMonth(nextEnd.getMonth() + 2)
        nextEnd.setDate(0)
        this.headersStartDate = prevFirst
        this.headersEndDate = nextEnd
        return
      }
      if (this.viewMode === "quarter") {
        const container = this.$refs.containerRef as HTMLDivElement
        const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
        const viewportDays = Math.max(1, Math.ceil(viewport / this.effectiveDayWidth))
        const prev = new Date(base)
        prev.setDate(prev.getDate() - 30)
        const next = new Date(base)
        next.setDate(next.getDate() + viewportDays + 30)
        this.headersStartDate = prev
        this.headersEndDate = next
        return
      }
      if (this.viewMode === "year") {
        const container = this.$refs.containerRef as HTMLDivElement
        const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
        const viewportMonths = Math.max(1, Math.ceil(viewport / this.consts.MONTH_COLUMN_PX))
        const prev = new Date(base)
        prev.setDate(1)
        prev.setMonth(prev.getMonth() - 3)
        const next = new Date(base)
        next.setDate(1)
        next.setMonth(next.getMonth() + viewportMonths + 3)
        this.headersStartDate = prev
        this.headersEndDate = next
        return
      }
      this.headersStartDate = null
      this.headersEndDate = null
    },
    daysInMonth(d: Date): number {
      return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    },
    adjustHeadersRange() {
      if (!this.headersStartDate || !this.headersEndDate) return
      const container = this.$refs.containerRef as HTMLDivElement
      const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
      if (this.viewMode === "year") {
        const viewportMonths = Math.max(1, Math.ceil(viewport / this.consts.MONTH_COLUMN_PX))
        const left = new Date(this.visibleLeftDate)
        const right = new Date(left)
        right.setMonth(right.getMonth() + viewportMonths - 1)
        right.setDate(1)
        right.setMonth(right.getMonth() + 1)
        right.setDate(0)
        const start = new Date(this.headersStartDate.getFullYear(), this.headersStartDate.getMonth(), 1)
        const end = new Date(this.headersEndDate.getFullYear(), this.headersEndDate.getMonth() + 1, 0)
        const startIdx = start.getFullYear() * 12 + start.getMonth()
        const leftIdx = left.getFullYear() * 12 + left.getMonth()
        const endIdx = end.getFullYear() * 12 + end.getMonth()
        const rightIdx = right.getFullYear() * 12 + right.getMonth()
        if (leftIdx - startIdx < this.ANCHOR_STEP_MONTHS) {
          const prev = new Date(start)
          prev.setMonth(prev.getMonth() - 3)
          this.headersStartDate = prev
          this.scrollX += 3 * this.consts.MONTH_COLUMN_PX
          if (this.isPanning) this.panStartScrollLeft += 3 * this.consts.MONTH_COLUMN_PX
        }
        if (endIdx - rightIdx < 2) {
          const nextEnd = new Date(end)
          nextEnd.setMonth(nextEnd.getMonth() + viewportMonths + 2)
          nextEnd.setDate(0)
          this.headersEndDate = nextEnd
        }
        return
      }
      const viewportDays = Math.max(1, Math.ceil(viewport / this.effectiveDayWidth))
      const visibleLeft = new Date(this.visibleLeftDate)
      const visibleRight = new Date(visibleLeft)
      visibleRight.setDate(visibleRight.getDate() + Math.max(1, viewportDays - 1))
      const start = new Date(this.headersStartDate)
      const end = new Date(this.headersEndDate)
      const leftGap = Math.round((visibleLeft.getTime() - start.getTime()) / this.consts.ONE_DAY_MS)
      const rightGap = Math.round((end.getTime() - visibleRight.getTime()) / this.consts.ONE_DAY_MS)
      if (leftGap < 20) {
        const ns = new Date(start)
        ns.setDate(ns.getDate() - 30)
        this.headersStartDate = ns
        const px = 30 * this.effectiveDayWidth
        this.scrollX += px
        if (this.isPanning) this.panStartScrollLeft += px
      }
      if (rightGap < Math.max(20, viewportDays)) {
        const ne = new Date(end)
        ne.setDate(ne.getDate() + Math.max(30, viewportDays))
        this.headersEndDate = ne
      }
      this.lastAnchorDays = Math.floor(this.scrollX / this.effectiveDayWidth)
    },
    onToolbarCommand(cmd: string) {
      if (cmd === "today") this.jumpToToday()
      else if (cmd === "collapse") this.collapseAll()
      else if (cmd === "expand") this.expandAll()
      else if (cmd === "jump-left") this.jumpToData("left")
      else if (cmd === "jump-right") this.jumpToData("right")
    },
    modeLabel(m: ViewMode) {
      return m === "month" ? "月" : m === "quarter" ? "季" : "年"
    },
    nav(dir: "prev" | "next") {
      const shift = dir === "next" ? 1 : -1
      if (this.viewMode === "month") {
        const shiftDays = 30
        this.scrollX = this.scrollX + shiftDays * this.effectiveDayWidth * shift
        this.scheduleAdjustRange(true)
        return
      }
      if (this.viewMode === "quarter") {
        const shiftDays = 30
        this.scrollX = this.scrollX + shiftDays * this.effectiveDayWidth * shift
        this.scheduleAdjustRange(true)
        return
      }
      if (this.viewMode === "year") {
        const shiftMonths = 12
        this.scrollX = this.scrollX + shiftMonths * this.consts.MONTH_COLUMN_PX * shift
        this.scheduleAdjustRange(true)
        return
      }
      let shiftMs = this.consts.ONE_DAY_MS * 365 * shift
      this.viewStartDate = this.viewStartDate + shiftMs
    },
    jumpToToday() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (this.viewMode === "month" || this.viewMode === "quarter" || this.viewMode === "year") {
        const px = this.dateToPixel(today)
        const container = this.$refs.containerRef as HTMLDivElement
        const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
        const contentWidth = this.getTimelineWidth()
        const margin = 40
        const targetScroll = Math.max(0, Math.min(contentWidth - viewport, Math.max(0, px - margin)))
        this.scrollX = targetScroll
        this.ensureRightCapacity(targetScroll)
        this.scheduleAdjustRange(true)
        return
      }
      const ms = today.getTime()
      this.viewStartDate = ms - this.viewDurationMs * 0.1
    },
    collapseAll() {
      this.staffData = this.staffData.map(s => ({ ...s, isCollapsed: true }))
    },
    expandAll() {
      this.staffData = this.staffData.map(s => ({ ...s, isCollapsed: false }))
    },
    onPanMouseDown(e: MouseEvent) {
      if (this.isEditingTask) return
      if ((e.target as HTMLElement).closest(".task-card")) return
      if ((e.target as HTMLElement).closest("input")) return
      const active = document.activeElement as HTMLElement | null
      if (active && active.tagName === "INPUT") return
      e.preventDefault()
      this.isPanning = true
      this.panStartX = e.clientX
      this.panStartDate = this.viewStartDate
      this.panStartScrollLeft = this.scrollX
      document.body.style.cursor = "grabbing"
    },
    getTimelineWidth(): number {
      const container = this.$refs.containerRef as HTMLDivElement
      const baseWidth = container ? container.clientWidth : window.innerWidth
      let width = Math.max(1, baseWidth - this.consts.SIDEBAR_WIDTH)
      if (this.viewMode === "year" && this.headers && this.headers.length > 0) {
        width = this.headers.length * this.consts.MONTH_COLUMN_PX
      } else if ((this.viewMode === "month" || this.viewMode === "quarter") && this.headersStartDate && this.headersEndDate) {
        const days = Math.max(1, Math.round((this.headersEndDate.getTime() - this.headersStartDate.getTime()) / this.consts.ONE_DAY_MS) + 1)
        width = days * this.effectiveDayWidth
      }
      return width
    },
    getDateAtMouse(clientX: number): number {
      const container = this.$refs.containerRef as HTMLDivElement
      const rect = container.getBoundingClientRect()
      const timelineLeft = rect.left + this.consts.SIDEBAR_WIDTH
      const relativeX = clientX - timelineLeft + this.scrollX
      if (this.viewMode === "year" && this.headers && this.headers.length > 0) {
        const x = Math.max(0, relativeX)
        const monthIndex = Math.min(this.headers.length - 1, Math.floor(x / this.consts.MONTH_COLUMN_PX))
        const monthStart = new Date(this.headers[monthIndex].date)
        const dim = this.daysInMonth(monthStart)
        const within = x - monthIndex * this.consts.MONTH_COLUMN_PX
        const dayOffset = Math.max(0, Math.floor(within / (this.consts.MONTH_COLUMN_PX / dim)))
        const d = new Date(monthStart)
        d.setDate(d.getDate() + dayOffset)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      }
      if (this.viewMode === "month" || this.viewMode === "quarter") {
        const msPerPixel = this.consts.ONE_DAY_MS / this.effectiveDayWidth
        return this.headersStartMs + relativeX * msPerPixel
      }
      const timelineWidth = this.getTimelineWidth()
      const msPerPixel = this.viewDurationMs / timelineWidth
      return this.viewStartDate + relativeX * msPerPixel
    },
    todayLineCalc(): number {
      const today = new Date().getTime()
      if (this.viewMode === "year" && this.headers && this.headers.length > 0) {
        let px = 0
        const start = new Date(this.headers[0].date)
        let cur = new Date(start)
        while (cur.getFullYear() < new Date(today).getFullYear() || cur.getMonth() < new Date(today).getMonth()) {
          px += this.consts.MONTH_COLUMN_PX
          cur.setMonth(cur.getMonth() + 1)
        }
        const dim = this.daysInMonth(cur)
        const dayIndex = Math.floor((today - new Date(cur.getFullYear(), cur.getMonth(), 1).getTime()) / this.consts.ONE_DAY_MS)
        px += dayIndex * (this.consts.MONTH_COLUMN_PX / dim)
        return px - this.scrollX
      }
      if (this.viewMode === "month" || this.viewMode === "quarter") {
        const days = (today - this.headersStartMs) / this.consts.ONE_DAY_MS
        return days * this.effectiveDayWidth - this.scrollX
      }
      const timelineWidth = this.getTimelineWidth()
      const ratio = (today - this.viewStartDate) / this.viewDurationMs
      return ratio * timelineWidth
    },
    stopAutoScroll() {
      if (this.autoScrollTimer) {
        window.clearInterval(this.autoScrollTimer)
        this.autoScrollTimer = null
      }
    },
    startAutoScroll(direction: "left" | "right") {
      if (this.autoScrollTimer) return
      this.autoScrollTimer = window.setInterval(() => {
        const shift = direction === "left" ? -1 : 1
        if (this.viewMode === "month" || this.viewMode === "quarter" || this.viewMode === "year") {
          const container = this.$refs.containerRef as HTMLDivElement
          const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
          let nextRaw = this.scrollX + 8 * shift
          if (shift < 0 && nextRaw <= 10) {
            this.preExtendLeftBuffer()
            nextRaw = this.scrollX + 8 * shift
          }
          let maxScroll = Math.max(0, this.getTimelineWidth() - viewport)
          if (shift > 0 && nextRaw >= maxScroll - 10) {
            this.preExtendRightBuffer()
            maxScroll = Math.max(0, this.getTimelineWidth() - viewport)
          }
          const next = Math.max(0, Math.min(maxScroll, nextRaw))
          this.scrollX = next
          this.scheduleAdjustRange(false)
        } else {
          const speed = this.viewDurationMs * 0.005
          this.viewStartDate = this.viewStartDate + speed * shift
        }
      }, 16)
    },
    handleResizeStart(e: MouseEvent, direction: "left" | "right", task: Task, staffId: string) {
      e.preventDefault()
      e.stopPropagation()
      const s = this.staffData.find(x => x.id === staffId)
      this.lastChangedStaff = s ? s : ({} as Staff)
      const taskStartMs = this.parseDateStr(task.startDate).getTime()
      const mouseTime = this.getDateAtMouse((e as any).clientX)
      const staffIdx = this.staffData.findIndex(s => s.id === staffId)
      const taskIdx = staffIdx !== -1 ? this.staffData[staffIdx].tasks.findIndex(t => t.id === task.id) : -1
      const msPerPixel = this.viewDurationMs / this.getTimelineWidth()
      this.interaction = { type: "resize", taskId: task.id, staffId, direction, initialX: (e as any).clientX, initialY: (e as any).clientY, initialStartTime: taskStartMs, initialDuration: task.duration, offsetMs: taskStartMs - mouseTime, staffIdx, taskIdx, msPerPixel }
      document.body.classList.add(direction === "left" ? "resizing-left" : "resizing-right")
    },
    handleTaskMouseDown(task: Task, staffId: string, e: MouseEvent) {
      const s = this.staffData.find(x => x.id === staffId)
      this.lastChangedStaff = s ? s : ({} as Staff)
      const initialX = e.clientX
      const initialY = e.clientY
      const taskStartMs = this.parseDateStr(task.startDate).getTime()
      const mouseTime = this.getDateAtMouse(initialX)
      const offsetMs = taskStartMs - mouseTime
      const staffIdx = this.staffData.findIndex(s => s.id === staffId)
      const taskIdx = staffIdx !== -1 ? this.staffData[staffIdx].tasks.findIndex(t => t.id === task.id) : -1
      const msPerPixel = this.viewDurationMs / this.getTimelineWidth()
      this.interaction = { type: "move", taskId: task.id, staffId, initialX, initialY, initialStartTime: taskStartMs, initialRowOffset: task.rowOffset, offsetMs, staffIdx, taskIdx, msPerPixel }
      document.body.style.cursor = "move"
    },
    onGlobalMouseMove(e: MouseEvent) {
      if (this.isEditingTask) return
      const timelineWidth = this.getTimelineWidth()
      const msPerPixel = this.viewDurationMs / timelineWidth
      this.lastMouseX = e.clientX
      if (this.interaction) {
        const edgeThreshold = 60
        if (e.clientX < this.consts.SIDEBAR_WIDTH + edgeThreshold) this.startAutoScroll("left")
        else if (e.clientX > window.innerWidth - edgeThreshold) this.startAutoScroll("right")
        else this.stopAutoScroll()
        this.lastDragEvent = { clientX: e.clientX, clientY: e.clientY }
        if (this.dragRaf == null) {
          this.dragRaf = requestAnimationFrame(() => {
            this.dragRaf = null
            const ev = this.lastDragEvent
            if (!ev) return
            const intr = this.interaction as any
            if (!intr) return
            const staffIndex = intr.staffIdx
            const taskIndex = intr.taskIdx
            if (staffIndex == null || taskIndex == null || staffIndex === -1 || taskIndex === -1) return
            const currentTask = this.staffData[staffIndex].tasks[taskIndex]
            const currentMouseTime = this.getDateAtMouse(ev.clientX)
            const curMsPerPixel = intr.msPerPixel || msPerPixel
            if (intr.type === "resize" && intr.initialDuration !== undefined) {
              const deltaX = ev.clientX - intr.initialX
              const deltaDays = (deltaX * curMsPerPixel) / this.consts.ONE_DAY_MS
              let newDuration = currentTask.duration
              let newStartDate = currentTask.startDate
              if (intr.direction === "right") {
                const rawNewDuration = (intr.initialDuration || 0) + deltaDays
                newDuration = Math.max(1, Math.round(rawNewDuration))
              } else {
                const rawShiftDays = Math.round(deltaDays)
                newDuration = Math.max(1, (intr.initialDuration || 0) - rawShiftDays)
                if (newDuration !== currentTask.duration) {
                  const newStartMs = (intr.initialStartTime || 0) + deltaDays * this.consts.ONE_DAY_MS
                  const d = new Date(newStartMs)
                  d.setHours(0, 0, 0, 0)
                  const y = d.getFullYear()
                  const m = String(d.getMonth() + 1).padStart(2, "0")
                  const day = String(d.getDate()).padStart(2, "0")
                  newStartDate = `${y}-${m}-${day}`
                }
              }
              this.dragState = { taskId: currentTask.id, staffId: intr.staffId, type: "resize", dateStr: newStartDate, duration: newDuration }
              const dStart = new Date(newStartDate)
              const dEnd = new Date(dStart)
              dEnd.setDate(dEnd.getDate() + newDuration)
              const endStr = `${dEnd.getFullYear()}-${String(dEnd.getMonth() + 1).padStart(2, "0")}-${String(dEnd.getDate()).padStart(2, "0")}`
              this.tooltip = { visible: true, x: ev.clientX + 15, y: ev.clientY + 15, startDate: newStartDate, endDate: endStr, duration: newDuration }
              return
            }
            if (intr.type === "move" && intr.initialRowOffset !== undefined && intr.offsetMs !== undefined) {
              let newStartMs = currentMouseTime + intr.offsetMs
              const d = new Date(newStartMs)
              d.setHours(0, 0, 0, 0)
              const y = d.getFullYear()
              const m = String(d.getMonth() + 1).padStart(2, "0")
              const day = String(d.getDate()).padStart(2, "0")
              const dateStr = `${y}-${m}-${day}`
              const deltaY = ev.clientY - intr.initialY
              const rowShift = Math.round(deltaY / 36)
              const newRowOffset = Math.max(0, (intr.initialRowOffset || 0) + rowShift)
              this.dragState = { taskId: currentTask.id, staffId: intr.staffId, type: "move", dateStr, rowOffset: newRowOffset }
              const dEnd = new Date(d)
              dEnd.setDate(dEnd.getDate() + currentTask.duration)
              const endStr = `${dEnd.getFullYear()}-${String(dEnd.getMonth() + 1).padStart(2, "0")}-${String(dEnd.getDate()).padStart(2, "0")}`
              this.tooltip = { visible: true, x: ev.clientX + 15, y: ev.clientY + 15, startDate: dateStr, endDate: endStr, duration: currentTask.duration }
            }
          })
        }
        return
      }
      if (this.isPanning) {
        const deltaX = e.clientX - this.panStartX
        this.lastPanDeltaX = deltaX
        if (this.panRaf == null) {
          this.panRaf = requestAnimationFrame(() => {
            this.panRaf = null
            const dx = this.lastPanDeltaX
            if (this.viewMode === "month" || this.viewMode === "quarter" || this.viewMode === "year") {
              const container = this.$refs.containerRef as HTMLDivElement
              const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
              let nextRaw = this.panStartScrollLeft - dx
              if (nextRaw <= 10) {
                this.preExtendLeftBuffer()
                nextRaw = this.panStartScrollLeft - dx
              }
              let maxScroll = Math.max(0, this.getTimelineWidth() - viewport)
              if (nextRaw >= maxScroll - 10) {
                this.preExtendRightBuffer()
                maxScroll = Math.max(0, this.getTimelineWidth() - viewport)
              }
              const next = Math.max(0, Math.min(maxScroll, nextRaw))
              this.scrollX = next
              this.scheduleAdjustRange(false)
            } else {
              this.viewStartDate = this.panStartDate - dx * msPerPixel
            }
          })
        }
      }
    },
    onGlobalMouseUp() {
      this.stopAutoScroll()
      if (this.interaction) {
        if (this.dragState && this.dragState.taskId && this.dragState.staffId) {
          const sIdx = this.staffData.findIndex(s => s.id === this.dragState!.staffId)
          if (sIdx !== -1) {
            const tasks = this.staffData[sIdx].tasks.map(t => {
              if (t.id !== this.dragState!.taskId) return t
              const nextStart = this.dragState!.dateStr != null ? this.dragState!.dateStr : t.startDate
              const nextDur = this.dragState!.duration != null ? this.dragState!.duration : t.duration
              const nextRow = this.dragState!.rowOffset != null ? this.dragState!.rowOffset : t.rowOffset
              return { ...t, startDate: nextStart, duration: nextDur, rowOffset: nextRow }
            })
            const nextStaff = { ...this.staffData[sIdx], tasks }
            this.lastChangedStaff = nextStaff
            this.staffData = this.staffData.map((s, i) => (i === sIdx ? nextStaff : s))
          }
        }
        this.dragState = null
        this.interaction = null
        this.tooltip = null
        document.body.classList.remove("resizing-left", "resizing-right")
        document.body.style.cursor = ""
      }
      if (this.isPanning) {
        this.isPanning = false
        document.body.style.cursor = ""
      }
    },
    onGeneralContext(e: MouseEvent) {
      const container = this.$refs.containerRef as HTMLDivElement
      const rect = container.getBoundingClientRect()
      const x = (e as any).clientX - rect.left + this.scrollX
      const y = (e as any).clientY - rect.top + container.scrollTop
      this.contextMenu = null
    },
    onHeaderSidebarContext(e: MouseEvent) {
      if (this.readonly) return
      this.onContextMenu({ clientX: (e as any).clientX, clientY: (e as any).clientY, type: "general" })
    },
    onTaskMouseMove(payload: { clientX: number; clientY: number; task: Task; staffId: string | number; rect?: DOMRect }) {
      if (this.interaction) return
      const t = payload.task
      const endStr = calcEnd(t.startDate, t.duration)
      this.hoverTask = t
      const r = payload.rect
      const baseX = r ? r.left + r.width / 2 : payload.clientX
      const baseY = r ? r.top - 8 : payload.clientY
      this.tooltip = { visible: true, x: baseX, y: baseY, startDate: t.startDate, endDate: endStr, duration: t.duration }
    },
    onTaskMouseLeave() {
      if (this.interaction) return
      this.tooltip = null
      this.hoverTask = null
    },
    onWheel(e: WheelEvent) {
      if (this.isEditingTask) return
      if (this.readonly) return
      if (e.ctrlKey) {
        e.preventDefault()
        const modes: ViewMode[] = ["month", "quarter", "year"]
        const idx = modes.indexOf(this.viewMode)
        const dir = e.deltaY > 0 ? 1 : -1
        const next = modes[Math.max(0, Math.min(modes.length - 1, idx + dir))]
        this.viewMode = next
        return
      }
      if (e.shiftKey) {
        e.preventDefault()
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
        if (this.viewMode === "month" || this.viewMode === "quarter" || this.viewMode === "year") {
          const container = this.$refs.containerRef as HTMLDivElement
          const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
          let nextRaw = this.scrollX + delta * 2
          if (delta < 0 && nextRaw <= 10) {
            this.preExtendLeftBuffer()
            nextRaw = this.scrollX + delta * 2
          }
          let maxScroll = Math.max(0, this.getTimelineWidth() - viewport)
          if (delta > 0 && nextRaw >= maxScroll - 10) {
            this.preExtendRightBuffer()
            maxScroll = Math.max(0, this.getTimelineWidth() - viewport)
          }
          const next = Math.max(0, Math.min(maxScroll, nextRaw))
          this.scrollX = next
          this.scheduleAdjustRange(false)
        } else {
          const timelineWidth = this.getTimelineWidth()
          const msPerPixel = this.viewDurationMs / timelineWidth
          this.viewStartDate = this.viewStartDate + delta * msPerPixel * 20
        }
        return
      }
    },
    onContextMenu(payload: { clientX?: number; clientY?: number; x?: number; y?: number; type?: string; staffId?: string; taskId?: string }) {
      if (this.readonly) return
      const container = this.$refs.containerRef as HTMLDivElement
      const rect = container.getBoundingClientRect()
      const clientX = payload.clientX != null ? payload.clientX! : payload.x != null ? rect.left + payload.x! : rect.left
      const clientY = payload.clientY != null ? payload.clientY! : payload.y != null ? rect.top + payload.y! : rect.top
      const x = clientX - rect.left + this.scrollX
      const y = clientY - rect.top + container.scrollTop
      let clampedX = x
      let clampedY = y
      const dateAtMouseMs = this.getDateAtMouse(clientX)
      const d = new Date(dateAtMouseMs)
      d.setHours(0, 0, 0, 0)
      const yStr = d.getFullYear()
      const mStr = String(d.getMonth() + 1).padStart(2, "0")
      const dayStr = String(d.getDate()).padStart(2, "0")
      const dateStr = `${yStr}-${mStr}-${dayStr}`
      this.contextMenu = { x: clampedX, y: clampedY, clientX, clientY, type: payload.type, staffId: payload.staffId, taskId: payload.taskId, dateAtMouse: dateStr }
      this.menuVisible = true
    },
    addStaff() {
      const newStaff: Staff = { id: Date.now().toString(), name: "新员工", avatarColor: "bg-gray-200 text-gray-600", tasks: [], isCollapsed: false }
      this.lastChangedStaff = newStaff
      this.staffData = [...this.staffData, newStaff]
      this.contextMenu = null
    },
    addTask(staffId: string) {
      const d = new Date(this.viewStartDate + this.viewDurationMs * 0.1)
      d.setHours(0, 0, 0, 0)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      const dateStr = `${y}-${m}-${day}`
      const s = this.staffData.find(x => x.id === staffId)
      this.lastChangedStaff = s ? s : ({} as Staff)
      this.staffData = this.staffData.map(s => {
        if (s.id === staffId) {
          const maxRow = s.tasks.length > 0 ? Math.max(...s.tasks.map(t => t.rowOffset)) : -1
          const t: Task = { id: `T${Date.now().toString().slice(-4)}`, name: "新任务", startDate: dateStr, duration: 3, rowOffset: maxRow + 1 }
          return { ...s, tasks: [...s.tasks, t] }
        }
        return s
      })
      this.contextMenu = null
    },
    addTaskAtDate(staffId: string, dateStr: string) {
      const s = this.staffData.find(x => x.id === staffId)
      this.lastChangedStaff = s ? s : ({} as Staff)
      this.staffData = this.staffData.map(s => {
        if (s.id === staffId) {
          const maxRow = s.tasks.length > 0 ? Math.max(...s.tasks.map(t => t.rowOffset)) : -1
          const t: Task = { id: `T${Date.now().toString().slice(-4)}`, name: "新任务", startDate: dateStr, duration: 3, rowOffset: maxRow + 1 }
          return { ...s, tasks: [...s.tasks, t] }
        }
        return s
      })
    },
    updateTask(staffId: string, taskId: string, updates: Partial<Task>) {
      const s = this.staffData.find(x => x.id === staffId)
      this.lastChangedStaff = s ? s : ({} as Staff)
      this.staffData = this.staffData.map(s => {
        if (s.id === staffId) return { ...s, tasks: s.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t)) }
        return s
      })
    },
    deleteTask(staffId: string, taskId: string) {
      const s = this.staffData?.find(x => x.id === staffId)
      const t = s?.tasks.find(y => y.id === taskId)
      ;(this as any)
        .$confirm(`确定删除「${taskId}： ${t?.name}」任务？`, "删除任务", { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" })
        .then(() => {
          const s = this.staffData.find(x => x.id === staffId)
          this.lastChangedStaff = s ? s : ({} as Staff)
          this.staffData = this.staffData.map(x => (x.id === staffId ? { ...x, tasks: x.tasks.filter(y => y.id !== taskId) } : x))
          this.contextMenu = null
        })
        .catch(() => {})
    },
    duplicateTask(staffId: string, taskId: string) {
      const s = this.staffData.find(x => x.id === staffId)
      this.lastChangedStaff = s ? s : ({} as Staff)
      this.staffData = this.staffData.map(s => {
        if (s.id !== staffId) return s
        const original = s.tasks.find(t => t.id === taskId)
        if (!original) return s
        const maxRow = s.tasks.length > 0 ? Math.max(...s.tasks.map(t => t.rowOffset)) : -1
        const copy: Task = { ...original, id: `T${Date.now().toString().slice(-3)}`, name: `${original.name}(新)`, rowOffset: maxRow + 1 }
        return { ...s, tasks: [...s.tasks, copy] }
      })
      this.contextMenu = null
    },
    focusTask(staffId: string, taskId: string) {
      const s = this.staffData.find(x => x.id === staffId)
      const t = s && s.tasks.find(y => y.id === taskId)
      if (!t) return
      const d = this.parseDateStr(t.startDate)
      if (this.viewMode === "month" || this.viewMode === "quarter" || this.viewMode === "year") {
        const px = this.dateToPixel(d)
        const container = this.$refs.containerRef as HTMLDivElement
        const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
        const contentWidth = this.getTimelineWidth()
        const margin = 40
        const targetScroll = Math.max(0, Math.min(contentWidth - viewport, Math.max(0, px - margin)))
        this.scrollX = targetScroll
        this.ensureRightCapacity(targetScroll)
      } else {
        const start = d.getTime()
        this.viewStartDate = start - this.viewDurationMs * 0.1
      }
      this.scrollToStaff(staffId)
      this.contextMenu = null
    },
    scrollToStaff(staffId: string) {
      const container = this.$refs.containerRef as HTMLDivElement
      const el = container.querySelector(`[data-staff-id="${staffId}"]`) as HTMLElement | null
      if (el) {
        container.scrollTop = el.offsetTop - 40
      }
      this.contextMenu = null
    },
    focusStaff(staffId: string) {
      const s = this.staffData.find(x => x.id === staffId)
      if (!s) {
        this.scrollToStaff(staffId)
        return
      }
      if (s.tasks.length === 0) {
        this.scrollToStaff(staffId)
        return
      }
      const targetDate = new Date(Math.min(...s.tasks.map(t => this.parseDateStr(t.startDate).getTime())))
      if (this.viewMode === "month" || this.viewMode === "quarter" || this.viewMode === "year") {
        const px = this.dateToPixel(targetDate)
        const container = this.$refs.containerRef as HTMLDivElement
        const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
        const contentWidth = this.getTimelineWidth()
        const margin = 40
        const targetScroll = Math.max(0, Math.min(contentWidth - viewport, Math.max(0, px - margin)))
        this.scrollX = targetScroll
        this.ensureRightCapacity(targetScroll)
      } else {
        const start = targetDate.getTime()
        this.viewStartDate = start - this.viewDurationMs * 0.1
      }
      this.scrollToStaff(staffId)
    },
    openEditTask(staff: Staff) {
      return (task: Task) => {
        if (this.readonly) return
        this.editModal = { isOpen: true, staffId: staff.id, task }
      }
    },
    openEditStaff(staff: Staff) {
      if (this.readonly) return
      this.editStaffModal = { isOpen: true, staff }
    },
    onSaveTask(taskId: string, updates: Partial<Task>) {
      this.updateTask(this.editModal.staffId, taskId, updates)
    },
    onSaveStaff(staffId: string, updates: Partial<Staff>) {
      const s = this.staffData.find(x => x.id === staffId)
      const next = s ? { ...s, ...updates } : ({} as Staff)
      this.lastChangedStaff = next
      this.staffData = this.staffData.map(s => (s.id === staffId ? { ...s, ...updates } : s))
    },
    openEditModal() {
      if (this.contextMenu && this.contextMenu.staffId && this.contextMenu.taskId) {
        const staff = this.staffData.find(s => s.id === this.contextMenu!.staffId)
        const task = staff && staff.tasks.find(t => t.id === this.contextMenu!.taskId)
        if (staff && task) {
          this.editModal = { isOpen: true, staffId: staff.id, task }
          this.contextMenu = null
        }
      }
    },
    openEditStaffModal() {
      if (this.contextMenu && this.contextMenu.staffId) {
        const staff = this.staffData.find(s => s.id === this.contextMenu!.staffId)
        if (staff) {
          this.editStaffModal = { isOpen: true, staff }
          this.contextMenu = null
        }
      }
    },
    updateStaff(staffId: string, updates: Partial<Staff>) {
      const keys = Object.keys(updates || {})
      const onlyCollapse = keys.length === 1 && keys[0] === "isCollapsed"
      if (this.readonly && !onlyCollapse) return
      const s = this.staffData.find(x => x.id === staffId)
      const next = s ? { ...s, ...updates } : ({} as Staff)
      this.lastChangedStaff = next
      this.staffData = this.staffData.map(s => (s.id === staffId ? { ...s, ...updates } : s))
    },
    deleteStaff(id: string) {
      const s = this.staffData.find(x => x.id === id)
      const msg = `确定删除人员「${s ? s.name : id}」及其 ${s ? s.tasks.length : 0} 个任务？`
      ;(this as any)
        .$confirm(msg, "删除人员", { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" })
        .then(() => {
          const s2 = this.staffData.find(x => x.id === id)
          this.lastChangedStaff = s2 ? s2 : ({} as Staff)
          this.staffData = this.staffData.filter(x => x.id !== id)
          this.contextMenu = null
        })
        .catch(() => {})
    },
    ctxAddStaff() {
      this.menuVisible = false
      this.addStaff()
    },
    ctxOpenEditStaff() {
      this.menuVisible = false
      this.openEditStaffModal()
    },
    ctxFocusStaff() {
      this.menuVisible = false
      if (this.contextMenu && this.contextMenu.staffId) this.focusStaff(this.contextMenu.staffId)
    },
    ctxToggleCollapse() {
      this.menuVisible = false
      if (!this.contextMenu || !this.contextMenu.staffId) return
      const s = this.staffData.find(x => x.id === this.contextMenu!.staffId)
      if (!s) return
      this.updateStaff(s.id, { isCollapsed: !s.isCollapsed })
    },
    staffCollapseLabel(): string {
      if (!this.contextMenu || !this.contextMenu.staffId) return "折叠/展开人员"
      const s = this.staffData.find(x => x.id === this.contextMenu!.staffId)
      if (!s) return "折叠/展开人员"
      return s.isCollapsed ? "展开人员" : "折叠人员"
    },
    ctxDeleteStaff() {
      this.menuVisible = false
      if (this.contextMenu && this.contextMenu.staffId) this.deleteStaff(this.contextMenu.staffId)
    },
    ctxAddTask() {
      this.menuVisible = false
      if (this.contextMenu && this.contextMenu.staffId) {
        const dateStr = (this.contextMenu as any).dateAtMouse
        if (dateStr) this.addTaskAtDate(this.contextMenu.staffId, dateStr)
        else this.addTask(this.contextMenu.staffId)
      }
    },
    ctxOpenEditTask() {
      this.menuVisible = false
      this.openEditModal()
    },
    ctxDeleteTask() {
      this.menuVisible = false
      if (this.contextMenu && this.contextMenu.staffId && this.contextMenu.taskId) this.deleteTask(this.contextMenu.staffId, this.contextMenu.taskId)
    },
    ctxDuplicateTask() {
      this.menuVisible = false
      if (this.contextMenu && this.contextMenu.staffId && this.contextMenu.taskId) this.duplicateTask(this.contextMenu.staffId, this.contextMenu.taskId)
    },
    ctxFocusTask() {
      this.menuVisible = false
      if (this.contextMenu && this.contextMenu.staffId && this.contextMenu.taskId) this.focusTask(this.contextMenu.staffId, this.contextMenu.taskId)
    },
    ctxDurationPlus() {
      this.menuVisible = false
      if (!this.contextMenu || !this.contextMenu.staffId || !this.contextMenu.taskId) return
      const s = this.staffData.find(x => x.id === this.contextMenu!.staffId)
      const t = s && s.tasks.find(y => y.id === this.contextMenu!.taskId)
      if (!t) return
      const next = Math.max(1, (t.duration || 1) + 1)
      this.updateTask(this.contextMenu.staffId, this.contextMenu.taskId, { duration: next })
    },
    ctxDurationMinus() {
      this.menuVisible = false
      if (!this.contextMenu || !this.contextMenu.staffId || !this.contextMenu.taskId) return
      const s = this.staffData.find(x => x.id === this.contextMenu!.staffId)
      const t = s && s.tasks.find(y => y.id === this.contextMenu!.taskId)
      if (!t) return
      const next = Math.max(1, (t.duration || 1) - 1)
      this.updateTask(this.contextMenu.staffId, this.contextMenu.taskId, { duration: next })
    },
    ctxMoveRowUp() {
      this.menuVisible = false
      if (!this.contextMenu || !this.contextMenu.staffId || !this.contextMenu.taskId) return
      if (!this.canMoveRowUp()) return
      const s = this.staffData.find(x => x.id === this.contextMenu!.staffId)
      const t = s && s.tasks.find(y => y.id === this.contextMenu!.taskId)
      if (!t) return
      const next = Math.max(0, (t.rowOffset || 0) - 1)
      this.updateTask(this.contextMenu.staffId, this.contextMenu.taskId, { rowOffset: next })
    },
    ctxMoveRowDown() {
      this.menuVisible = false
      if (!this.contextMenu || !this.contextMenu.staffId || !this.contextMenu.taskId) return
      const s = this.staffData.find(x => x.id === this.contextMenu!.staffId)
      const t = s && s.tasks.find(y => y.id === this.contextMenu!.taskId)
      if (!t) return
      const next = (t.rowOffset || 0) + 1
      this.updateTask(this.contextMenu.staffId, this.contextMenu.taskId, { rowOffset: next })
    },
    canMoveRowUp(): boolean {
      if (!this.contextMenu || !this.contextMenu.staffId || !this.contextMenu.taskId) return false
      const s = this.staffData.find(x => x.id === this.contextMenu!.staffId)
      const t = s && s.tasks.find(y => y.id === this.contextMenu!.taskId)
      if (!t) return false
      return (t.rowOffset || 0) > 0
    },
    getQuickJumpDirection(): "left" | "right" | null {
      let minTaskStart = Infinity
      let maxTaskEnd = -Infinity
      let hasTasks = false
      const allCollapsed = this.staffData.every(s => s.isCollapsed)
      this.staffData.forEach(s => {
        if (!allCollapsed && s.isCollapsed) return
        s.tasks.forEach(t => {
          hasTasks = true
          const start = this.parseDateStr(t.startDate).getTime()
          const end = start + t.duration * this.consts.ONE_DAY_MS
          if (start < minTaskStart) minTaskStart = start
          if (end > maxTaskEnd) maxTaskEnd = end
        })
      })
      if (!hasTasks) return null
      if (this.viewMode === "month" || this.viewMode === "quarter" || this.viewMode === "year") {
        const container = this.$refs.containerRef as HTMLDivElement
        const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
        const visibleDays = Math.max(1, Math.floor(viewport / this.effectiveDayWidth))
        const left = new Date(this.visibleLeftDate).getTime()
        const right = left + visibleDays * this.consts.ONE_DAY_MS
        if (maxTaskEnd < left) return "left"
        if (minTaskStart > right) return "right"
        return null
      }
      const viewEnd = this.viewStartDate + this.viewDurationMs
      if (maxTaskEnd < this.viewStartDate) return "left"
      if (minTaskStart > viewEnd) return "right"
      return null
    },
    jumpToData(direction: "left" | "right") {
      // 是否全部折叠
      const allCollapsed = this.staffData.every(s => s.isCollapsed)
      if (this.viewMode === "month" || this.viewMode === "quarter" || this.viewMode === "year") {
        const container = this.$refs.containerRef as HTMLDivElement
        const viewport = Math.max(1, (container?.clientWidth || window.innerWidth) - this.consts.SIDEBAR_WIDTH)
        const visibleDays = Math.max(1, Math.floor(viewport / this.effectiveDayWidth))
        if (direction === "left") {
          let minTaskStart = Infinity
          this.staffData.forEach(s => {
            if (!allCollapsed && s.isCollapsed) return
            s.tasks.forEach(t => {
              const start = this.parseDateStr(t.startDate).getTime()
              if (start < minTaskStart) minTaskStart = start
            })
          })
          if (minTaskStart === Infinity) minTaskStart = Date.now()
          const target = new Date(minTaskStart)
          target.setHours(0, 0, 0, 0)
          const visibleLeft = new Date(target)
          const newStart = new Date(visibleLeft)
          newStart.setDate(newStart.getDate() - 30)
          const newEnd = new Date(visibleLeft)
          newEnd.setDate(newEnd.getDate() + visibleDays + 30)
          this.headersStartDate = newStart
          this.headersEndDate = newEnd
          this.scrollX = Math.floor((visibleLeft.getTime() - newStart.getTime()) / this.consts.ONE_DAY_MS) * this.effectiveDayWidth
          this.lastAnchorDays = Math.floor(this.scrollX / this.effectiveDayWidth)
          this.ensureRightCapacity(this.scrollX)
          this.scheduleAdjustRange(true)
        } else {
          let maxTaskEnd = -Infinity
          this.staffData.forEach(s => {
            if (!allCollapsed && s.isCollapsed) return
            s.tasks.forEach(t => {
              const start = this.parseDateStr(t.startDate).getTime()
              const end = start + t.duration * this.consts.ONE_DAY_MS
              if (end > maxTaskEnd) maxTaskEnd = end
            })
          })
          if (maxTaskEnd === -Infinity) maxTaskEnd = Date.now()
          const target = new Date(maxTaskEnd)
          target.setHours(0, 0, 0, 0)
          const visibleLeft = new Date(target)
          visibleLeft.setDate(visibleLeft.getDate() - Math.max(1, visibleDays - 1))
          const newStart = new Date(visibleLeft)
          newStart.setDate(newStart.getDate() - 30)
          const newEnd = new Date(visibleLeft)
          newEnd.setDate(newEnd.getDate() + visibleDays + 30)
          this.headersStartDate = newStart
          this.headersEndDate = newEnd
          this.scrollX = Math.floor((visibleLeft.getTime() - newStart.getTime()) / this.consts.ONE_DAY_MS) * this.effectiveDayWidth
          this.lastAnchorDays = Math.floor(this.scrollX / this.effectiveDayWidth)
          this.ensureRightCapacity(this.scrollX)
          this.scheduleAdjustRange(true)
        }
        return
      }

      if (direction == "left") {
        let minTaskStart = Infinity
        this.staffData.forEach(s => {
          if (!allCollapsed && s.isCollapsed) return
          s.tasks.forEach(t => {
            const start = new Date(t.startDate).getTime()
            if (start < minTaskStart) minTaskStart = start
          })
        })
        if (minTaskStart === Infinity) minTaskStart = new Date().getTime()
        this.viewStartDate = minTaskStart - this.viewDurationMs * 0.1
      } else {
        let maxTaskEnd = -Infinity
        this.staffData.forEach(s => {
          if (!allCollapsed && s.isCollapsed) return
          s.tasks.forEach(t => {
            const start = new Date(t.startDate).getTime()
            const end = start + t.duration * this.consts.ONE_DAY_MS
            if (end > maxTaskEnd) maxTaskEnd = end
          })
        })
        if (maxTaskEnd === -Infinity) maxTaskEnd = new Date().getTime()
        this.viewStartDate = maxTaskEnd - this.viewDurationMs * 0.9
      }
    },
  },
}
</script>

<style lang="scss">
@import "./scss/ganttScheduler.scss";
</style>
