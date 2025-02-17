<script setup lang="ts">
import { Scope } from "../../ai/Scope";
import { Situation } from "../../ai/Situation";
import { ScopeManager } from "../../ai/ScopeManager";
import ScopeBlock from "../subcomponents/ScopeBlock.vue";
import { ref } from "vue";
const props = defineProps<{
  manager?: ScopeManager;
  scope: Scope;
}>();

const bounce = ref<boolean>(true)

function handleDeleteScope(name: string) {
  bounce.value = false
  if (props.scope.name == name) props.scope.setStage("generate")
  if (props.manager) {
    props.manager?.deleteScope(name);
  }
  bounce.value = true
}
</script>

<template>
  <div
    v-if="manager && bounce"
    class="flex flex-col w-full p-4 max-h-[calc(100vh-8vh)] overflow-y-auto gap-2"
  >
    <h2 class="text-lg">History</h2>
    <ScopeBlock
      v-for="selectableScope in manager.loadScopes()"
      :key="`select-${selectableScope.name}`"
      :scope-view="selectableScope"
      @load-scope="scope.loadScope(selectableScope)"
      @delete-scope="handleDeleteScope(selectableScope.name)"
    />
    <p v-if="manager.loadScopes().length == 0" class="text-sm">Any saved sessions will show up here!</p>
  </div>
</template>
