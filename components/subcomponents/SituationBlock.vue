<script setup lang="ts">
import { Situation } from "../../ai/Situation";

import Avatar from "./Avatar.vue";
const props = defineProps<{
  situation: Situation;
}>();

const trunc = props.situation.getDescription();
const settings = props.situation.getSettings();
</script>

<template>
  <div class="flex flex-col h-fit w-full max-w-md mx-auto gap-1 py-2">
    <h1 class="text-lg">{{ props.situation.getTitle() }}</h1>
    <p class="font-light text-sm">{{ trunc }}</p>
    <div class="flex gap-12 mt-8">
      <div id="agents" class="flex flex-grow -space-x-4">
        <Avatar
          v-for="(agent, i) in situation.getAgents()"
          :key="`icon-${i}-${agent.getName()}`"
        />
      </div>
      <div class="flex flex-col items-center justify-center">
        <label class="text-sm font-light">Duration</label>
        <p>{{ settings.discussionDuration }}s</p>
      </div>
      <div class="flex flex-col items-center justify-center">
        <label class="text-sm font-light">Agents</label>
        <p>{{ settings.agentDefs.length }}</p>
      </div>
    </div>
  </div>
</template>
