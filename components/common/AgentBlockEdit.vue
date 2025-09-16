<script setup lang="ts">
import { Agent } from "../../ai/Agent";
import { BriefcaseBusiness, Contact } from "lucide-vue-next";
const props = defineProps<{
  agent: Agent;
}>();
</script>

<template>
  <div class="w-full flex flex-col items-start py-4 gap-1">
    <div class="flex gap-2 items-center justify-center">
      <h2 class="text-lg">{{ agent.getName() }}</h2>
      <div
        class="text-sm flex gap-1 items-center justify-center border rounded p-1 text-neutral-500"
      >
        <h3>{{ agent.getStats().age ?? "" }}</h3>
        <h3>
          {{
            agent.getStats().gender
              ? agent.getStats().gender == "m"
                ? "♂"
                : " ♀"
              : ""
          }}
        </h3>
      </div>
    </div>
    <div class="text-xs flex gap-4 text-neutral-500">
      <span class="flex items-center justify-center gap-1">
        <Contact :size="16" />
        <h3>{{ agent.getRelationToUser() ?? "" }}</h3>
      </span>
      <span class="flex items-center justify-center gap-1">
        <BriefcaseBusiness :size="16" />
        <h3>{{ agent.getStats().job ?? "" }}</h3>
      </span>
    </div>
    <p class="text-sm pt-2">{{ agent.getProfile().personality }}</p>
  </div>
</template>
