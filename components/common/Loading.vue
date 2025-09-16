<script setup lang="ts">
import { LoaderCircle } from "lucide-vue-next";
</script>

<template>
  <div class="w-full h-full flex-grow flex flex-col items-center justify-center">
    <LoaderCircle class="animate-spin m-8" :size="64" />
    <h1 class="">Loading...</h1>
  </div>
</template>
