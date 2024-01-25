<template>
  <div class="w-full rounded-xl bg-white p-6 text-center shadow-xl relative">
    <outlined-button
      v-if="edit"
      @click="navigateTo(`/feature/edit/${nevent}`)"
      icon="edit"
      class="absolute bottom-2 right-2"
      >Edit</outlined-button
    >
    <div
      class="mx-auto flex h-16 w-16 -translate-y-12 transform items-center justify-center rounded-full bg-gray-300"
    >
      <img
        :src="
          event.author.profile?.image ||
          'https://robohash.org/' + event.author?.npub
        "
        alt="img"
        class="w-10 h-10 p-px ring ring-slate-300 rounded-full"
      />
    </div>
    <h1 class="text-darken mb-3 text-xl font-medium lg:px-14">
      <button @click="navigateTo(`/feature/${nevent}`)">{{ title }}</button>
    </h1>
    <p class="px-4 text-gray-500">
      {{ event.content }}
    </p>
    <div class="w-full flex justify-center flex-wrap gap-2">
      <a
        v-for="hashtag in hashtags"
        class="w-fit mt-2 px-2 py-1 flex text-sm bg-blue-300/50 text-blue-500 font-bold rounded"
        >#{{ hashtag }}</a
      >
    </div>
    <div v-if="showPledgeUsers">
      <pubkey-facepile :pubkeys="pledgeAuthors" summarized />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from "vue";
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { useNdk } from "~/composables/nostr/ndk";
import { useFeatureEvent } from "~/composables/nostr/useFeatureEvent";
import { PledgeKind } from "~/composables/nostr/kinds";
import outlinedButton from "~/components/buttons/outlined-button.vue";
import {
  getEventCoordinate,
  sortEventsByDate,
} from "~/composables/helpers/event";
import { getUsersFromPledges } from "~/composables/helpers/pledge";
import { useGetUnspentPledgesForFeature } from "~/composables/nostr/useGetUnspentPledgesForFeature";
import pubkeyFacepile from "~/components/pubkey-facepile.vue";

const props = defineProps({
  event: { type: Object as PropType<NDKEvent>, default: null },
  edit: { type: Boolean, default: false },
  showPledgeUsers: { type: Boolean, default: true },
});

const { ndk } = useNdk();
const { title, hashtags, description } = useFeatureEvent(props.event);

const pledgeEvents = ref<NDKEvent[]>([]);
const pledgeAuthors = ref<NDKUser[]>([]);

const nevent = nip19.neventEncode({
  id: props.event.id,
  author: props.event.author.pubkey,
  kind: props.event.kind,
  relays: [props.event.relay?.url!],
});
const pledges = ref<NDKEvent[]>([]);

onMounted(async () => {
  const events = sortEventsByDate(
    await useGetUnspentPledgesForFeature(props.event),
  );

  pledges.value = events;
  pledgeAuthors.value = getUsersFromPledges(events);
});
</script>
