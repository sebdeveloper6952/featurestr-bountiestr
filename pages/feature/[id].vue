<template>
  <div class="w-full flex justify-center">
    <h1>{{ "" }}</h1>
    <div>{{ event?.content }}</div>
  </div>
</template>

<script setup lang="ts">
import FeatureRequestCard from "~/components/cards/feature-request-card.vue";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";
import { FeatureRequestKind } from "~/composables/nostr/kinds";
import {
  isHexKey,
  safeDecode,
  getEventIdFromDecodeResult,
} from "~/composables/helpers/nip19";

const r = useRoute();
const { ndk, activeUser } = useNdk();

const id = r.params["id"] as string;
const hexId = isHexKey(id) ? id : getEventIdFromDecodeResult(safeDecode(id));
if (!hexId) throw new Error("Missing event id");

const event = ref<NDKEvent>();

ndk.fetchEvent(hexId).then((e) => {
  if (e) event.value = e;
});
</script>
