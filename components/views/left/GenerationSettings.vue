<script setup lang="ts">
import { ScopeSettings } from "@/ai/defs/types";
import { Scope } from "@/ai/Scope";
import { Situation } from "@/ai/Situation";
import { ref, watch, watchEffect } from "vue";

const props = defineProps<{
  situation?: Situation;
  scope: Scope;
}>();

const settings = ref<ScopeSettings>(props.scope.getSettings());

const languages = ["english", "japanese", "chinese (simplified)", "chinese (traditional)", "spanish"];
const customLanguage = ref("");

watchEffect(() => {
  props.scope.updateSettings(settings.value);
});

</script>

<template>
  <div class="flex flex-col p-4 gap-4">
    <h1 class="text-lg">Generation Settings</h1>
    <form class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="targetlanguage" class="text-sm">Target Language</label>
        <select
          id="targetlanguage"
          v-model="settings.language"
          class="border rounded p-2"
        >
          <option v-for="lang in languages" :key="lang" :value="lang">{{ lang.charAt(0).toUpperCase() + lang.slice(1) }}</option>
          <option value="custom">Custom</option>
        </select>
        <input
          v-if="settings.language === 'custom'"
          v-model="customLanguage"
          @input="settings.language = customLanguage"
          type="text"
          placeholder="Enter custom language"
          class="border rounded p-2 mt-2"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label for="nativelanguage" class="text-sm">Native Language</label>
        <select
          id="nativelanguage"
          v-model="settings.nativeLanguage"
          class="border rounded p-2"
        >
          <option v-for="lang in languages" :key="lang" :value="lang">{{ lang.charAt(0).toUpperCase() + lang.slice(1) }}</option>
          <option value="custom">Custom</option>
        </select>
        <input
          v-if="settings.nativeLanguage === 'custom'"
          v-model="customLanguage"
          @input="settings.nativeLanguage = customLanguage"
          type="text"
          placeholder="Enter custom language"
          class="border rounded p-2 mt-2"
        />
      </div>

      <div class="flex flex-row gap-1">
        <input
          id="timerenabled"
          v-model="settings.timerEnabled"
          type="checkbox"
        />
        <label for="timerenabled" class="text-sm">Timer Enabled</label>
      </div>
      <div class="flex flex-row gap-1">
        <input
          id="multimessagegenerationenabled"
          v-model="settings.multiMessageGenerationEnabled"
          type="checkbox"
        />
        <label for="multimessagegenerationenabled" class="text-sm">
          MultiGen
        </label>
      </div>
      <div class="flex flex-row gap-1">
        <input
          id="nativedesc"
          v-model="settings.descriptionsInNativeLanguage"
          type="checkbox"
        />
        <label for="nativedesc" class="text-sm"> Native Descriptions </label>
      </div>
      <div class="flex flex-col gap-1">
        <label for="scenariocount" class="text-sm">Scenario Count</label>
        <input
          id="scenariocount"
          v-model="settings.scenarioCount"
          type="range"
          min="1"
          max="5"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label for="minagent" class="text-sm">Minimum Agents</label>
        <input
          id="minagent"
          v-model="settings.minAgents"
          type="range"
          min="1"
          max="4"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label for="maxagent" class="text-sm">Maxmimum Agents</label>
        <input
          id="maxagent"
          v-model="settings.maxAgents"
          type="range"
          :min="settings.minAgents"
          max="4"
        />
      </div>
    </form>
  </div>
</template>
