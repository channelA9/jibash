<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { X } from "lucide-vue-next";

const props = defineProps<{
  message: string;
  duration: number;
}>();

const isVisible = ref(true);
const progress = ref(100);

const closeAlert = () => {
  isVisible.value = false;
};

onMounted(() => {
  const interval = setInterval(() => {
    progress.value -= 100 / (props.duration * 10);
    if (progress.value <= 0) {
      clearInterval(interval);
      closeAlert();
    }
  }, 100);
});

watch(
  () => props.duration,
  () => {
    progress.value = 100;
    isVisible.value = true;
  }
);
</script>

<template>
  <div
    v-if="isVisible"
    class="w-full"
  >
    <div class="flex justify-between items-center p-4 bg-red-100 rounded border border-red-200">
      <span>{{ props.message }}</span>
      <X class="cursor-pointer ml-2" @click="closeAlert" />
    </div>
    <div class="h-1 bg-red-400 mt-2 transition-all" :style="{ width: progress + '%' }"></div>
  </div>
</template>
