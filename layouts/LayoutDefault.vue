<script lang="ts" setup>
import Content from "../components/Content.vue";
import Link from "../components/subcomponents/Link.vue";
import Logo from "../components/subcomponents/Logo.vue";
import Navbar from "../components/Navbar.vue";
</script>

<template>
  <div class="overflow-y-hidden max-h-screen flex font-sans">
    <Content><slot /></Content>
  </div>
</template>

<style>
@import "./tailwind.css";
</style>

<style scoped>
/* Page Transition Animation */
#page-content {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}
body.page-is-transitioning #page-content {
  opacity: 0;
}
</style>
