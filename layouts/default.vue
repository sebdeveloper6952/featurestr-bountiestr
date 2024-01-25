<template>
  <div class="w-full h-full flex flex-col overflow-x-hidden">
    <top-bar></top-bar>
    <div class="w-full h-full">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import topBar from "~~/components/navigation/top-bar.vue";

import "../composables/cashu/wallet";
</script>
