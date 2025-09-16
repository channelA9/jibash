<script setup lang="ts">
import { ScopeSettings } from "@/ai/defs/types";
import { Scope } from "@/ai/Scope";
import { Situation } from "@/ai/Situation";
import { ref, watch } from "vue";
import GenerationSettings from "@/components/views/left/GenerationSettings.vue";
import UserProfile from "@/components/views/left/UserProfile.vue";
import APISettings from "@/components/views/left/APISettings.vue";
import { View } from "@/utils/view";
import { Menu } from "lucide-vue-next";
const props = defineProps<{
  situation?: Situation;
  scope: Scope;
  view: View;
}>();
const settings = ref<ScopeSettings>(props.scope.getSettings());

watch(settings, () => {
  props.scope.updateSettings(settings.value);
});
</script>

<template>
  <div class="flex flex-col w-full xl:max-w-sm h-fit xl:h-full xl:border-r">
    <div :class="{'fixed xl:relative': view.current == 'main'} " class="flex w-full h-16 xl:border-b">
      <button
        :class="{ 'hidden xl:block': view.current == 'main' }"
        class="w-16 h-16 border-r hover:bg-neutral-300"
        @click="view.setView('lprofile')"
      >
        User
      </button>
      <button
        :class="{ 'hidden xl:block': view.current == 'main' }"
        class="w-16 h-16 border-r hover:bg-neutral-300"
        @click="view.setView('lsettings')"
      >
        Settings
      </button>
      <button
        :class="{ 'hidden xl:block': view.current == 'main' }"
        class="w-16 h-16 border-r hover:bg-neutral-300"
        @click="view.setView('lapi')"
      >
        API
      </button>
      <span class="flex flex-grow h-16"></span>
      <button
        v-if="view.current == 'main'"
        class="flex items-center justify-center xl:hidden w-16 h-16 border-x hover:bg-neutral-300"
        @click="view.setView('r')"
      >
        <Menu />
      </button>
      <button
        v-if="view.current != 'main'"
        class="flex items-center justify-center xl:hidden w-16 h-16 hover:bg-neutral-300"
        @click="view.setView('main')"
      >
        <Menu />
      </button>
    </div>

    <div
      :class="{ hidden: view.current[0] != 'l' }"
      class="xl:flex flex-col w-full border-b flex-grow overflow-y-auto h-[calc(100vh-4rem)] xl:h-fit"
    >
      <GenerationSettings
        v-if="view.current == 'lsettings'"
        :situation="situation"
        :scope="scope"
      />
      <UserProfile v-else-if="view.current == 'lprofile'" :situation="situation" :scope="scope" />
      <APISettings v-else-if="view.current == 'lapi'" :situation="situation" :scope="scope" />
    </div>
  </div>
</template>
