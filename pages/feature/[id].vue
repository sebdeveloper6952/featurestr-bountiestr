<template>
  <div class="w-full flex p-4 flex-col justify-center">
    <div class="mt-4 w-full flex flex-col items-center gap-2">
      <feature-request-card
        v-if="event"
        :event="event"
        :show-pledge-users="false"
      />
    </div>
    <div class="mt-4">
      <div class="flex gap-2 w-full justify-between">
        <h4 class="font-bold">Pledges</h4>
        <outlined-button
          @click="showPledgeModal = true"
          icon="cash_plus"
          class=""
          >Pledge</outlined-button
        >
      </div>
      <pledge-card v-for="pledge in sortedPledges" :event="pledge" />
    </div>
    <div class="flex gap-2 w-full justify-start">
      <outlined-button
        @click="navigateTo('/feature/solution/' + id)"
        icon="cash_plus"
        class=""
        >Post Solution</outlined-button
      >
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
import { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";
import {
  isHexKey,
  safeDecode,
  getEventIdFromDecodeResult,
} from "~/composables/helpers/nip19";
import outlinedButton from "~/components/buttons/outlined-button.vue";
import pledgeOnFeatureModal from "~/components/modals/pledge-on-feature-modal.vue";
import { useFilterUnspentPledges } from "~/composables/nostr/useFilterUnspentPledges";
import {
  getEventCoordinate,
  sortEventsByDate,
} from "~/composables/helpers/event";
import pledgeCard from "~/components/cards/pledge-card.vue";
import { PledgeKind } from "../../composables/nostr/kinds";

const r = useRoute();
const { ndk } = useNdk();

const id = r.params["id"] as string;
const hexId = isHexKey(id) ? id : getEventIdFromDecodeResult(safeDecode(id));
if (!hexId) throw new Error("Missing event id");
const event = ref<NDKEvent>();
const pledges = ref(new Map<string, NDKEvent>());
const sortedPledges = computed(() =>
  sortEventsByDate(pledges.value.values() as Iterable<NDKEvent>),
);

const showPledgeModal = ref(false);

let pledgesSub: NDKSubscription;
onMounted(async () => {
  event.value = (await ndk.fetchEvent(hexId)) ?? undefined;
  if (event.value) {
    pledgesSub = ndk.subscribe(
      [{ kinds: [PledgeKind], "#a": [getEventCoordinate(event.value)] }],
      { closeOnEose: false },
    );
    pledgesSub.on("event", (event): void => {
      pledges.value.set(event.id, event);
    });
    pledgesSub.on("eose", async () => {
      const valid = await useFilterUnspentPledges(
        pledges.value.values() as Iterable<NDKEvent>,
      );

      pledges.value.clear();
      for (const pledge of valid) pledges.value.set(pledge.id, pledge);
    });
    pledgesSub.start();
  }
});
onUnmounted(() => {
  if (pledgesSub) pledgesSub.stop();
});
</script>
