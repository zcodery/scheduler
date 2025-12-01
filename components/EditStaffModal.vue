<template>
  <el-dialog :visible="isOpen && !!staff" title="编辑人员信息" width="480px" append-to-body :before-close="() => $emit('close')" @close="$emit('close')">
    <el-form @submit.native.prevent="submit" label-position="top" size="mini">
      <el-form-item label="姓名">
        <el-input v-model="name" maxlength="40" show-word-limit />
      </el-form-item>
      <el-form-item label="职位">
        <el-input v-model="role" maxlength="60" show-word-limit />
      </el-form-item>
      <el-form-item label="头像颜色">
        <el-color-picker v-model="avatarColor" :predefine="presetHexes" show-alpha size="mini" @change="onAvatarChange" />
      </el-form-item>
      <el-form-item label="本周负荷 (%)">
        <el-input-number v-model="workload" :min="0" :max="300" />
      </el-form-item>
      <div class="flex justify-end gap-2 pt-2">
        <el-button size="mini" @click="$emit('close')">取消</el-button>
        <el-button size="mini" type="primary" @click="submit">保存</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script lang="ts">
import { Staff } from "../types"
import { PRESET_TASK_COLORS } from "../constants"

export default {
  props: { isOpen: { type: Boolean, required: true }, staff: { type: Object as () => Staff | null, required: false } },
  data() {
    return { name: "", role: "", workload: 0, avatarColor: "", PRESET_TASK_COLORS }
  },
  computed: {
    presetHexes(): string[] {
      const toHex = (rgb: string) => {
        const m = rgb.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+)\s*)?\)/i)
        if (!m) return rgb
        const to2 = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0")
        return `#${to2(Number(m[1]))}${to2(Number(m[2]))}${to2(Number(m[3]))}`
      }
      const arr: string[] = (this.PRESET_TASK_COLORS || []).map(p => {
        if ((p as any).hex) return (p as any).hex as string
        else if (p.color) return toHex(p.color)
        return ""
      })

      return arr?.filter(Boolean)
    },
  },
  watch: {
    staff: {
      immediate: true,
      handler(s: Staff | null) {
        if (s) {
          this.name = s.name
          this.role = s.role
          this.workload = s.workloadPercentage
          this.avatarColor = s.avatarColor
        }
      },
    },
  },
  methods: {
    onAvatarChange(val: string) {
      if (!this.staff) return
      this.$emit("save", this.staff.id, { avatarColor: val })
    },
    submit() {
      if (!this.staff) return
      this.$emit("save", this.staff.id, { name: this.name, role: this.role, workloadPercentage: Number(this.workload), avatarColor: this.avatarColor })
      this.$emit("close")
    },
  },
}
</script>

<style scoped></style>
