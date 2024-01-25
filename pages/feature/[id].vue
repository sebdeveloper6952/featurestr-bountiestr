<template>
  <div class="w-full flex p-4 flex-col justify-center">
    <div class="flex gap-2 w-full justify-end">
      <outlined-button @click="showPledgeModal = true" icon="cash_plus" class=""
        >Pledge</outlined-button
      >
    </div>
    <div class="mt-4 w-full flex flex-col items-center gap-2">
      <feature-request-card
        v-if="event"
        :event="event"
        :show-pledge-users="false"
      />
    </div>
    <div class="mt-4">
      <h4 class="font-bold">Pledges</h4>
      <pledge-card v-for="pledge in pledges" :event="pledge" />
    </div>
    <div class="mt-4">
      <h4 class="font-bold">Comments</h4>
    </div>

    <pledge-on-feature-modal
      :show="showPledgeModal"
      @close="showPledgeModal = false"
    />
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
import outlinedButton from "~/components/buttons/outlined-button.vue";
import { wallet } from "~/composables/cashu/wallet";
import { Token, getEncodedToken } from "@cashu/cashu-ts";
import { useCreatePledgeOnFeature } from "~/composables/nostr/useCreatePledgeOnFeature";
import pledgeOnFeatureModal from "~/components/modals/pledge-on-feature-modal.vue";
import { useGetUnspentPledgesForFeature } from "~/composables/nostr/useGetUnspentPledgesForFeature";
import { sortEventsByDate } from "~/composables/helpers/event";
import pledgeCard from "~/components/cards/pledge-card.vue";

const r = useRoute();
const { ndk } = useNdk();

const id = r.params["id"] as string;
const hexId = isHexKey(id) ? id : getEventIdFromDecodeResult(safeDecode(id));
if (!hexId) throw new Error("Missing event id");
const event = ref<NDKEvent>();
const pledges = ref<NDKEvent[]>([]);

const showPledgeModal = ref(false);

onMounted(async () => {
  event.value = (await ndk.fetchEvent(hexId)) ?? undefined;
  if (event.value) {
    pledges.value = sortEventsByDate(
      await useGetUnspentPledgesForFeature(event.value),
    );
  }
});
</script>
