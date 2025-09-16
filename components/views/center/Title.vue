<script setup lang="ts">
import { Scope } from "@/ai/Scope";
import { Situation } from "@/ai/Situation";

const props = defineProps<{
  situation: Situation;
  scope: Scope;
}>();
</script>

<template>
  <div class="flex w-full h-16 items-center justify-center border-b">
    <h1 class="text-xl">{{ situation.getTitle() ?? '' }}</h1>
  </div>
</template>
