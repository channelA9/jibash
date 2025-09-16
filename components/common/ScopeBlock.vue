<script setup lang="ts">
import { ScopeView } from "@/ai/defs/types";
import { Target, List, Trash, Play } from "lucide-vue-next";

const props = defineProps<{
  scopeView: ScopeView;
}>();

const emit = defineEmits<{
  (event: "load-scope"): void;
  (event: "delete-scope"): void;
}>();
</script>

<template>
  <button
    class="w-full flex flex-col items-start py-4 gap-1 border-t"
    @click="emit('load-scope')"
  >
    <div class="flex flex-col gap-2 items-start">
      <div class="flex w-full justify-between">
        <h2 class="text-left break-all">{{ scopeView.name }}</h2>
      </div>
    </div>
    <div class="flex items-center gap-1 w-full">
      <div
        class="text-sm flex gap-1 items-center justify-center border rounded p-1 text-neutral-500"
      >
        <h3>{{ scopeView.situationViews.length }} Scenarios</h3>
      </div>
      <div class="flex-grow"></div>
      <button class="text-neutral-300 hover:text-red-400 z-50 p-2" @click.stop="emit('delete-scope')">
        <Trash :size="16" />
      </button>
      <button class="text-neutral-500 hover:text-green-400 z-50 p-2" @click.stop="emit('load-scope')">
        <Play :size="24" />
      </button>
    </div>
  </button>
</template>
