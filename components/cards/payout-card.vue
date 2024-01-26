<template>
  <div class="w-full rounded-xl bg-white px-2 py-2">
    <div class="flex gap-2 w-full">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300"
      >
        <user-image :user="event.author" />
      </div>
      <div>
        <p>
          <user-name :user="event.author" />
          <span class="text-gray-500 text-sm ml-2">{{
            dayjs.unix(event.created_at!).format("lll")
          }}</span>
        </p>
        <p class="text-gray-500">
          {{ total }} sats
          <span v-if="redeemed" class="font-bold">Redeemed</span>
        </p>
      </div>
      <div class="ml-auto flex gap-2">
        <outlined-button
          @click="redeem = true"
          v-if="payee === ndk.activeUser?.pubkey && redeemed === false"
          >Redeem</outlined-button
        >
        <icon-button @click="debug = true" icon="code" />
      </div>
    </div>
    <p>
      {{ event.content }}
    </p>

    <redeem-payout-modal
      :show="redeem"
      :event="event"
      @close="redeem = false"
      @redeemed="
        () => {
          redeemed = true;
          redeem = false;
        }
      "
    />
    <debug-modal :event="event" :show="debug" @close="debug = false" />
  </div>
</template>

<script setup lang="ts">
import { type PropType } from "vue";
import { type Token } from "@cashu/cashu-ts";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import dayjs from "dayjs";
import { useNdk } from "~/composables/nostr/ndk";
import debugModal from "~/components/modals/debug-modal.vue";
import iconButton from "~/components/buttons/icon-button.vue";
import outlinedButton from "../buttons/outlined-button.vue";
import userImage from "~/components/user-image.vue";
import userName from "~/components/user-name.vue";
import redeemPayoutModal from "../modals/redeem-payout-modal.vue";
import { getTokensTotal } from "~/composables/helpers/cashu";
import { getTokenFromEvent } from "../../composables/helpers/pledge";
import { getMint } from "../../composables/cashu/wallet";

const props = defineProps({
  event: { type: Object as PropType<NDKEvent>, default: null },
});

const debug = ref(false);
const withdrawalModal = ref(false);
const { ndk } = useNdk();
const token = ref<Token>();
const total = ref(0);
const redeem = ref(false);
const redeemed = ref(false);
const payee = computed(
  () =>
    props.event.tags.find((t) => t[0] === "p" && t[1] && t[3] === "payee")?.[1],
);

onMounted(async () => {
  const t = getTokenFromEvent(props.event);
  if (t) {
    token.value = t;
    total.value = getTokensTotal([t]);

    redeemed.value = true;
    for (const entry of t.token) {
      const mint = await getMint(entry.mint);
      const spent = await mint.check({
        proofs: entry.proofs.map((p) => ({ secret: p.secret })),
      });
      const anySpendable = spent.spendable.some((v) => v === true);

      if (anySpendable) {
        redeemed.value = false;
        break;
      }
    }
  }
});
</script>
