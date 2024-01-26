<template>
  <div class="w-full p-2 flex justify-center">
    <div class="w-full md:max-w-screen-md flex flex-col items-center gap-2">
      <feature-request-card v-for="event in events" :event="event" />
    </div>
  </div>
</template>

<script setup lang="ts">
import FeatureRequestCard from "~/components/cards/feature-request-card.vue";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";
import { FeatureRequestKind } from "~/composables/nostr/kinds";

const { ndk, setSk, logout, activeUser } = useNdk();

const events = ref<NDKEvent[]>([]);

ndk
  .fetchEvents([{ kinds: [FeatureRequestKind] }])
  .then(
    (set) =>
      (events.value = Array.from(set).sort(
        (a, b) => b.created_at! - a.created_at!,
      )),
  );
</script>
