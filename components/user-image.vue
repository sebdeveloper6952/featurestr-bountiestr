<template>
  <img
    class="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
    :src="profile?.image || 'https://robohash.org/' + user.pubkey"
  />
</template>

<script setup lang="ts">
import { type NDKUser, type NDKUserProfile } from "@nostr-dev-kit/ndk";

const props = defineProps({
  user: {
    type: Object as PropType<NDKUser>,
    default: null,
  },
});

const profile = ref<NDKUserProfile>();

onMounted(async () => {
  profile.value = (await props.user.fetchProfile()) ?? undefined;
});
</script>
