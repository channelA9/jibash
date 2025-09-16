<script setup lang="ts">
import ChatMessage from "@/components/common/ChatMessage.vue";
import ChatSubtext from "@/components/common/ChatSubtext.vue";
import { Scope } from "@/ai/Scope";
import { ref } from "vue";
import Logo from "@/components/common/Logo.vue";
import { Play } from "lucide-vue-next";
const props = defineProps<{
  scope: Scope;
}>();

const text = ref<string>("");

function handleSubmit() {
  text.value = text.value.trimEnd();
  if (text.value != "") {
    props.scope.generateSituations(text.value);
    props.scope.setStage("overview");
    console.log("Creating scenarios...");
  }
}
</script>

<template>
  <div class="flex flex-col gap-2 w-full items-center h-[700px] p-8 xl:p-0 text-center xl:text-left">
    <div class="flex flex-col max-w-xl gap-4 my-auto">
      <div class="flex justify-center p-2">
        <Logo/>
      </div>
      <h1 class="text-lg">Welcome to jiBash!</h1>
      <p class="text-sm">
        jiBash is a tool primarily designed for practicing conversations using agentic chatbots.
      </p>
      <p class="text-sm">
        To begin, enter a Google AI API key and adjust the settings. Then,
        describe what kinds of conversations or situations you'd like to
        practice.
      </p>

      <form class="flex gap-2" @submit.prevent="handleSubmit">
        <input
          v-model="text"
          type="text"
          class="border rounded p-4 flex-grow"
          placeholder="Describe what you'd like to practice here..."
        />
        <button
          class="w-14 rounded border bg-blue-500 border-blue-700 text-white flex items-center justify-center"
          type="submit"
        ><Play /></button>
      </form>
    </div>
  </div>
</template>
