<script setup lang="ts">
import { ScopeView } from '../../ai/defs/types';
import { Target, List } from 'lucide-vue-next';

const props = defineProps<{
  scopeView: ScopeView;
}>();

const emit = defineEmits<{
  (event: "load-scope"): void;
}>();

</script>

<template>
  <button class="w-full flex flex-col items-start py-4 gap-1" @click="emit('load-scope')">
    <div class="flex flex-col gap-2 items-start">
      <h2 class=" text-left">{{ scopeView.name }}</h2>
      <div
        class="text-sm flex gap-1 items-center justify-center border rounded p-1 text-neutral-500"
      >
        <h3>{{ scopeView.situationViews.length }} Scenarios</h3>
      </div>
    </div>
  </button>
</template>