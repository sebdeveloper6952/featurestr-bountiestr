<template>
  <span class="font-bold">{{
    profile?.displayName || profile?.name || "anon"
  }}</span>
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
