<script setup lang="ts">
import { Scope } from "../ai/Scope";
import { Situation } from "../ai/Situation";
import { ScopeManager } from "../ai/ScopeManager";
import { RotateCcw, Save, ArrowBigRight, FileCheck, CircleCheckBig } from "lucide-vue-next";

import SituationViewer from "./right/SituationViewer.vue";
import History from "./right/History.vue";
import { View } from "../utils/view";

const props = defineProps<{
  manager?: ScopeManager;
  situation?: Situation;
  scope: Scope;
  view: View;
}>();

const restart = () => {
  props.manager?.saveCurrentScope();
  props.manager?.loadScopes();
  props.scope.restart();
};
</script>

<template>
  <div
    :class="{ 'hidden xl:flex': view.current[0] != 'r' }"
    class="flex-col w-full xl:max-w-sm xl:h-full h-[calc(100vh-4rem)] border-l border-t xl:border-t-0"
  >
    <div class="flex flex-col h-[calc(100vh-8rem)] xl:h-full flex-grow overflow-y-auto">
      <History
        v-if="scope.getStage() == 'generate' || scope.getStage() == 'overview'"
        :manager="manager"
        :scope="scope"
      />
      <SituationViewer
        v-else-if="(situation && scope.getStage() == 'report') || scope.getStage() == 'situations'"
        :situation="situation"
        :scope="scope"
      />
    </div>
    <div class="h-16 flex items-center justify-end border-t">
      <button
        v-if="scope.getStage() == 'situations'"
        class="border h-16 w-24 bg-green-200 border-green-400 flex flex-col gap-2 items-center justify-center hover:bg-green-300"
        @click="scope.finishSituation()"
      >
        <h2 class="text-xs">Score Conversation</h2>
      </button>
      <button
        v-else-if="scope.getStage() == 'report'"
        class="border h-16 w-24 bg-blue-200 border-blue-400 flex flex-col gap-2 items-center justify-center hover:bg-blue-300"
        @click="scope.next()"
      >
        <h2 class="text-xs">Move to next Conversation</h2>
      </button>
      <button
        v-if="scope.allCompleted()"
        class="border h-16 w-24 bg-red-200 border-red-400 flex flex-col gap-2 items-center justify-center hover:bg-red-300"
        @click="scope.restart()"
      >
        <h2 class="text-xs">End Session</h2>
      </button>
      <button
        class="border-l h-16 w-16 flex items-center justify-center"
        @click="manager?.saveCurrentScope()"
      >
        <Save />
      </button>
      <button class="border-l h-16 w-16 flex items-center justify-center" @click="restart">
        <RotateCcw />
      </button>
    </div>
  </div>
</template>
