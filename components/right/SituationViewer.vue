<script setup lang="ts">
import { Scope } from "../../ai/Scope";
import { Situation } from "../../ai/Situation";
import { ChevronsLeft, ChevronsRight, RotateCcw } from "lucide-vue-next";
import AgentBlock from "../subcomponents/AgentBlock.vue";
import ShowEditNode from "../subcomponents/ShowEditNode.vue";

const props = defineProps<{
  situation?: Situation;
  scope: Scope;
}>();

const timerString = (time: number) => {
  const minutes = Math.floor(time / 60).toString();
  const seconds = (time % 60).toString();

  return `${minutes}:${seconds.length == 1 ? `0${seconds}` : seconds}`;
};
</script>

<template>
  <div class="flex flex-col justify-center xl:h-16 border-b">
    <div v-if="scope.getSettings().timerEnabled == true">
      <h1 class="text-lg w-full">
        {{ timerString((scope.getTimer()?.getTimeLeft() ?? 0) / 1000) }}
      </h1>
    </div>
    <div class="flex justify-center items-center">
      <button class="flex items-center justify-center p-2 px-4 xl:h-16 xl:w-16" @click="scope.previous()">
        <ChevronsLeft />
      </button>
      <h1 class="xl:h-16 xl:w-16 w-8 flex items-center justify-center">
        {{ scope.getSituationIndex() + 1 }}
      </h1>
      <button class="flex items-center justify-center p-2 px-4 xl:h-16 xl:w-16" @click="scope.next()">
        <ChevronsRight />
      </button>
    </div>
    <div class="xl:hidden w-full flex items-center justify-center p-2">
      <h1 class="text-xs">
        {{ situation?.getTitle() }}
      </h1>
    </div>
  </div>
  <ShowEditNode
    v-if="situation"
    title="Objective"
    :var-value="situation.getObjective()"
    :update-function="situation.setObjective.bind(situation)"
  />
  <ShowEditNode
    v-if="situation"
    title="Scene"
    :var-value="situation.getDescription()"
    :update-function="situation.setDescription.bind(situation)"
  />
  <div v-if="situation" class="border-b p-4 flex flex-col flex-grow">
    <AgentBlock v-for="(agent, i) in situation.getAgents()" :key="`${i}-${agent}`" :agent="agent" />
  </div>
</template>
