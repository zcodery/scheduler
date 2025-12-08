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

<style scoped></style>
