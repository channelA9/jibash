<script setup lang="ts">
import ChatMessage from "../subcomponents/ChatMessage.vue";
import { Situation } from "../../ai/Situation";
import { ref, watch, nextTick, onMounted } from "vue";
import { Message } from "../../ai/defs/types";
import { Play, StopCircle } from "lucide-vue-next";
const props = defineProps<{
  situation: Situation;
}>();

const messages = ref<Message[] | undefined>(undefined);
const text = ref<string>("");
const chatContainer = ref<HTMLDivElement | null>(null); // Reference to the chat container

// Function to scroll to the bottom of the chat container
function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

function handleSubmit() {
  text.value = text.value.trimEnd();
  if (text.value != "") {
    props.situation.send({ sender: "user", content: text.value });
    text.value = "";
  }
}

// Watch for changes in messages and scroll to the bottom
watch(
  () => props.situation.getMessages(),
  async () => {
    messages.value = props.situation.getMessages();
    await nextTick(); // Wait for DOM updates
    scrollToBottom();
  },
  { deep: true }
);
</script>

<template>
  <div class="flex flex-col w-full flex-grow h-[calc(100vh-4rem)] xl:overflow-y-auto bg-white">
    <div ref="chatContainer" class="flex flex-col flex-grow overflow-y-scroll">
      <ChatMessage
        v-for="(msg, i) in messages"
        :key="`${msg.sender}-${i}`"
        :content="msg.content"
        :sender="msg.sender"
        @delete-message="props.situation.deleteMessage(i)"
      />
      <div
        v-if="props.situation.getMessages().length == 0"
        class="w-full h-full flex flex-col items-center justify-center"
      >
        <template v-if="props.situation.inputDisabled()">
          <h1
            class="text-lg text-neutral-500"
          >
            Generating messages...
          </h1>
        </template>
        <template v-else>
          <h1 class="text-lg text-neutral-500">No messages yet.</h1>
          <button @click="props.situation.startSituation()">
            Start Generation
          </button>
        </template>
      </div>
    </div>
    <form class="flex grow-0" @submit.prevent="handleSubmit">
      <input
        v-model="text"
        type="text"
        class="border-t h-16 flex-grow p-2 disabled:bg-neutral-400"
        placeholder="Type your message here..."
        :disabled="situation.inputDisabled()"
      />
      <button
        v-if="!situation.inputDisabled()"
        class="w-16 flex items-center justify-center border bg-blue-500 border-blue-700 disabled:bg-blue-200"
        type="submit"
        :disabled="situation.inputDisabled()"
      >
        <Play class="text-white" :size="24" />
      </button>
      <button
        v-if="situation.inputDisabled()"
        class="w-16 flex items-center justify-center border bg-red-500 border-red-700 disabled:bg-blue-200"
        @click="situation.cancelStream()"
      >
        <StopCircle class="text-white" :size="24" />
      </button>
    </form>
  </div>
</template>
