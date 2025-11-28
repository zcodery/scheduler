<template>
  <div class="min-h-screen bg-white text-slate-800 flex flex-col select-none h-screen overflow-hidden" @mousemove="onGlobalMouseMove" @mouseup="onGlobalMouseUp" @mouseleave="onGlobalMouseUp">
    <EditTaskModal :isOpen="editModal.isOpen" :task="editModal.task" @close="editModal.isOpen=false" @save="onSaveTask" />
    <EditStaffModal :isOpen="editStaffModal.isOpen" :staff="editStaffModal.staff" @close="editStaffModal.isOpen=false" @save="onSaveStaff" />

    <div v-if="tooltip && tooltip.visible" class="fixed z-[9999] bg-gray-900 text-white text-xs px-2 py-1.5 rounded shadow-lg pointer-events-none space-y-0.5" :style="{ left: tooltip.x+'px', top: tooltip.y+'px' }">
      <div>开始: {{ tooltip.startDate }}</div>
      <div>结束: {{ tooltip.endDate }}</div>
      <div>工期: {{ tooltip.duration }} 天</div>
    </div>

    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white z-50 relative shadow-sm shrink-0">
      <div>
        <slot name="title"><h1 class="text-xl font-bold text-gray-900">人员排期</h1></slot>
        <slot name="description"><p class="text-xs text-gray-500 mt-1">拖动图表滑动 • 双击编辑 • 右键管理</p></slot>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex bg-gray-100 p-1 rounded-lg">
          <button v-for="m in viewModes" :key="m" @click="viewMode=m" :class="['px-3 py-1 text-xs font-medium rounded-md transition-all', viewMode===m ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900']">
            {{ modeLabel(m) }}视图
          </button>
        </div>
        <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
          <button @click="nav('prev')" class="p-1 hover:bg-gray-50 rounded text-gray-500">‹</button>
          <span class="text-sm font-medium text-gray-700 min-w-[100px] text-center">{{ currentLabel }}</span>
          <button @click="nav('next')" class="p-1 hover:bg-gray-50 rounded text-gray-500">›</button>
        </div>
        <span v-if="readonly" class="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">只读模式</span>
        <div class="flex items-center gap-2">
          <button @click="exportData" class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">导出JSON</button>
          <button @click="importData" class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">导入JSON</button>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="filterText" placeholder="搜索人员" class="px-2 py-1 text-xs border rounded" />
          <button @click="jumpToToday" class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">定位今天</button>
          <button @click="collapseAll" class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">折叠全部</button>
          <button @click="expandAll" class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">展开全部</button>
        </div>
      </div>
    </div>

    <div ref="containerRef" class="flex-1 overflow-y-auto overflow-x-hidden relative" @mousedown="onPanMouseDown" @contextmenu.prevent @wheel.prevent="onWheel">
      <div class="sticky top-0 z-40 flex border-b border-gray-200 bg-gray-50 shadow-sm header-row">
        <div class="w-64 flex-shrink-0 p-3 border-r border-gray-200 text-xs font-semibold text-gray-500 flex items-center bg-gray-50" @contextmenu.prevent="onHeaderSidebarContext">人员 / 饱和度</div>
        <div class="flex-1 grid overflow-hidden" :style="{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }">
          <div v-for="(h,i) in headers" :key="i" :class="['flex flex-col items-center justify-center py-2 border-r border-gray-200 text-xs', h.isToday ? 'bg-blue-100/50' : h.isWeekend ? 'bg-gray-200/50' : '']">
            <span :class="['font-medium whitespace-nowrap', h.isToday ? 'text-blue-600' : 'text-gray-700']">{{ h.label }}</span>
            <span class="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{{ h.subLabel }}</span>
          </div>
        </div>
      </div>

      <div class="relative">
        <StaffRow v-for="s in displayStaffs" :key="s.id" :staff="s" :headers="headers" :viewStartDate="new Date(viewStartDate)" :viewDurationMs="viewDurationMs" :viewMode="viewMode" :readonly="readonly" @context-menu="onContextMenu" @update-task="updateTask" @open-edit-task="openEditTask(s)" @open-edit-staff="openEditStaff(s)" @resize-start="handleResizeStart" @task-mouse-down="handleTaskMouseDown" @staff-drag-start="handleStaffDragStartWithRef" @staff-drag-enter="handleStaffLiveSort" @staff-drop="handleStaffDrop" @update-staff="updateStaff" @add-task-at="addTaskAtDate" @focus-staff="focusStaff">
          <template #avatar="{ staff }"><slot name="avatar" :staff="staff"></slot></template>
          <template #workload="{ staff }"><slot name="workloadBar" :staff="staff"></slot></template>
        </StaffRow>
        <div v-if="quickJumpDir" class="absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none w-full flex justify-between px-10 pl-[280px]">
          <button v-if="quickJumpDir==='left'" class="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 pointer-events-auto" @click="jumpToData('left')">«</button>
          <div class="flex-1"></div>
          <button v-if="quickJumpDir==='right'" class="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 pointer-events-auto" @click="jumpToData('right')">»</button>
        </div>
        <div class="h-[300px]" @click="contextMenu=null"></div>
      </div>

      <div class="pointer-events-none absolute top-0 bottom-0" :style="{ left: (260 + todayLineCalc()) + 'px' }">
        <div class="w-px h-full bg-indigo-500/50"></div>
      </div>

      <div v-if="contextMenu" ref="contextMenuRef" class="absolute bg-white border border-gray-200 shadow-xl rounded-lg py-1 z-[100] w-56 text-sm" :style="{ top: contextMenu.y+'px', left: contextMenu.x+'px' }">
        <!-- 通用区域：新增人员 -->
        <button v-if="contextMenu.type==='general'" @click="addStaff" class="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700">新增人员</button>

        <!-- 人员区域：新增任务、编辑人员、删除人员 -->
        <template v-if="contextMenu.type==='staff' && contextMenu.staffId">
          <button @click="openEditStaffModal" class="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700">编辑人员</button>
          <div class="h-px bg-gray-100 my-1"></div>
          <button @click="deleteStaff(contextMenu.staffId)" class="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600">删除人员</button>
        </template>

        <!-- 行区域：新增任务 -->
        <template v-if="contextMenu.type==='row' && contextMenu.staffId">
          <button @click="addTask(contextMenu.staffId)" class="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700">新增任务</button>
        </template>

        <!-- 任务区域：编辑任务、删除任务 -->
        <template v-if="contextMenu.type==='task' && contextMenu.staffId && contextMenu.taskId">
          <button @click="openEditModal" class="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700">编辑任务</button>
          <div class="h-px bg-gray-100 my-1"></div>
          <button @click="deleteTask(contextMenu.staffId, contextMenu.taskId)" class="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600">删除任务</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Staff, Task, ViewMode, DayInfo, TooltipState, EditTaskModalState, EditStaffModalState } from './types'
import { MOCK_STAFF_DATA, WEEK_DAYS } from './constants'
import StaffRow from './components/StaffRow.vue'
import EditTaskModal from './components/EditTaskModal.vue'
import EditStaffModal from './components/EditStaffModal.vue'
import { Confirm } from './components/Confirm'

export default Vue.extend({
  components: { StaffRow, EditTaskModal, EditStaffModal },
  props: { readonly: { type: Boolean, required: false, default: false } },
  data() {
    return {
      staffData: MOCK_STAFF_DATA as Staff[],
      viewStartDate: new Date().setHours(0,0,0,0) - 86400000 * 2,
      viewMode: 'month' as ViewMode,
      tooltip: null as TooltipState | null,
      editModal: { isOpen: false, staffId: '', task: null } as EditTaskModalState,
      editStaffModal: { isOpen: false, staff: null } as EditStaffModalState,
      contextMenu: null as null | { x:number; y:number; type?: string; staffId?: string; taskId?: string },
      isPanning: false,
      panStartX: 0,
      panStartDate: 0,
      interaction: null as null | { type: 'resize'|'move'; taskId: string; staffId: string; direction?: 'left'|'right'; initialDuration?: number; initialX: number; initialY: number; initialStartTime: number; initialRowOffset?: number; offsetMs?: number },
      autoScrollTimer: null as number | null,
      lastMouseX: 0,
      draggedStaffId: null as string | null,
      filterText: ''
    }
  },
  created() {
    try {
      const raw = localStorage.getItem('scheduler:data')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) this.staffData = parsed
      }
    } catch {}
  },
  watch: {
    staffData: {
      deep: true,
      handler(val: Staff[]) {
        try {
          localStorage.setItem('scheduler:data', JSON.stringify(val))
          window.dispatchEvent(new CustomEvent('scheduler:data-change', { detail: val }))
        } catch {}
      }
    }
  },
  mounted() {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.contextMenu = null
        this.interaction = null
        this.tooltip = null
        document.body.classList.remove('resizing-left','resizing-right')
        document.body.style.cursor = ''
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.contextMenu && this.contextMenu.type==='task' && this.contextMenu.staffId && this.contextMenu.taskId) {
          this.deleteTask(this.contextMenu.staffId, this.contextMenu.taskId)
        }
      }
    }
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      const menuEl = this.$refs.contextMenuRef as HTMLElement | undefined
      if (menuEl && (menuEl === target || menuEl.contains(target))) return
      this.contextMenu = null
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDocClick)
    ;(this as any)._onKey = onKey
    ;(this as any)._onDocClick = onDocClick
  },
  beforeDestroy() {
    const onKey = (this as any)._onKey as (e: KeyboardEvent)=>void
    if (onKey) document.removeEventListener('keydown', onKey)
    const onDocClick = (this as any)._onDocClick as (e: MouseEvent)=>void
    if (onDocClick) document.removeEventListener('mousedown', onDocClick)
  },
  computed: {
    ONE_DAY_MS(): number { return 86400000 },
    viewDurationMs(): number {
      if (this.viewMode === 'month') return this.ONE_DAY_MS * 30
      if (this.viewMode === 'quarter') return this.ONE_DAY_MS * 90
      return this.ONE_DAY_MS * 365
    },
    headers(): DayInfo[] {
      const headers: DayInfo[] = []
      const startDate = new Date(this.viewStartDate)
      const count = this.viewMode === 'year' ? 12 : this.viewMode === 'quarter' ? 13 : 31
      const isSameDay = (d1: Date, d2: Date) => d1.getDate()===d2.getDate() && d1.getMonth()===d2.getMonth() && d1.getFullYear()===d2.getFullYear()
      const today = new Date()
      if (this.viewMode === 'month') {
        const startDay = new Date(startDate)
        for (let i=0;i<count;i++) {
          const d = new Date(startDay)
          d.setDate(d.getDate()+i)
          headers.push({
            date: d,
            label: String(d.getDate()),
            subLabel: WEEK_DAYS[d.getDay()],
            isToday: isSameDay(d,today),
            isWeekend: d.getDay()===0 || d.getDay()===6
          })
        }
      } else if (this.viewMode === 'quarter') {
        const startDay = new Date(startDate)
        for (let i=0;i<count;i++) {
          const d = new Date(startDay)
          d.setDate(d.getDate()+i*7)
          headers.push({ date: d, label: `W${Math.ceil(d.getDate()/7)}`, subLabel: `${d.getMonth()+1}/${d.getDate()}`, isToday: false, isWeekend: false })
        }
      } else {
        const startDay = new Date(startDate)
        for (let i=0;i<count;i++) {
          const d = new Date(startDay)
          d.setMonth(d.getMonth()+i)
          headers.push({ date: d, label: `${d.getMonth()+1}月`, subLabel: `${d.getFullYear()}`, isToday: d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear(), isWeekend: false })
        }
      }
      return headers
    },
    currentLabel(): string {
      const d = new Date(this.viewStartDate)
      return `${d.getFullYear()}年 ${d.getMonth()+1}月`
    },
    viewModes(): ViewMode[] { return ['month','quarter','year'] },
    quickJumpDir(): 'left'|'right'|null { return this.getQuickJumpDirection() }
    ,
    displayStaffs(): Staff[] {
      const q = this.filterText.trim().toLowerCase()
      if (!q) return this.staffData
      return this.staffData.filter(s=>
        s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q)
      )
    }
  },
  methods: {
    modeLabel(m: ViewMode) { return m==='month'?'月':m==='quarter'?'季':'年' },
    nav(dir: 'prev'|'next') {
      const shift = dir==='next'?1:-1
      let shiftMs = 0
      if (this.viewMode==='month') shiftMs = this.ONE_DAY_MS*30*shift
      else if (this.viewMode==='quarter') shiftMs = this.ONE_DAY_MS*90*shift
      else shiftMs = this.ONE_DAY_MS*365*shift
      this.viewStartDate = this.viewStartDate + shiftMs
    },
    jumpToToday() {
      const today = new Date()
      today.setHours(0,0,0,0)
      const ms = today.getTime()
      this.viewStartDate = ms - this.viewDurationMs * 0.1
    },
    collapseAll() {
      this.staffData = this.staffData.map(s=> ({ ...s, isCollapsed: true }))
    },
    expandAll() {
      this.staffData = this.staffData.map(s=> ({ ...s, isCollapsed: false }))
    },
    onPanMouseDown(e: MouseEvent) {
      if ((e.target as HTMLElement).closest('.task-card')) return
      if ((e.target as HTMLElement).closest('input')) return
      this.isPanning = true
      this.panStartX = e.clientX
      this.panStartDate = this.viewStartDate
      document.body.style.cursor = 'grabbing'
    },
    getDateAtMouse(clientX: number): number {
      const timelineWidth = Math.max(1, window.innerWidth - 260)
      const msPerPixel = this.viewDurationMs / timelineWidth
      const relativeX = clientX - 260
      return this.viewStartDate + relativeX * msPerPixel
    },
    todayLineCalc(): number {
      const today = new Date().getTime()
      const timelineWidth = Math.max(1, window.innerWidth - 260)
      const ratio = (today - this.viewStartDate) / this.viewDurationMs
      return Math.max(0, Math.min(timelineWidth, ratio * timelineWidth))
    },
    stopAutoScroll() { if (this.autoScrollTimer) { window.clearInterval(this.autoScrollTimer); this.autoScrollTimer = null } },
    startAutoScroll(direction: 'left'|'right') {
      if (this.autoScrollTimer) return
      this.autoScrollTimer = window.setInterval(()=>{
        const shift = direction==='left' ? -1 : 1
        const speed = this.viewDurationMs * 0.005
        this.viewStartDate = this.viewStartDate + speed * shift
      },16)
  },
    handleResizeStart(e: MouseEvent, direction: 'left'|'right', task: Task, staffId: string) {
      e.preventDefault()
      e.stopPropagation()
      const taskStartMs = new Date(task.startDate).getTime()
      const mouseTime = this.getDateAtMouse((e as any).clientX)
      this.interaction = { type: 'resize', taskId: task.id, staffId, direction, initialX: (e as any).clientX, initialY: (e as any).clientY, initialStartTime: taskStartMs, initialDuration: task.duration, offsetMs: taskStartMs - mouseTime }
      document.body.classList.add(direction==='left'?'resizing-left':'resizing-right')
    },
    handleTaskMouseDown(task: Task, staffId: string, e: MouseEvent) {
      const initialX = e.clientX
      const initialY = e.clientY
      const taskStartMs = new Date(task.startDate).getTime()
      const mouseTime = this.getDateAtMouse(initialX)
      const offsetMs = taskStartMs - mouseTime
      this.interaction = { type: 'move', taskId: task.id, staffId, initialX, initialY, initialStartTime: taskStartMs, initialRowOffset: task.rowOffset, offsetMs }
      document.body.style.cursor = 'move'
    },
    onGlobalMouseMove(e: MouseEvent) {
      const timelineWidth = Math.max(1, window.innerWidth - 260)
      const msPerPixel = this.viewDurationMs / timelineWidth
      this.lastMouseX = e.clientX
      if (this.interaction) {
        const edgeThreshold = 60
        if (e.clientX < 260 + edgeThreshold) this.startAutoScroll('left')
        else if (e.clientX > window.innerWidth - edgeThreshold) this.startAutoScroll('right')
        else this.stopAutoScroll()
        const staffIndex = this.staffData.findIndex(s=> s.id===this.interaction!.staffId)
        if (staffIndex===-1) return
        const tasks = [...this.staffData[staffIndex].tasks]
        const taskIndex = tasks.findIndex(t=> t.id===this.interaction!.taskId)
        if (taskIndex===-1) return
        const currentTask = tasks[taskIndex]
        const currentMouseTime = this.getDateAtMouse(e.clientX)
        if (this.interaction.type==='resize' && this.interaction.initialDuration!==undefined) {
          const deltaX = e.clientX - this.interaction.initialX
          const deltaDays = (deltaX * msPerPixel) / this.ONE_DAY_MS
          let newDuration = currentTask.duration
          let newStartDate = currentTask.startDate
          if (this.interaction.direction==='right') {
            const rawNewDuration = (this.interaction.initialDuration || 0) + deltaDays
            newDuration = Math.max(1, Math.round(rawNewDuration))
          } else {
            const rawShiftDays = Math.round(deltaDays)
            newDuration = Math.max(1, (this.interaction.initialDuration || 0) - rawShiftDays)
            if (newDuration !== currentTask.duration) {
              const newStartMs = (this.interaction.initialStartTime || 0) + deltaDays * this.ONE_DAY_MS
              const d = new Date(newStartMs)
              d.setHours(0,0,0,0)
              const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0')
              newStartDate = `${y}-${m}-${day}`
            }
          }
          const newStaffData = [...this.staffData]
          newStaffData[staffIndex].tasks[taskIndex] = { ...currentTask, duration: newDuration, startDate: newStartDate }
          this.staffData = newStaffData
          const dStart = new Date(newStartDate)
          const dEnd = new Date(dStart)
          dEnd.setDate(dEnd.getDate()+newDuration)
          const endStr = `${dEnd.getFullYear()}-${String(dEnd.getMonth()+1).padStart(2,'0')}-${String(dEnd.getDate()).padStart(2,'0')}`
          this.tooltip = { visible: true, x: e.clientX+15, y: e.clientY+15, startDate: newStartDate, endDate: endStr, duration: newDuration }
          return
        }
        if (this.interaction.type==='move' && this.interaction.initialRowOffset!==undefined && this.interaction.offsetMs!==undefined) {
          let newStartMs = currentMouseTime + this.interaction.offsetMs
          const d = new Date(newStartMs)
          if (d.getHours()>=12) d.setDate(d.getDate()+1)
          d.setHours(0,0,0,0)
          const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0')
          const dateStr = `${y}-${m}-${day}`
          const deltaY = e.clientY - this.interaction.initialY
          const rowShift = Math.round(deltaY / 36)
          const newRowOffset = Math.max(0, (this.interaction.initialRowOffset || 0) + rowShift)
          const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY)
          const staffRowEl = elementUnderMouse && (elementUnderMouse as HTMLElement).closest('[data-staff-id]')
          const targetStaffId = staffRowEl ? (staffRowEl as HTMLElement).getAttribute('data-staff-id') || undefined : undefined
          const newStaffData = [...this.staffData]
          let currentStaffIdx = newStaffData.findIndex(s=> s.tasks.find(t=> t.id===this.interaction!.taskId))
          if (currentStaffIdx!==-1) {
            let taskToMove = newStaffData[currentStaffIdx].tasks.find(t=> t.id===this.interaction!.taskId) as Task
            if (targetStaffId && targetStaffId !== newStaffData[currentStaffIdx].id) {
              const targetStaffIdx = newStaffData.findIndex(s=> s.id===targetStaffId)
              if (targetStaffIdx!==-1) {
                newStaffData[currentStaffIdx].tasks = newStaffData[currentStaffIdx].tasks.filter(t=> t.id!==taskToMove.id)
                taskToMove = { ...taskToMove, startDate: dateStr, rowOffset: newRowOffset }
                newStaffData[targetStaffIdx].tasks.push(taskToMove)
                this.interaction = { ...this.interaction, staffId: targetStaffId }
              }
            } else {
              newStaffData[currentStaffIdx].tasks = newStaffData[currentStaffIdx].tasks.map(t=> t.id===taskToMove.id ? { ...t, startDate: dateStr, rowOffset: newRowOffset } : t)
            }
            this.staffData = newStaffData
            const dEnd = new Date(d)
            dEnd.setDate(dEnd.getDate()+taskToMove.duration)
            const endStr = `${dEnd.getFullYear()}-${String(dEnd.getMonth()+1).padStart(2,'0')}-${String(dEnd.getDate()).padStart(2,'0')}`
            this.tooltip = { visible: true, x: e.clientX+15, y: e.clientY+15, startDate: dateStr, endDate: endStr, duration: taskToMove.duration }
          }
        }
        return
      }
      if (this.isPanning) {
        const deltaX = e.clientX - this.panStartX
        this.viewStartDate = this.panStartDate - deltaX * msPerPixel
      }
    },
    onGlobalMouseUp() {
      this.stopAutoScroll()
      if (this.interaction) {
        this.interaction = null
        this.tooltip = null
        document.body.classList.remove('resizing-left','resizing-right')
        document.body.style.cursor = ''
      }
      if (this.isPanning) {
        this.isPanning = false
        document.body.style.cursor = ''
      }
    },
    onGeneralContext(e: MouseEvent) {
      const container = this.$refs.containerRef as HTMLDivElement
      const rect = container.getBoundingClientRect()
      const x = (e as any).clientX - rect.left + container.scrollLeft
      const y = (e as any).clientY - rect.top + container.scrollTop
      this.contextMenu = null
    },
    onHeaderSidebarContext(e: MouseEvent) {
      this.onContextMenu({ clientX: (e as any).clientX, clientY: (e as any).clientY, type: 'general' })
    },
    onWheel(e: WheelEvent) {
      e.preventDefault()
      if (this.readonly) return
      if (e.ctrlKey) {
        const modes: ViewMode[] = ['month','quarter','year']
        const idx = modes.indexOf(this.viewMode)
        const dir = e.deltaY > 0 ? 1 : -1
        const next = modes[Math.max(0, Math.min(modes.length-1, idx + dir))]
        this.viewMode = next
      } else {
        const timelineWidth = Math.max(1, window.innerWidth - 260)
        const msPerPixel = this.viewDurationMs / timelineWidth
        const deltaX = e.deltaY
        this.viewStartDate = this.viewStartDate + deltaX * msPerPixel * 20
      }
    },
    onContextMenu(payload: { clientX?: number; clientY?: number; x?: number; y?: number; type?: string; staffId?: string; taskId?: string }) {
      const container = this.$refs.containerRef as HTMLDivElement
      const rect = container.getBoundingClientRect()
      const clientX = payload.clientX != null ? payload.clientX! : (payload.x != null ? rect.left + payload.x! : rect.left)
      const clientY = payload.clientY != null ? payload.clientY! : (payload.y != null ? rect.top + payload.y! : rect.top)
      const x = clientX - rect.left + container.scrollLeft
      const y = clientY - rect.top + container.scrollTop
      let clampedX = x
      let clampedY = y
      const dateAtMouseMs = this.getDateAtMouse(clientX)
      const d = new Date(dateAtMouseMs)
      d.setHours(0,0,0,0)
      const yStr = d.getFullYear(); const mStr = String(d.getMonth()+1).padStart(2,'0'); const dayStr = String(d.getDate()).padStart(2,'0')
      const dateStr = `${yStr}-${mStr}-${dayStr}`
      this.contextMenu = { x: clampedX, y: clampedY, type: payload.type, staffId: payload.staffId, taskId: payload.taskId, dateAtMouse: dateStr }
      this.$nextTick(()=>{
        const menuEl = this.$refs.contextMenuRef as HTMLElement | undefined
        if (!menuEl) return
        const menuWidth = menuEl.offsetWidth
        const menuHeight = menuEl.offsetHeight
        const maxLeft = container.scrollLeft + container.clientWidth - menuWidth - 8
        const maxTop = container.scrollTop + container.clientHeight - menuHeight - 8
        clampedX = Math.max(8, Math.min(maxLeft, clampedX))
        clampedY = Math.max(8, Math.min(maxTop, clampedY))
        this.contextMenu = { ...this.contextMenu!, x: clampedX, y: clampedY }
      })
    },
    addStaff() {
      const newStaff: Staff = { id: Date.now().toString(), name: '新员工', role: '职位待定', avatarColor: 'bg-gray-200 text-gray-600', workloadPercentage: 0, tasks: [], isCollapsed: false }
      this.staffData = [...this.staffData, newStaff]
      this.contextMenu = null
    },
    addTask(staffId: string) {
      const d = new Date(this.viewStartDate + this.viewDurationMs*0.1)
      d.setHours(0,0,0,0)
      const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0')
      const dateStr = `${y}-${m}-${day}`
      this.staffData = this.staffData.map(s=>{
        if (s.id===staffId) {
          const maxRow = s.tasks.length>0 ? Math.max(...s.tasks.map(t=>t.rowOffset)) : -1
          const t: Task = { id: `T${Date.now().toString().slice(-4)}`, name: '新任务', startDate: dateStr, duration: 3, rowOffset: maxRow+1 }
          return { ...s, tasks: [...s.tasks, t] }
        }
        return s
      })
      this.contextMenu = null
    },
    addTaskAtDate(staffId: string, dateStr: string) {
      this.staffData = this.staffData.map(s=>{
        if (s.id===staffId) {
          const maxRow = s.tasks.length>0 ? Math.max(...s.tasks.map(t=>t.rowOffset)) : -1
          const t: Task = { id: `T${Date.now().toString().slice(-4)}`, name: '新任务', startDate: dateStr, duration: 3, rowOffset: maxRow+1 }
          return { ...s, tasks: [...s.tasks, t] }
        }
        return s
      })
    },
    updateTask(staffId: string, taskId: string, updates: Partial<Task>) {
      this.staffData = this.staffData.map(s=>{
        if (s.id===staffId) return { ...s, tasks: s.tasks.map(t=> t.id===taskId ? { ...t, ...updates } : t) }
        return s
      })
    },
    deleteTask(staffId: string, taskId: string) {
      Confirm.show({ title: '删除任务', message: '确定删除该任务？', confirmButtonText: '确定', cancelButtonText: '取消' }).then(()=>{
        this.staffData = this.staffData.map(x=> x.id===staffId ? { ...x, tasks: x.tasks.filter(y=> y.id!==taskId) } : x)
        this.contextMenu = null
      })
    },
    duplicateTask(staffId: string, taskId: string) {
      this.staffData = this.staffData.map(s=>{
        if (s.id!==staffId) return s
        const original = s.tasks.find(t=> t.id===taskId)
        if (!original) return s
        const copy: Task = { ...original, id: `${original.id}-C${Date.now().toString().slice(-3)}` }
        return { ...s, tasks: [...s.tasks, copy] }
      })
      this.contextMenu = null
    },
    focusTask(staffId: string, taskId: string) {
      const s = this.staffData.find(x=> x.id===staffId)
      const t = s && s.tasks.find(y=> y.id===taskId)
      if (!t) return
      const start = new Date(t.startDate).getTime()
      this.viewStartDate = start - this.viewDurationMs * 0.1
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
      const s = this.staffData.find(x=> x.id===staffId)
      if (!s) { this.scrollToStaff(staffId); return }
      if (s.tasks.length===0) { this.scrollToStaff(staffId); return }
      const todayMs = new Date().setHours(0,0,0,0)
      const upcoming = s.tasks.map(t=> new Date(t.startDate).getTime()).filter(ms=> ms>=todayMs)
      const target = (upcoming.length>0 ? Math.min(...upcoming) : Math.min(...s.tasks.map(t=> new Date(t.startDate).getTime())))
      this.viewStartDate = target - this.viewDurationMs * 0.1
      this.scrollToStaff(staffId)
    },
    openEditTask(staff: Staff) {
      return (task: Task) => { this.editModal = { isOpen: true, staffId: staff.id, task } }
    },
    openEditStaff(staff: Staff) { this.editStaffModal = { isOpen: true, staff } },
    onSaveTask(taskId: string, updates: Partial<Task>) { this.updateTask(this.editModal.staffId, taskId, updates) },
    onSaveStaff(staffId: string, updates: Partial<Staff>) {
      this.staffData = this.staffData.map(s=> s.id===staffId ? { ...s, ...updates } : s)
    },
    openEditModal() {
      if (this.contextMenu && this.contextMenu.staffId && this.contextMenu.taskId) {
        const staff = this.staffData.find(s=> s.id===this.contextMenu!.staffId)
        const task = staff && staff.tasks.find(t=> t.id===this.contextMenu!.taskId)
        if (staff && task) { this.editModal = { isOpen: true, staffId: staff.id, task }; this.contextMenu = null }
      }
    },
    openEditStaffModal() {
      if (this.contextMenu && this.contextMenu.staffId) {
        const staff = this.staffData.find(s=> s.id===this.contextMenu!.staffId)
        if (staff) { this.editStaffModal = { isOpen: true, staff }; this.contextMenu = null }
      }
    },
    updateStaff(staffId: string, updates: Partial<Staff>) {
      this.staffData = this.staffData.map(s=> s.id===staffId ? { ...s, ...updates } : s)
    },
    deleteStaff(id: string) {
      const s = this.staffData.find(x=> x.id===id)
      Confirm.show({ title: '删除人员', message: `确定删除人员「${s ? s.name : id}」及其 ${s ? s.tasks.length : 0} 个任务？`, confirmButtonText: '确定', cancelButtonText: '取消' }).then(()=>{
        this.staffData = this.staffData.filter(x=> x.id!==id)
        this.contextMenu = null
      })
    },
    exportData() {
      const txt = JSON.stringify(this.staffData, null, 2)
      if ((navigator as any).clipboard && (navigator as any).clipboard.writeText) {
        (navigator as any).clipboard.writeText(txt).then(()=> alert('已复制到剪贴板'))
      } else {
        alert(txt)
      }
    },
    importData() {
      const txt = prompt('粘贴JSON数据')
      if (!txt) return
      try {
        const parsed = JSON.parse(txt)
        if (Array.isArray(parsed)) this.staffData = parsed
      } catch {
        alert('JSON 解析失败')
      }
    }
    ,
    handleStaffDragStartWithRef(e: DragEvent, staffId: string) {
      this.draggedStaffId = staffId
    },
    handleStaffLiveSort(e: DragEvent, targetStaffId: string) {
      const sourceId = this.draggedStaffId
      if (!sourceId || sourceId === targetStaffId) return
      const sourceIndex = this.staffData.findIndex(s => s.id === sourceId)
      const targetIndex = this.staffData.findIndex(s => s.id === targetStaffId)
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const newData = [...this.staffData]
        const [moved] = newData.splice(sourceIndex, 1)
        newData.splice(targetIndex, 0, moved)
        this.staffData = newData
      }
    },
    handleStaffDrop() {
      this.draggedStaffId = null
    },
    getQuickJumpDirection(): 'left'|'right'|null {
      let minTaskStart = Infinity
      let maxTaskEnd = -Infinity
      let hasTasks = false
      this.staffData.forEach(s => {
        s.tasks.forEach(t => {
          hasTasks = true
          const start = new Date(t.startDate).getTime()
          const end = start + t.duration * this.ONE_DAY_MS
          if (start < minTaskStart) minTaskStart = start
          if (end > maxTaskEnd) maxTaskEnd = end
        })
      })
      if (!hasTasks) return null
      const viewEnd = this.viewStartDate + this.viewDurationMs
      if (maxTaskEnd < this.viewStartDate) return 'left'
      if (minTaskStart > viewEnd) return 'right'
      return null
    },
    jumpToData(direction: 'left'|'right') {
      let minTaskStart = Infinity
      this.staffData.forEach(s => s.tasks.forEach(t => {
        const start = new Date(t.startDate).getTime()
        if (start < minTaskStart) minTaskStart = start
      }))
      if (minTaskStart === Infinity) minTaskStart = new Date().getTime()
      this.viewStartDate = minTaskStart - this.viewDurationMs * 0.1
    }
  }
})
</script>

<style scoped>
</style>
