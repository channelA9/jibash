<script setup lang="ts">
import { ref, watch } from "vue";
import { Edit, Check } from "lucide-vue-next";
const props = defineProps<{
  title: string;
  varValue: string;
  updateFunction: (value: string) => void;
}>();

const editMode = ref<boolean>(false);
const value = ref<string>(props.varValue);

watch(value, () => {
  props.updateFunction(value.value);
});

const toggleEditMode = () => {
  editMode.value = !editMode.value;
};
</script>

<template>
  <div v-if="value" class="flex flex-col w-full border-b p-4 group">
    <div class="flex items-center">
      <h2 class="text-lg flex-grow">{{ title }}</h2>
      <button
        class="text-sm text-neutral-500 underline"
        :class="{ 'flex': editMode, 'hidden group-hover:flex': !editMode }"
        @click="toggleEditMode"
      >
        <component :is="editMode ? Check : Edit" :size="16" />
      </button>
    </div>
    <template v-if="!editMode">
      <p class="text-sm text-neutral-800">{{ value }}</p>
    </template>
    <template v-else>
      <textarea
        v-model="value"
        class="border border-neutral-300 p-1 w-full text-sm min-h-24 h-fit max-h-36"
      />
    </template>
  </div>
</template>
