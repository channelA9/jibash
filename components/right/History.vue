<script setup lang="ts">
import { Scope } from "../../ai/Scope";
import { Situation } from "../../ai/Situation";
import { ScopeManager } from "../../ai/ScopeManager";
import ScopeBlock from "../subcomponents/ScopeBlock.vue";
const props = defineProps<{
  manager?: ScopeManager;
  scope: Scope;
}>();
</script>

<template>
  <div
    v-if="manager"
    class="flex flex-col w-full p-4 max-h-[calc(100vh-8vh)] overflow-y-auto"
  >
    <h2 class="text-lg">History</h2>
    <ScopeBlock
      v-for="selectableScope in manager.loadScopes()"
      :key="`select-${selectableScope.name}`"
      :scope-view="selectableScope"
      @load-scope="scope.loadScope(selectableScope)"
    />
    <p v-if="manager.loadScopes().length == 0" class="text-sm">Any saved sessions will show up here!</p>
  </div>
</template>
