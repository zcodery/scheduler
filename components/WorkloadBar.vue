<template>
  <div class="w-full mt-4">
    <div class="flex justify-between items-end mb-1">
      <span class="text-xs text-gray-400">本周负荷</span>
      <span :class="['text-xs font-bold', isOverload ? 'text-rose-500' : 'text-emerald-600']">{{ percentage }}%</span>
    </div>
    <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div :class="['h-full rounded-full', isOverload ? 'bg-rose-500' : 'bg-emerald-500']" :style="{ width: visualPercentage+'%' }"></div>
    </div>
    <div v-if="percentage>100" class="w-full h-1 mt-0.5 flex justify-end"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: { percentage: { type: Number, required: true }, render: { type: Function, required: false } },
  computed: {
    visualPercentage(): number { return Math.min(this.percentage, 100) },
    isOverload(): boolean { return this.percentage > 100 }
  }
})
</script>

<style scoped>
</style>
