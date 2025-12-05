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

    <template v-slot:footer>
      <el-button size="mini" @click="$emit('close')">取消</el-button>
      <el-button size="mini" type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { DEFAULT_TASK_BG, DEFAULT_TASK_TEXT, PRESET_TASK_COLORS } from "@/utils/constants"
import { rgbTextToHex, calcEnd, calcDuration } from "@/utils/index"
import { Task } from "@/types"

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
      const arr: string[] = (this.presets || []).map(p => {
        if ((p as any).hex) return (p as any).hex as string
        else if (p.color) return rgbTextToHex(p.color)
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
          this.endDate = calcEnd(t.startDate, t.duration)
          this.bgColor = t.bgColor || DEFAULT_TASK_BG
          this.textColor = t.textColor || DEFAULT_TASK_TEXT
        }
      },
    },
  },
  methods: {
    handleStartDate() {
      if (this.duration > 0) this.endDate = calcEnd(this.startDate, this.duration)
    },
    handleDuration() {
      if (this.startDate) this.endDate = calcEnd(this.startDate, this.duration)
    },
    handleEndDate() {
      if (this.startDate) this.duration = calcDuration(this.startDate, this.endDate)
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
