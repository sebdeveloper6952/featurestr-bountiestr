<template>
  <img
    class="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
    :src="user.profile?.image || 'https://robohash.org/' + user.pubkey"
  />
</template>

<script setup lang="ts">
import { type NDKUser } from "@nostr-dev-kit/ndk";

const props = defineProps({
  user: {
    type: Object as PropType<NDKUser>,
    default: null,
  },
});

onMounted(async () => {
  if (!props.user.profile) await props.user.fetchProfile();
});
</script>
