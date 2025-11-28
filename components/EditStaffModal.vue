<template>
  <div v-if="isOpen && staff" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl w-96 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="font-bold text-gray-800">编辑人员信息</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">&times;</button>
      </div>
      <form @submit.prevent="submit" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
          <input type="text" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" v-model="name" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">职位</label>
          <input type="text" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" v-model="role" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">头像颜色</label>
          <ColorPresetPicker :colors="PRESET_AVATAR_COLORS" :selectedKey="avatarColor" :columns="6" @select="c=> avatarColor = c.class || ''" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">本周负荷 (%)</label>
          <input type="number" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" v-model.number="workload" />
        </div>
        <div class="pt-4 flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">取消</button>
          <button type="submit" class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded">保存</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Staff } from '../types'
import ColorPresetPicker from './ColorPresetPicker.vue'
import { PRESET_AVATAR_COLORS } from '../constants'

export default Vue.extend({
  components: { ColorPresetPicker },
  props: { isOpen: { type: Boolean, required: true }, staff: { type: Object as () => Staff | null, required: false } },
  data() {
    return { name: '', role: '', workload: 0, avatarColor: '', PRESET_AVATAR_COLORS }
  },
  watch: {
    staff: {
      immediate: true,
      handler(s: Staff | null) {
        if (s) { this.name = s.name; this.role = s.role; this.workload = s.workloadPercentage; this.avatarColor = s.avatarColor }
      }
    }
  },
  methods: {
    submit() {
      if (!this.staff) return
      this.$emit('save', this.staff.id, { name: this.name, role: this.role, workloadPercentage: Number(this.workload), avatarColor: this.avatarColor })
      this.$emit('close')
    }
  }
})
</script>

<style scoped>
</style>
