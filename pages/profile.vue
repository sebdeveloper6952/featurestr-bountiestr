<template>
  <div class="w-full p-4 flex flex-col justify-center">
    <p class="text-xl font-bold">Profile</p>
    <div class="w-full flex flex-col items-center gap-2">
      <feature-request-card
        v-for="event in events"
        :key="event.id"
        :event="event"
        edit
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { FeatureRequestKind } from "~/composables/nostr/kinds";
import { useNdk } from "~/composables/nostr/ndk";
import featureRequestCard from "~/components/cards/feature-request-card.vue";

const { ndk, setSk, logout, activeUser } = useNdk();

const events = ref<NDKEvent[]>([]);

onMounted(() => {
  ndk
    .fetchEvents([
      { kinds: [FeatureRequestKind], authors: [ndk.activeUser?.pubkey!] },
    ])
    .then(
      (set) =>
        (events.value = Array.from(set).sort(
          (a, b) => b.created_at! - a.created_at!,
        )),
    );
});
</script>
