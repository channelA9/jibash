<script setup lang="ts">
import {
  AIInterfaceGenerationSettings,
  ScopeSettings,
} from "../../ai/defs/types";
import { AIInterface } from "../../ai/model_interfaces/base";
import { Scope } from "../../ai/Scope";
import { Situation } from "../../ai/Situation";
import { ref, watch, watchEffect } from "vue";

const props = defineProps<{
  situation?: Situation;
  scope: Scope;
}>();

const provider = ref<string>(props.scope.getProvider());
const oldProvider = ref<string>(provider.value);
const generationSettings = ref<AIInterfaceGenerationSettings>(
  props.scope.getModelInterface().generationSettings
);

const keyValue = ref<string>(props.scope.getAPIKeys()[provider.value] ?? "");
const models = ref<string[]>(props.scope.getModelInterface().getModels());

const primaryModel = ref<string>(props.scope.getModelInterface().primaryModelName);
const utilityModel = ref<string>(props.scope.getModelInterface().utilityModelName);

const hideSensitive = ref<boolean>(true);

watchEffect(() => {
  props.scope.getModelInterface().generationSettings = generationSettings.value;
  props.scope.getModelInterface().setModel(primaryModel.value, 'primary');
  props.scope.getModelInterface().setModel(utilityModel.value, 'utility');
});

const updateOnProviderChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (oldProvider.value != provider.value) {
    props.scope.updateAPIKey(keyValue.value, oldProvider.value);
    oldProvider.value = provider.value;
  }
  provider.value = target.value;
  props.scope.setProvider(provider.value);
  props.scope.getModelInterface().generationSettings = generationSettings.value;

  models.value = props.scope.getModelInterface().getModels();

  keyValue.value = props.scope.getAPIKeys()[provider.value] ?? "";
};

function connect() {
  props.scope.updateAPIKey(keyValue.value, provider.value);
}
</script>

<template>
  <div class="flex flex-col p-4 gap-4">
    <h1 class="text-lg">API Settings</h1>
    <form class="flex flex-col gap-2" @submit.prevent="connect">
      <div class="flex flex-col gap-1">
        <label for="provider" class="text-sm">Provider</label>
        <select
          id="provider"
          v-model="provider"
          class="border rounded p-2"
          @change="updateOnProviderChange"
        >
          <option
            v-for="selectableProvider in props.scope.providers"
            :key="`select-${selectableProvider}`"
            :value="selectableProvider"
          >
            {{ selectableProvider }}
          </option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label for="apikey" class="text-sm">API Key</label>
        <input
          id="apikey"
          v-model="keyValue"
          class="border rounded p-2"
          :type="hideSensitive ? 'password' : 'text'"
        />
      </div>
      <button type="submit" class="border rounded w-fit m-auto p-2">Connect</button>
    </form>
    <form class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="primarymodel" class="text-sm">Primary Model</label>
        <select
          id="primarymodel"
          v-model="primaryModel"
          class="border rounded p-2"
        >
          <option
            v-for="model in models"
            :key="`select-${model}`"
            :value="model"
          >
            {{ model }}
          </option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label for="primarymodel" class="text-sm">Utility Model</label>
        <select
          id="utilitymodel"
          v-model="utilityModel"
          class="border rounded p-2"
        >
          <option
            v-for="model in models"
            :key="`select-${model}`"
            :value="model"
          >
            {{ model }}
          </option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label for="maxoutputtokens" class="text-sm">Max Output Tokens</label>
        <input
          id="maxoutputtokens"
          v-model="generationSettings.maxOutputTokens"
          class="rounded border p-2"
          type="text"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label for="temperature" class="text-sm">Temperature</label>
        <div class="flex gap-2 w-full">
          <input
            id="temperature-slider"
            v-model="generationSettings.temperature"
            class="w-full"
            type="range"
            min="0"
            max="2"
            step="0.01"
          />
          <input
            id="temperature"
            v-model="generationSettings.temperature"
            class="w-16 rounded border p-1"
            type="number"
            min="0"
            max="2"
            step="0.10"
          />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label for="topk" class="text-sm">TopK</label>
        <div class="flex gap-2 w-full">
          <input
            id="topk-slider"
            v-model="generationSettings.topK"
            class="w-full"
            type="range"
            min="0"
            max="100"
            step="1"
          />
          <input
            id="topk"
            v-model="generationSettings.topK"
            class="w-16 rounded border p-1"
            type="number"
            min="0"
            max="100"
            step="1"
          />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label for="topp" class="text-sm">TopP</label>
        <div class="flex gap-2 w-full">
          <input
            id="topp-slider"
            v-model="generationSettings.topP"
            class="w-full"
            type="range"
            min="0"
            max="1"
            step="0.01"
          />
          <input
            id="topp"
            v-model="generationSettings.topP"
            class="w-16 rounded border p-1"
            type="number"
            min="0"
            max="1"
            step="0.1"
          />
        </div>
      </div>
      
    </form>
  </div>
</template>
