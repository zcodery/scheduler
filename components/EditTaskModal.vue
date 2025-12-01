<template>
  <el-dialog :visible="isOpen && !!task" title="编辑任务" width="480px" append-to-body :before-close="() => $emit('close')" @close="$emit('close')">
    <el-form label-position="top" size="mini">
      <el-row :gutter="12">
        <el-col :span="24">
          <el-form-item label="任务名称">
            <el-input v-model="name" maxlength="60" show-word-limit />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="开始日期">
            <el-date-picker v-model="startDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" @change="handleStartDate" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期">
            <el-date-picker v-model="endDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" @change="handleEndDate" class="!w-full" />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="背景色">
            <el-color-picker v-model="bgColor" :predefine="presetHexes" show-alpha size="mini" @change="onBgChange" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="文字颜色">
            <el-color-picker v-model="textColor" :predefine="presetHexes" show-alpha size="mini" @change="onTextChange" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="工期 (天)">
            <el-input-number v-model="duration" :min="1" :step="1" @change="handleDuration" class="!w-full" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button size="mini" @click="$emit('close')">取消</el-button>
      <el-button size="mini" type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { Task } from "../types"
import { DEFAULT_TASK_BG, DEFAULT_TASK_TEXT, PRESET_TASK_COLORS } from "../constants"

export default {
  props: {
    isOpen: { type: Boolean, required: true },
    task: { type: Object as () => Task | null, required: false },
  },
  data() {
    return { name: "", startDate: "", endDate: "", duration: 1, bgColor: "", textColor: "", presets: PRESET_TASK_COLORS, DEFAULT_TASK_BG, DEFAULT_TASK_TEXT }
  },
  computed: {
    presetHexes(): string[] {
      const toHex = (rgb: string) => {
        const m = rgb.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+)\s*)?\)/i)
        if (!m) return rgb
        const to2 = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0")
        return `#${to2(Number(m[1]))}${to2(Number(m[2]))}${to2(Number(m[3]))}`
      }
      const arr: string[] = (this.presets || []).map(p => {
        if ((p as any).hex) return (p as any).hex as string
        else if (p.color) return toHex(p.color)
        return ""
      })
      return arr?.filter(Boolean)
    },
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
      },
    },
  },
  methods: {
    calcEnd(start: string, dur: number) {
      if (!start) return ""
      const d = new Date(start)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() + Math.round(dur))
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${day}`
    },
    calcDuration(start: string, end: string) {
      if (!start || !end) return 0
      const d1 = new Date(start)
      const d2 = new Date(end)
      d1.setHours(0, 0, 0, 0)
      d2.setHours(0, 0, 0, 0)
      const diff = d2.getTime() - d1.getTime()
      return Math.max(1, Math.round(diff / 86400000))
    },
    handleStartDate() {
      if (this.duration > 0) this.endDate = this.calcEnd(this.startDate, this.duration)
    },
    handleDuration() {
      if (this.startDate) this.endDate = this.calcEnd(this.startDate, this.duration)
    },
    handleEndDate() {
      if (this.startDate) this.duration = this.calcDuration(this.startDate, this.endDate)
    },
    onBgChange(val: string) {
      if (!this.task) return
      this.$emit("save", this.task.id, { bgColor: val })
    },
    onTextChange(val: string) {
      if (!this.task) return
      this.$emit("save", this.task.id, { textColor: val })
    },
    submit() {
      if (!this.task) return
      this.$emit("save", this.task.id, { name: this.name, startDate: this.startDate, duration: Number(this.duration), bgColor: this.bgColor || undefined, textColor: this.textColor || undefined })
      this.$emit("close")
    },
  },
}
</script>

<style scoped></style>
