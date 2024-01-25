<template>
  <div class="w-full h-full">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useNdk } from "~/composables/nostr/ndk";

onMounted(async () => {
  const { init } = await useNdk();
  await init();
});
</script>
