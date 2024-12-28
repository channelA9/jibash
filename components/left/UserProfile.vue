<script setup lang="ts">
import { Profile, ScopeSettings } from "../../ai/defs/types";
import { Scope } from "../../ai/Scope";
import { Situation } from "../../ai/Situation";
import { ref, watch } from "vue";
import { Edit, Check } from "lucide-vue-next";
import { BriefcaseBusiness } from "lucide-vue-next";
const props = defineProps<{
  situation?: Situation;
  scope: Scope;
}>();

const userProfile = ref<Profile>(props.scope.userProfile);
const isEditMode = ref(false); // Track edit mode

watch(userProfile, () => {
  props.scope.updateUserProfile(userProfile.value);
});

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};
</script>

<template>
  <div
    class="w-full h-fit flex items-center justify-center bg-neutral-300 border-b"
  >
    <div class="bg-white w-[200px] h-[128px]"></div>
  </div>

  <!-- View Mode -->
  <template v-if="!isEditMode">
    <div class="w-full flex flex-col items-start p-4 gap-1">
      <div class="w-full flex gap-2 items-center justify-center">
        <h2 class="text-xl">{{ userProfile.name }}</h2>
        <div
          class="text-sm flex gap-2 items-center justify-center p-1 text-neutral-500"
        >
          <h3>{{ userProfile.stats.age ?? "--" }}</h3>
        </div>
        <div
          class="text-sm flex gap-2 items-center justify-center p-1 text-neutral-500"
        >
          <h3>
            {{
              userProfile.stats.gender
                ? userProfile.stats.gender == "m"
                  ? "♂"
                  : "♀"
                : "--"
            }}
          </h3>
        </div>
        <button
          class="p-2 rounded w-fit ml-auto"
          @click="toggleEditMode"
        >
          <Edit
            :size="16"
            class="text-neutral-700"
          />
        </button>
      </div>
      <div class="text-xs flex gap-4 text-neutral-500">
        <span class="flex items-center justify-center gap-1">
          <BriefcaseBusiness :size="16" />
          <h3>{{ userProfile.stats.job ?? "" }}</h3>
        </span>
      </div>
      <p class="text-sm pt-2">{{ userProfile.personality }}</p>
    </div>
  </template>

  <!-- Edit Mode -->
  <template v-else>
    <div
      class="w-full flex flex-col items-start py-4 gap-1 bg-neutral-100 border rounded-lg p-4"
    >
      <div class="w-full flex gap-2 items-center justify-center">
        <input
          v-model="userProfile.name"
          class="border rounded p-2 w-full"
          placeholder="Enter name"
        />
        <input
          v-model="userProfile.stats.age"
          class="w-12 border rounded p-2"
          placeholder="Age"
        />
        <select v-model="userProfile.stats.gender" class="border rounded p-2">
          <option value="m">Male</option>
          <option value="f">Female</option>
        </select>
        <button
          class="p-2 rounded w-fit"
          @click="toggleEditMode"
        >
          <Check
            :size="16"
            class="text-neutral-700 w-fit"
          />
        </button>
      </div>
      <div class="text-xs flex gap-4 w-full text-neutral-500">
        <span class="flex items-center justify-center gap-1 w-full">
          <BriefcaseBusiness :size="16" />
          <input
            v-model="userProfile.stats.job"
            class="border rounded p-2 w-full flex-grow"
            placeholder="Enter job"
          />
        </span>
      </div>
      <textarea
        v-model="userProfile.personality"
        class="text-sm border rounded p-2 w-full"
        placeholder="Enter personality"
      ></textarea>
    </div>
  </template>
</template>
