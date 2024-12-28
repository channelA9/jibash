<script setup lang="ts">
import { ScopeSettings } from "../ai/defs/types";
import { Scope } from "../ai/Scope";
import { Situation } from "../ai/Situation";
import { ref, watch } from "vue";
import GenerationSettings from "./left/GenerationSettings.vue";
import UserProfile from "./left/UserProfile.vue";
import APISettings from "./left/APISettings.vue";
const props = defineProps<{
  situation?: Situation;
  scope: Scope;
}>();

const view = ref<string>("settings");

const setView = (newView: string) => {
  view.value = newView;
};
const settings = ref<ScopeSettings>(props.scope.getSettings());

watch(settings, () => {
  props.scope.updateSettings(settings.value);
})
</script>

<template>
  <div class="flex flex-col w-full max-w-sm h-full border-r">
    <div class="h-16 border-b">
      <button class="w-16 h-16 border-r hover:bg-neutral-300" @click="setView('profile')">
        UFX
      </button>
      <button class="w-16 h-16 border-r hover:bg-neutral-300" @click="setView('settings')">
        Settings
      </button>
      <button class="w-16 h-16 border-r hover:bg-neutral-300" @click="setView('api')">API</button>
    </div>

    <div class="flex flex-col w-full border-b flex-grow">
      <GenerationSettings v-if="view == 'settings'" :situation="situation" :scope="scope" />
      <UserProfile v-else-if="view == 'profile'" :situation="situation" :scope="scope" />
      <APISettings v-else-if="view == 'api'" :situation="situation" :scope="scope" />
    </div>
    <div class="h-16"></div>
  </div>
</template>
