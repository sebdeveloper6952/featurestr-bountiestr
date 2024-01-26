<template>
  <div class="p-4">
    <p class="text-xl font-bold">Post Solution to Feature</p>

    <div class="w-full md:w-1/2">
      <text-area
        v-model="description"
        label="Enter your description:"
        class="mt-4"
      />
      <outlined-button
        @click="onSubmit"
        :disabled="description === ''"
        class="mt-4"
        >Submit Solution</outlined-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNdk } from "~/composables/nostr/ndk";
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

const { ndk, setSk, logout, activeUser } = useNdk();
const r = useRoute();

const id = r.params["id"] as string;
const event = ref<NDKEvent>();
const description = ref("");
const hexId = isHexKey(id) ? id : getEventIdFromDecodeResult(safeDecode(id));
if (!hexId) throw new Error("Missing event id");

onMounted(async () => {
  event.value = await ndk.fetchEvent(hexId);
  console.warn(event.value);
});

const onSubmit = async () => {
  if (event === undefined) throw new Error("undefined feature event");
  await usePostSolutionToFeature(event.value, description.value);
  navigateTo("/feature/" + id);
};
</script>
