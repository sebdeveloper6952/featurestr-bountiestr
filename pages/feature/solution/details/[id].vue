<template>
  <div class="p-4">
    <p class="text-xl font-bold">Solution Details</p>

    <div class="w-full md:max-w-screen-md flex flex-col items-center gap-2">
      <feature-request-card
        v-if="featureRequestEvent"
        :event="featureRequestEvent"
      />
    </div>

    <div v-if="event">
      <div class="flex items-center">
        <p class="text-gray-500">Solution submitted by:</p>
        <div
          class="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-300"
        >
          <user-image :user="event?.author" />
        </div>
        <div class="ml-2 flex items-center gap-2">
          <user-name :user="event?.author" />
          <p class="text-gray-500 text-sm">
            @ {{ dayjs.unix(event?.created_at!).format("lll") }}
          </p>
        </div>
      </div>
      <div>
        <p class="text-gray-500 text-xl">Details</p>
        <p>{{ event?.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNdk } from "~/composables/nostr/ndk";
import dayjs from "dayjs";
import { usePostSolutionToFeature } from "~/composables/nostr/usePostSolutionToFeature";
import textInput from "~/components/forms/text-input.vue";
import textArea from "~/components/forms/text-area.vue";
import outlinedButton from "~/components/buttons/outlined-button.vue";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import {
  isHexKey,
  safeDecode,
  getEventIdFromDecodeResult,
} from "~/composables/helpers/nip19";
import featureRequestCard from "~/components/cards/feature-request-card.vue";

const { ndk, setSk, logout, activeUser } = useNdk();
const r = useRoute();

const id = r.params["id"] as string;
const event = ref<NDKEvent>();
const featureRequestEvent = ref<NDKEvent>();
const description = ref("");
const hexId = isHexKey(id) ? id : getEventIdFromDecodeResult(safeDecode(id));
if (!hexId) throw new Error("Missing event id");

onMounted(async () => {
  event.value = await ndk.fetchEvent(hexId);
  const featureRequestEventId = event.value?.tags.find(
    (t) => t[0] === "e",
  )?.[1];
  if (!featureRequestEvent)
    throw new Error("solution event is missing feature request event id");
  featureRequestEvent.value = await ndk.fetchEvent(featureRequestEventId);
});

const onSubmit = async () => {
  if (event === undefined) throw new Error("undefined feature event");
  await usePostSolutionToFeature(event.value, description.value);
  navigateTo("/feature/" + id);
};
</script>
