<script setup lang="ts">
import ChatMessage from "../subcomponents/ChatMessage.vue";
import ChatSubtext from "../subcomponents/ChatSubtext.vue";
import Loading from "../subcomponents/Loading.vue";

import { Scope } from "../../ai/Scope";
import { ref, watch } from "vue";

import { Situation } from "../../ai/Situation";
import { SituationFinishReport } from "../../ai/defs/types";

const props = defineProps<{
  report?: SituationFinishReport;
}>();
</script>

<template>
  <div class="flex flex-col gap-4 m-auto h-full max-w-md">
    <template v-if="report">
      <div class="p-8 flex flex-col gap-4">
        <div
          class="flex justify-center items-center mx-auto p-4 rounded"
        >
          <div class="flex flex-col items-center justify-center">
            <label class="text-lg">Overall</label>
            <h1 class="text-4xl font-black">{{ report.score.overall }}</h1>
          </div>
        </div>
        <div class="flex justify-center items-center mx-auto gap-8 border">
          <div class="flex flex-col items-center justify-center p-4">
            <label>Fluency</label>
            <h1 class="text-2xl font-semibold">{{ report.score.fluency }}</h1>
          </div>
          <div class="flex flex-col items-center justify-center p-4">
            <label>Grammar</label>
            <h1 class="text-2xl font-semibold">{{ report.score.grammar }}</h1>
          </div>
          <div class="flex flex-col items-center justify-center p-4">
            <label>Role</label>
            <h1 class="text-2xl font-semibold">{{ report.score.role }}</h1>
          </div>
        </div>
      </div>
      <div class="border-t pt-4 h-1/2 flex flex-col">
        <h1 class="text-xl">Summary</h1>
        <p class="text-sm">{{ report.analysis }}</p>
      </div>
      <div
        class="flex flex-col gap-4 h-full p-8"
      >
        <div
          v-for="comment in report.comments"
          :key="`comment-${comment.quote}`"
          class="flex flex-col items-start justify-center h-32 border-neutral-300"
        >
          <p class="text-sm italic">"{{ comment.quote }}"</p>
          <p class="text-xs">{{ comment.analysis }}</p>
        </div>
        <div
          v-for="comment in report.comments"
          :key="`comment-${comment.quote}`"
          class="flex flex-col items-start justify-center h-32 border-neutral-300"
        >
          <p class="text-sm italic">"{{ comment.quote }}"</p>
          <p class="text-xs">{{ comment.analysis }}</p>
        </div>
        <div
          v-for="comment in report.comments"
          :key="`comment-${comment.quote}`"
          class="flex flex-col items-start justify-center h-32 border-neutral-300"
        >
          <p class="text-sm italic">"{{ comment.quote }}"</p>
          <p class="text-xs">{{ comment.analysis }}</p>
        </div>
        <div
          v-for="comment in report.comments"
          :key="`comment-${comment.quote}`"
          class="flex flex-col items-start justify-center h-32 border-neutral-300"
        >
          <p class="text-sm italic">"{{ comment.quote }}"</p>
          <p class="text-xs">{{ comment.analysis }}</p>
        </div>
        <div
          v-for="comment in report.comments"
          :key="`comment-${comment.quote}`"
          class="flex flex-col items-start justify-center h-32 border-neutral-300"
        >
          <p class="text-sm italic">"{{ comment.quote }}"</p>
          <p class="text-xs">{{ comment.analysis }}</p>
        </div>
        <div
          v-for="comment in report.comments"
          :key="`comment-${comment.quote}`"
          class="flex flex-col items-start justify-center h-32 border-neutral-300"
        >
          <p class="text-sm italic">"{{ comment.quote }}"</p>
          <p class="text-xs">{{ comment.analysis }}</p>
        </div>
        <div
          v-for="comment in report.comments"
          :key="`comment-${comment.quote}`"
          class="flex flex-col items-start justify-center h-32 border-neutral-300"
        >
          <p class="text-sm italic">"{{ comment.quote }}"</p>
          <p class="text-xs">{{ comment.analysis }}</p>
        </div>
      </div>
    </template>
    <Loading v-else />
  </div>
</template>
