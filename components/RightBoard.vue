<script setup lang="ts">
import { Scope } from "../ai/Scope";
import { Situation } from "../ai/Situation";
import { ScopeManager } from "../ai/ScopeManager";
import { RotateCcw, Save, ArrowBigRight, FileCheck, CircleCheckBig } from "lucide-vue-next";

import SituationViewer from "./right/SituationViewer.vue";
import History from "./right/History.vue";

const props = defineProps<{
  manager?: ScopeManager;
  situation?: Situation;
  scope: Scope;
}>();

const restart = () => {
  props.manager?.saveCurrentScope();
  props.manager?.loadScopes();
  props.scope.restart();
};
</script>

<template>
  <div class="flex flex-col w-full max-w-sm h-full border-l">
    <History
      v-if="scope.getStage() == 'generate' || scope.getStage() == 'overview'"
      :manager="manager"
      :scope="scope"
    />
    <SituationViewer
      v-else-if="
        (situation && scope.getStage() == 'report') ||
        scope.getStage() == 'situations'
      "
      :situation="situation"
      :scope="scope"
    />
    <div class="flex flex-col flex-grow items-center justify-center border-t">
      <div class="flex border">
        <button
          v-if="scope.getStage() == 'situations'"
          class="h-24 w-24 bg-neutral-100 flex flex-col gap-2 items-center justify-center hover:bg-neutral-200"
          @click="scope.finishSituation()"
        >
          <h2 class="text-xs">Score Conversation</h2>
          <FileCheck />
        </button>
        <button
          v-else-if="scope.getStage() == 'report'"
          class="h-24 w-24 bg-neutral-100 flex flex-col gap-2 items-center justify-center hover:bg-neutral-200"
          @click="scope.next()"
        >
          <h2 class="text-xs">Move to next Conversation</h2>
          <ArrowBigRight />
        </button>
        <button
          v-if="scope.allCompleted()"
          class="h-24 w-24 bg-blue-500 flex flex-col gap-2 items-center justify-center hover:bg-blue-600"
          @click="scope.restart()"
        >
          <h2 class="text-xs">End Session</h2>
          <CircleCheckBig />
        </button>
      </div>
    </div>
    <div class="h-16 flex items-center justify-end border-t">
      <button
        class="border-l h-16 w-16 flex items-center justify-center"
        @click="manager?.saveCurrentScope()"
      >
        <Save />
      </button>
      <button
        class="border-l h-16 w-16 flex items-center justify-center"
        @click="restart"
      >
        <RotateCcw />
      </button>
    </div>
  </div>
</template>
