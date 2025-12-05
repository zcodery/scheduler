<template>
  <el-dialog :visible="isOpen && !!staff" title="编辑人员信息" width="480px" append-to-body :before-close="() => $emit('close')" @close="$emit('close')">
    <el-form label-position="top" size="mini">
      <el-row :gutter="12">
        <el-col :span="20">
          <el-form-item label="姓名">
            <el-input v-model="form.name" maxlength="40" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="头像颜色">
            <el-color-picker v-model="form.avatarColor" :predefine="presetHexes" show-alpha size="mini" />
          </el-form-item>
        </el-col>

        <el-col v-for="item in staffConfig" :key="item.prop" :span="item.span || 24">
          <el-form-item :key="item.prop" :label="item.label">
            <template v-if="item.component === 'el-select'">
              <el-select v-model="form[item.prop]" v-bind="item.params || {}" @change="onFieldChange(item.prop, form[item.prop])">
                <el-option v-for="opt in (item.params && item.params.options) || []" :key="opt.value || opt" :label="opt.label || opt" :value="opt.value || opt" />
              </el-select>
            </template>
            <component v-else :is="componentOf(item)" v-model="form[item.prop]" v-bind="item.params || {}" />
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
import { PRESET_TASK_COLORS } from "@/utils/constants"
import { rgbTextToHex } from "@/utils/index"
import { Staff } from "@/types"

export default {
  props: {
    isOpen: { type: Boolean, required: true },
    staff: { type: Object as () => Staff | null, required: false },
    staffConfig: {
      type: Array as () => Array<{ prop: string; label: string; type: "field" | "picker" | "checkbox"; params?: any; component?: string }>,
      required: false,
      default: () => [],
    },
  },
  data() {
    return { form: { name: "", avatarColor: "" } as Partial<Staff>, PRESET_TASK_COLORS }
  },
  computed: {
    presetHexes(): string[] {
      const arr: string[] = (this.PRESET_TASK_COLORS || []).map(p => {
        if ((p as any).hex) return (p as any).hex as string
        else if (p.color) return rgbTextToHex(p.color)
        return ""
      })
      return arr?.filter(Boolean)
    },
  },
  watch: {
    isOpen(val: boolean) {
      if (val) {
        if (this.staff) {
          const base: Partial<Staff> = { name: this.staff.name, avatarColor: this.staff.avatarColor }
          const extra: Record<string, any> = {}
          ;(this.staffConfig || []).forEach(cfg => {
            extra[cfg.prop] = (this.staff as any)[cfg.prop]
          })
          this.form = { ...extra, ...base }
        } else {
          this.form = { name: "", avatarColor: "" }
        }
      } else {
        this.form = { name: "", avatarColor: "" }
      }
    },
    staff: {
      immediate: true,
      handler(s: Staff | null) {
        if (s) {
          const base: Partial<Staff> = { name: s.name, avatarColor: s.avatarColor }
          const extra: Record<string, any> = {}
          ;(this.staffConfig || []).forEach(cfg => {
            extra[cfg.prop] = (s as any)[cfg.prop]
          })
          this.form = { ...extra, ...base }
        }
      },
    },
  },
  methods: {
    componentOf(item: { type: "field" | "picker" | "checkbox"; component?: string }) {
      if (item.component) return item.component
      if (item.type === "picker") return "el-color-picker"
      if (item.type === "checkbox") return "el-checkbox"
      return "el-input"
    },

    submit() {
      if (!this.staff) return
      const payload: Record<string, any> = { ...this.form }
      this.$emit("save", this.staff.id, payload)
      this.$emit("close")
    },
  },
}
</script>
