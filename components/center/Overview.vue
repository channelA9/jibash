<script setup lang="ts">
import ChatMessage from "../subcomponents/ChatMessage.vue";
import ChatSubtext from "../subcomponents/ChatSubtext.vue";
import Loading from "../subcomponents/Loading.vue";

import { Scope } from "../../ai/Scope";
import { ref } from "vue";
import SituationBlock from "../subcomponents/SituationBlock.vue";

const props = defineProps<{
  scope: Scope;
}>();

</script>

<template>
  <div class="flex flex-col gap-2 w-full h-full overflow-y-auto p-8">
    <h1 class="text-2xl font-bold mx-auto">Scenarios</h1>
    <div
      v-if="scope.getSituations().length > 0"
      class="flex-grow flex flex-col gap-12"
    >
      <SituationBlock
        v-for="(situation, i) in scope.getSituations()"
        :key="`${i}`"
        :situation="situation"
      />
    </div>
    <Loading v-else />
    <button
      class="w-32 mx-auto min-h-16 rounded border bg-blue-500 border-blue-700 text-white"
      type="submit"
      @click="scope.start()"
    ><h1>START</h1></button>
  </div>
</template>
