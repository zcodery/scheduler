<template>
  <div class="task-card group relative flex items-center h-7 rounded px-1 transition-shadow shadow-sm" :class="conflict ? 'border border-rose-400' : ''" :style="{ overflow: 'visible', backgroundColor: bg }" @dblclick.stop="startEdit" @contextmenu.stop.prevent="$emit('contextmenu', task)" @mousedown="onMouseDown" @mouseenter="$emit('mouse-move', task)" @mousemove="$emit('mouse-move', task)" :aria-id="task.id" :aria-name="task.name" :aria-description="`开始时间:${task.startDate}，持续${task.duration}天`">
    <div v-if="!editing && !readonly" class="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize z-20 hover:bg-indigo-400/50 rounded-l" @mousedown.stop="emitResize('left', $event)"></div>
    <span class="text-[10px] font-bold mr-1.5 whitespace-nowrap select-none ml-1 flex-shrink-0 z-10" :style="{ color: text }">{{ task.id }}</span>
    <input v-if="editing" ref="inputRef" type="text" v-model="editValue" @blur="commit" @keydown.enter.prevent="commit" @keydown.esc.prevent="cancel" class="flex-1 bg-white text-[10px] px-1 py-0.5 border-none outline-none text-indigo-900 rounded h-5 min-w-0 z-10" />
    <template v-else>
      <div v-if="showOutside" class="absolute left-full ml-1 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium pointer-events-none z-0" :style="{ color: text }">{{ task.name }}</div>
      <div v-else class="flex-1 overflow-hidden relative h-full flex items-center z-10">
        <div class="whitespace-nowrap text-[10px] font-medium truncate" :style="{ color: text }">{{ task.name }}</div>
      </div>
    </template>
    <div v-if="!editing && !readonly" class="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize z-20 hover:bg-indigo-400/50 rounded-r" @mousedown.stop="emitResize('right', $event)"></div>
    <span v-show="!showOutside" class="text-[10px] font-bold mr-1.5 whitespace-nowrap select-none ml-1 flex-shrink-0 z-10" :style="{ color: text }">{{ task.duration }}天</span>
  </div>
</template>

<script lang="ts">
import { Task, ViewMode } from "../types"
import { DEFAULT_TASK_BG, DEFAULT_TASK_TEXT } from "../constants"

export default {
  props: {
    task: { type: Object as () => Task, required: true },
    viewMode: { type: String as () => ViewMode, required: true },
    readonly: { type: Boolean, required: false, default: false },
    conflict: { type: Boolean, required: false, default: false },
  },
  data() {
    return { editing: false, editValue: (this as any).task.name }
  },
  computed: {
    bg(): string {
      return this.task.bgColor || DEFAULT_TASK_BG
    },
    text(): string {
      return this.task.textColor || DEFAULT_TASK_TEXT
    },
    showOutside(): boolean {
      if (this.viewMode === "month") return this.task.duration < 2.5
      if (this.viewMode === "quarter") return this.task.duration < 7
      if (this.viewMode === "year") return this.task.duration < 15
      return false
    },
  },
  methods: {
    startEdit() {
      if (this.readonly) return
      this.editing = true
      this.editValue = this.task.name
      this.$nextTick(() => {
        const i = this.$refs.inputRef as HTMLInputElement
        i && i.focus()
      })
    },
    commit() {
      if (this.readonly) return
      const i = this.$refs.inputRef as HTMLInputElement
      const raw = i ? i.value : this.editValue
      const v = String(raw || "").trim()
      this.editing = false
      if (v && v !== this.task.name) this.$emit("update", this.task, v)
    },
    cancel() {
      this.editValue = this.task.name
      this.editing = false
    },
    onMouseDown(e: MouseEvent) {
      if (this.readonly || this.editing || (e as any).button !== 0) return
      this.$emit("mouse-down", e, this.task)
    },
    emitResize(direction: "left" | "right", e: MouseEvent) {
      this.$emit("resize-start", e, direction, this.task)
    },
  },
}
</script>
