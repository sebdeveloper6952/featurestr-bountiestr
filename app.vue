<template>
  <div class="w-full h-full">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

import { useNdk } from "~/composables/nostr/ndk";

onMounted(async () => {
  const { init } = await useNdk();
  await init();
});
</script>
