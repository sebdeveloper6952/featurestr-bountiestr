<template>
  <span class="font-bold">{{
    user.profile?.displayName || user.profile?.name || "anon"
  }}</span>
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
