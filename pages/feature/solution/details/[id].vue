<template>
  <div class="p-4 flex flex-col items-center">
    <div class="w-full flex justify-start">
      <p class="text-xl font-bold">Solution Details</p>
    </div>

    <div
      class="mt-8 w-full md:max-w-screen-md flex flex-col items-center gap-2"
    >
      <feature-request-card
        v-if="featureRequestEvent"
        :event="featureRequestEvent"
      />
    </div>

    <div
      v-if="event"
      class="mt-4 w-full md:max-w-screen-md rounded-xl bg-white p-4 text-center shadow-xl relative"
    >
      <div class="flex items-center">
        <p class="text-gray-500">Solution submitted by:</p>
        <div class="w-8 h-8">
          <user-image :user="event?.author" class="ml-2" />
        </div>
        <div class="ml-4 flex items-center gap-2">
          <user-name :user="event?.author" />
          <p class="text-gray-500 text-sm">
            @ {{ dayjs.unix(event?.created_at!).format("lll") }}
          </p>
        </div>
      </div>
      <div>
        <p class="text-left font-bold text-xl">Details</p>
        <p class="text-justify">{{ event?.content }}</p>
      </div>
      <div class="w-full flex justify-end">
        <outlined-button v-if="hasPledged" @click="() => {}" icon="accept"
          >Accept Solution</outlined-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNdk } from "~/composables/nostr/ndk";
import dayjs from "dayjs";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import {
  isHexKey,
  safeDecode,
  getEventIdFromDecodeResult,
} from "~/composables/helpers/nip19";
import featureRequestCard from "~/components/cards/feature-request-card.vue";
import outlinedButton from "~/components/buttons/outlined-button.vue";
import {
  FeatureRequestKind,
  PledgeKind,
} from "../../../../composables/nostr/kinds";

const { ndk } = useNdk();
const r = useRoute();

const id = r.params["id"] as string;
const event = ref<NDKEvent>();
const featureRequestEvent = ref<NDKEvent>();
const hexId = isHexKey(id) ? id : getEventIdFromDecodeResult(safeDecode(id));
if (!hexId) throw new Error("Missing event id");

const pledges = ref<NDKEvent[]>([]);

onMounted(async () => {
  event.value = (await ndk.fetchEvent(hexId)) ?? undefined;
  const featureRequestEventCord = event.value?.tags.find(
    (t) => t[0] === "a" && t[1],
  )?.[1];
  if (!featureRequestEventCord)
    throw new Error("solution event is missing feature request event id");
  featureRequestEvent.value =
    (await ndk.fetchEvent({
      kinds: [FeatureRequestKind],
      "#a": [featureRequestEventCord],
    })) ?? undefined;

  pledges.value = Array.from(
    await ndk.fetchEvents({
      kinds: [PledgeKind],
      "#a": [featureRequestEventCord],
    }),
  );
});

const hasPledged = computed(() =>
  pledges.value.some((p) => p.author.pubkey === ndk.activeUser?.pubkey),
);
</script>
