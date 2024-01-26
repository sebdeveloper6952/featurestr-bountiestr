<template>
  <div class="w-full flex justify-center">
    <div class="w-full md:max-w-screen-md flex p-4 flex-col justify-center">
      <div class="mt-4 w-full flex flex-col items-center gap-2">
        <feature-request-card
          v-if="event"
          :event="event"
          :show-pledge-users="false"
        />
      </div>

      <h2 v-if="totalPledged" class="text-lg font-bold mb-2 mt-4 text-center">
        {{ totalPledged }} sats pledged
      </h2>

      <!-- pledges -->
      <div class="mt-4">
        <div class="p-4 w-full justify-between bg-white rounded shadow-xl">
          <div class="flex gap-2">
            <h4 class="font-bold">Pledges</h4>
            <div class="grow"></div>
            <outlined-button
              @click="showPledgeModal = true"
              icon="cash_plus"
              class=""
              >Pledge</outlined-button
            >
          </div>

          <div class="mt-4">
            <pledge-card
              v-for="pledge in sortedPledges"
              :key="pledge.id"
              :event="pledge"
              :spent="!unspentPledges.includes(pledge.id)"
            />
          </div>
        </div>
      </div>

      <!-- solutions -->
      <div
        class="p-4 mt-4 flex gap-2 w-full justify-start rounded-xl bg-white shadow-xl"
      >
        <div class="w-full">
          <div class="flex justify-between items-center">
            <h4 class="font-bold">Solutions</h4>
            <div class="grow"></div>
            <outlined-button
              @click="navigateTo('/feature/solution/' + id)"
              icon="code"
              >Post Solution</outlined-button
            >
          </div>
          <div class="mt-4 flex flex-col">
            <solution-card
              v-for="solution in sortedSolutions"
              :key="solution.id"
              :event="solution"
            />
          </div>
        </div>
      </div>

      <!-- comments -->
      <comment-thread v-if="event" :root-event="event" />

      <pledge-on-feature-modal
        :show="showPledgeModal"
        @close="showPledgeModal = false"
      />
    </div>
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
import commentThread from "../../components/comments/comment-thread.vue";
import { useFilterUnspentPledges } from "~/composables/nostr/useFilterUnspentPledges";
import { useGetSolutionsForFeature } from "~/composables/nostr/useGetSolutionsForFeature";
import {
  getEventCoordinate,
  sortEventsByDate,
} from "~/composables/helpers/event";
import pledgeCard from "~/components/cards/pledge-card.vue";
import solutionCard from "~/components/cards/solution-card.vue";
import { PledgeKind } from "~/composables/nostr/kinds";
import { getUsersFromPledges } from "../../composables/helpers/pledge";
import { getTokensTotal } from "../../composables/helpers/cashu";

const r = useRoute();
const { ndk } = useNdk();

const id = r.params["id"] as string;
const hexId = isHexKey(id) ? id : getEventIdFromDecodeResult(safeDecode(id));
if (!hexId) throw new Error("Missing event id");
const event = ref<NDKEvent>();
const pledges = ref(new Map<string, NDKEvent>());
const unspentPledges = ref<string[]>([]);
const sortedPledges = computed(() =>
  sortEventsByDate(pledges.value.values() as Iterable<NDKEvent>),
);
const users = computed(() =>
  getUsersFromPledges(pledges.value.values() as Iterable<NDKEvent>),
);
const totalPledged = computed(() =>
  getTokensTotal(users.value.map((u) => u.tokens).flat()),
);
const solutions = ref<NDKEvent[]>([]);
const sortedSolutions = computed(() =>
  sortEventsByDate(solutions.value.values() as Iterable<NDKEvent>),
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
      unspentPledges.value = (
        await useFilterUnspentPledges(
          pledges.value.values() as Iterable<NDKEvent>,
        )
      ).map((p) => p.id);
    });
    pledgesSub.start();

    solutions.value = Array.from(await useGetSolutionsForFeature(event.value));
  }
});
onUnmounted(() => {
  if (pledgesSub) pledgesSub.stop();
});
</script>
