<script setup lang="ts">
import Avatar from "@/components/subcomponents/Avatar.vue";
import { Trash } from "lucide-vue-next";
interface Props {
  sender: string;
  content: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (event: "delete-message"): void;
}>();
</script>

<template>
  <div class="flex gap-4 pl-2 h-fit p-4 border-b border-neutral-100">
    <Avatar v-if="props.sender != 'SYSTEM'" />
    <div v-else class="w-5"></div>
    <div
      v-if="props.sender != 'SYSTEM'"
      class="flex flex-col flex-grow w-full h-full group gap-1"
    >
      <div class="flex">
        <label id="sender" class="text-xs md:text-sm font-light flex-grow">{{
          props.sender
        }}</label>
        <span class="group-hover:flex hidden">
          <Trash
            class="cursor-pointer text-neutral-500"
            :size="16"
            @click="emit('delete-message')"
          />
        </span>
      </div>
      <p id="message-content" class="max-w-2xl text-sm md:text-base">{{ props.content }}</p>
    </div>
    <div v-else class="flex flex-col gap-1 flex-grow w-full h-full pl-7 group pb-4">
      <div class="flex">
        <div class="h-4 flex-grow"></div>
        <span class="group-hover:flex hidden">
          <Trash
            class="cursor-pointer text-neutral-500"
            :size="16"
            @click="emit('delete-message')"
          />
        </span>
      </div>
      <p
        id="message-content"
        class="text-neutral-700 font-light max-w-2xl text-sm md:text-base"
      >
        {{ props.content }}
      </p>
    </div>
  </div>
</template>
