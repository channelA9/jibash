<script setup lang="ts">
import { Situation } from "../../ai/Situation";

import Avatar from "./Avatar.vue";
const props = defineProps<{
  situation: Situation;
}>();

const trunc = props.situation.getDescription().slice(0, 200) + "...";
const settings = props.situation.getSettings()
</script>

<template>
  <div class="flex flex-col flex-grow h-fit gap-1 py-2">
  </div>
</template>
