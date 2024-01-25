<template>
  <div class="p-4">
    <p class="text-xl font-bold">Edit Feature Request</p>

    <div class="w-full md:w-1/2">
      <text-input v-model="newTitle" label="Enter a title:" />
      <div class="mt-4">
        <text-area v-model="newDescription" label="Enter your description:" />
      </div>
      <p class="mt-4">Additional tags</p>
      <div class="flex items-center gap-1">
        <text-input v-model="tag" autocomplete="off" />
        <outlined-button @click="addTag">Add</outlined-button>
      </div>

      <div class="flex gap-1">
        <div
          v-for="(t, i) in additionalTags"
          class="w-fit mt-2 px-2 py-1 flex text-sm bg-blue-300/50 text-blue-500 font-bold rounded"
        >
          <p>{{ t }}</p>
          <div @click="removeTag(i)" class="ml-2 cursor-pointer">x</div>
        </div>
      </div>
      <outlined-button @click="onSubmit" class="mt-4">Update</outlined-button>
    </div>
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
import { useFeatureEvent } from "~/composables/nostr/useFeatureEvent";
import { onMounted } from "vue";
import { useEditPledge } from "~/composables/nostr/useEditPledge";
import textInput from "~/components/forms/text-input.vue";
import textArea from "~/components/forms/text-area.vue";
import outlinedButton from "~/components/buttons/outlined-button.vue";

const r = useRoute();
const { ndk, activeUser } = useNdk();

const newTitle = ref("");
const newDescription = ref("");
const tag = ref("");
const additionalTags = ref<string[]>([]);
const dTagRef = ref("");

const id = r.params["id"] as string;
const hexId = isHexKey(id) ? id : getEventIdFromDecodeResult(safeDecode(id));
if (!hexId) throw new Error("Missing event id");

const event = ref<NDKEvent>();

onMounted(() => {
  ndk.fetchEvent(hexId).then((e) => {
    if (e) {
      event.value = e;
      const { title, hashtags, description, dTag } = useFeatureEvent(
        event.value
      );
      newTitle.value = title ?? "";
      newDescription.value = description ?? "";
      additionalTags.value = hashtags;
      dTagRef.value = dTag ?? "";
    }
  });
});

const addTag = () => {
  if (tag.value === "") return;
  additionalTags.value.push(tag.value);
  tag.value = "";
};

const removeTag = (i: number) => {
  additionalTags.value.splice(i, 1);
};

const onSubmit = async () => {
  await useEditPledge(
    newTitle.value,
    newDescription.value,
    additionalTags.value,
    dTagRef.value
  );
  navigateTo("/profile");
};
</script>
