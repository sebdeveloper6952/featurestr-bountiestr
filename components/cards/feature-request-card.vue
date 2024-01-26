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
      class="mx-auto flex h-10 w-10 -translate-y-10 transform items-center justify-center rounded-full bg-gray-300"
    >
      <user-image :user="event.author" />
    </div>
    <div class="-translate-y-10">
      <user-name :user="event.author" />
    </div>

    <h1 class="text-darken mb-3 text-xl font-medium lg:px-14">
      <button @click="navigateTo(`/feature/${nevent}`)">{{ title }}</button>
    </h1>
    <p class="px-4 text-gray-500">
      {{ description }}
    </p>
    <div class="w-full flex justify-center flex-wrap gap-2">
      <a
        v-for="hashtag in hashtags"
        class="w-fit mt-2 px-2 py-1 flex text-sm bg-blue-300/50 text-blue-500 font-bold rounded"
        >#{{ hashtag }}</a
      >
    </div>
    <div v-if="showPledgeUsers" class="flex gap-2 items-center">
      <pubkey-facepile :pubkeys="pledges.map((p) => p.user)" summarized />
      <span v-if="total">{{ total }} sats</span>
    </div>
  </div>

  <debug-modal :event="event" :show="debug" @close="debug = false" />
</template>

<script setup lang="ts">
import { type PropType } from "vue";
import type { Token } from "@cashu/cashu-ts";
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { useNdk } from "~/composables/nostr/ndk";
import { useFeatureEvent } from "~/composables/nostr/useFeatureEvent";
import outlinedButton from "~/components/buttons/outlined-button.vue";
import { sortEventsByDate } from "~/composables/helpers/event";
import { getUsersFromPledges } from "~/composables/helpers/pledge";
import { useGetUnspentPledgesForFeature } from "~/composables/nostr/useGetUnspentPledgesForFeature";
import pubkeyFacepile from "~/components/pubkey-facepile.vue";
import userImage from "~/components/user-image.vue";
import userName from "~/components/user-name.vue";
import debugModal from "~/components/modals/debug-modal.vue";
import { getTokensTotal } from "~/composables/helpers/cashu";

const props = defineProps({
  event: { type: Object as PropType<NDKEvent>, default: null },
  edit: { type: Boolean, default: false },
  showPledgeUsers: { type: Boolean, default: true },
});

const debug = ref(false);
const { ndk } = useNdk();
const { title, hashtags, description } = useFeatureEvent(props.event);

const total = ref(0);

const nevent = nip19.neventEncode({
  id: props.event.id,
  author: props.event.author.pubkey,
  kind: props.event.kind,
  relays: [props.event.relay?.url!],
});
const pledges = ref<{ user: NDKUser; tokens: Token[] }[]>([]);

onMounted(async () => {
  const pledgeEvents = sortEventsByDate(
    await useGetUnspentPledgesForFeature(props.event),
  );

  pledges.value = getUsersFromPledges(pledgeEvents);
  const tokens = pledges.value.map((p) => p.tokens).flat();
  total.value = getTokensTotal(tokens);
});
</script>
