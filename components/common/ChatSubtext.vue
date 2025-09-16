<script setup lang="ts">
interface Props {
  sender: string;
  content: string;
}
const props = defineProps<Props>();
</script>

<template>
  <div class="flex gap-2 p-2 h-fit">
    <div class="min-w-12 h-12 rounded-full border"></div>
    <div class="flex flex-col flex-grow h-fit">
      <p class="font-light">{{ props.content }}</p>
    </div>
  </div>
</template>
