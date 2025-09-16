<script lang="ts" setup>
import { usePageContext } from "vike-vue/usePageContext";
import { computed, useAttrs } from "vue";

const pageContext = usePageContext();
const { href } = useAttrs();
const isActive = computed(() => {
  const { urlPathname } = pageContext;
  return href === "/" ? urlPathname === href : urlPathname.startsWith(href);
});
</script>

<template>
  <a class="h-16 w-32 flex justify-center items-center" :class="{ 'bg-neutral-200': isActive, 'bg-neutral-50': !isActive }">
    <slot />
  </a>
</template>