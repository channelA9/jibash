<script setup lang="ts">
import { Situation } from "../../ai/Situation";
import { ref } from "vue";
const props = defineProps<{
  situation: Situation;
}>();

const text = ref<string>("");

function handleSubmit() {
  text.value = text.value.trimEnd();
  if (text.value != "") {
    props.situation.send({ sender: "user", content: text.value });
    text.value = "";
  }
}
</script>

<template>
  <div
    id="container"
    class="bg-neutral-400 flex items-center justify-center w-full h-fit"
  >
    <div class="w-[600px] h-[400px] border bg-white border"></div>
  </div>
</template>
