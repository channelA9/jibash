<script setup lang="ts">
import { Scope } from '../ai/Scope';
import Alert from './subcomponents/Alert.vue';

const props = defineProps<{
  scope: Scope;
}>();
</script>

<template>
  <div
    class="fixed flex flex-col gap-4 top-5 left-1/2 transform -translate-x-1/2 max-w-screen-sm"
  >
    <Alert v-for="alert, i in scope.errorLog" :key="`alert-${i}`" :message="alert" :duration="5"></Alert>
  </div>
</template>
