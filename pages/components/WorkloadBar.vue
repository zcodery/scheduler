<template>
  <div class="w-full mt-4">
    <div class="flex justify-between items-end mb-1">
      <span class="text-xs text-gray-400">本周负荷</span>
      <span :class="['text-xs font-bold', isOverload ? 'text-rose-500' : 'text-emerald-600']">{{ percentage }}%</span>
    </div>
    <el-progress :percentage="visualPercentage" :status="isOverload ? 'exception' : 'success'" :show-text="false" :stroke-width="8" />
  </div>
</template>

<script lang="ts">
export default {
  props: { percentage: { type: Number, required: true }, render: { type: Function, required: false } },
  computed: {
    visualPercentage(): number {
      return Math.min(this.percentage, 100)
    },
    isOverload(): boolean {
      return this.percentage > 100
    },
  },
}
</script>

<style scoped>
.w-full { width: 100%; }
.mt-4 { margin-top: 1rem; }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-end { align-items: flex-end; }
.mb-1 { margin-bottom: 0.25rem; }
.text-xs { font-size: 12px; }
.text-gray-400 { color: #9ca3af; }
.font-bold { font-weight: 700; }
.text-rose-500 { color: #f43f5e; }
.text-emerald-600 { color: #059669; }
</style>
