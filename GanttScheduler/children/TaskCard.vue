<template>
  <div class="task-card group relative flex items-center h-7 rounded px-1 transition-shadow shadow-sm" :class="[conflict ? 'border border-rose-400' : '', task.readonly ? 'opacity-75 cursor-not-allowed' : '']" :style="{ overflow: 'visible', backgroundColor: bg }" @dblclick.stop="startEdit" @contextmenu.stop.prevent="$emit('contextmenu', task)" @mousedown="onMouseDown" @mouseenter="emitHover" @mousemove="emitHover" @mouseleave="$emit('mouse-leave')" :aria-id="task.uid" :aria-name="task.name" :aria-description="`开始时间:${task.startDate}，持续${task.duration}天`">
    <div v-if="!editing && !readonly && !task.readonly" class="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize z-20 hover:bg-indigo-400/50 rounded-l" @mousedown.stop="emitResize('left', $event)"></div>
    <span class="text-[10px] font-bold mr-1.5 whitespace-nowrap select-none ml-1 flex-shrink-0 z-10" :style="{ color: text }">{{ task.uid }}</span>
    <el-popover placement="top-start" trigger="manual" v-model="editing" :visible-arrow="true" class="flex-1 whitespace-nowrap text-[10px] font-medium truncate" popper-class="p-1">
      <el-input ref="inputRef" size="mini" v-model="editValue" @blur="commit" @keydown.enter.prevent="commit" @keydown.esc.prevent="cancel" />
      <template slot="reference">
        <div v-if="showOutside" class="absolute left-full ml-1 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium pointer-events-none z-0" :style="{ color: text }">{{ task.name }}</div>
        <div v-else class="overflow-hidden relative h-full flex items-center z-10">
          <div class="whitespace-nowrap text-[10px] font-medium truncate" :style="{ color: text }">{{ task.name }}</div>
        </div>
      </template>
    </el-popover>
    <div v-if="!editing && !readonly && !task.readonly" class="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize z-20 hover:bg-indigo-400/50 rounded-r" @mousedown.stop="emitResize('right', $event)"></div>
    <span v-show="!showOutside" class="text-[10px] font-bold mr-1.5 whitespace-nowrap select-none ml-1 flex-shrink-0 z-10" :style="{ color: text }">{{ task.duration }}天</span>
  </div>
</template>

<script>
import { DEFAULT_TASK_BG, DEFAULT_TASK_TEXT } from "../utils/constants"

export default {
  props: {
    task: { type: Object, required: true },
    viewMode: { type: String, required: true },
    readonly: { type: Boolean, required: false, default: false },
    conflict: { type: Boolean, required: false, default: false },
  },
  data() {
    return { editing: false, editValue: this.task.name }
  },
  computed: {
    bg() {
      return this.task.bgColor || DEFAULT_TASK_BG
    },
    text() {
      return this.task.textColor || DEFAULT_TASK_TEXT
    },
    showOutside() {
      if (this.viewMode === "month") return this.task.duration < 2.5
      if (this.viewMode === "quarter") return this.task.duration < 7
      if (this.viewMode === "year") return this.task.duration < 15
      return false
    },
  },
  methods: {
    startEdit() {
      if (this.readonly || this.task.readonly) return
      this.editing = true
      this.editValue = this.task.name
      this.$nextTick(() => {
        const i = this.$refs.inputRef
        i && i.focus()
      })
    },
    commit() {
      if (this.readonly) return
      const i = this.$refs.inputRef
      const raw = i ? i.value : this.editValue
      const v = String(raw || "").trim()
      this.editing = false
      if (v && v !== this.task.name) this.$emit("update", this.task, v)
    },
    cancel() {
      this.editValue = this.task.name
      this.editing = false
    },
    onMouseDown(e) {
      if (this.readonly || this.task.readonly || this.editing || e.button !== 0) return
      this.$emit("mouse-down", e, this.task)
    },
    emitResize(direction, e) {
      if (this.readonly || this.task.readonly) return
      this.$emit("resize-start", e, direction, this.task)
    },
    emitHover(e) {
      const rect = this.$el.getBoundingClientRect()
      this.$emit("mouse-move", { task: this.task, clientX: e.clientX, clientY: e.clientY, rect })
    },
  },
}
</script>

<style lang="scss" scoped>
$space: (
  "0": 0,
  "1": 0.25rem,
  "1\\.5": 0.375rem,
  "2": 0.5rem,
  "3": 0.75rem,
  "4": 1rem,
  "5": 1.25rem,
  "6": 1.5rem,
  "7": 1.75rem,
  "10": 2.5rem,
  "full": 100%,
);
@each $k, $v in $space {
  .p-#{$k} {
    padding: #{$v};
  }
  .px-#{$k} {
    padding-left: #{$v};
    padding-right: #{$v};
  }
  .py-#{$k} {
    padding-top: #{$v};
    padding-bottom: #{$v};
  }
  .pl-#{$k} {
    padding-left: #{$v};
  }
  .pr-#{$k} {
    padding-right: #{$v};
  }
  .pt-#{$k} {
    padding-top: #{$v};
  }
  .pb-#{$k} {
    padding-bottom: #{$v};
  }

  .m-#{$k} {
    margin: #{$v};
  }
  .mx-#{$k} {
    margin-left: #{$v};
    margin-right: #{$v};
  }
  .my-#{$k} {
    margin-top: #{$v};
    margin-bottom: #{$v};
  }
  .ml-#{$k} {
    margin-left: #{$v};
  }
  .mr-#{$k} {
    margin-right: #{$v};
  }
  .mt-#{$k} {
    margin-top: #{$v};
  }
  .mb-#{$k} {
    margin-bottom: #{$v};
  }
}
</style>
