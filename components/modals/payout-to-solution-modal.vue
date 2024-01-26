<template>
  <base-modal :show="show" @close="$emit('close')" :cancellable="false">
    <div class="md:w-[6in] px-6 py-4 overflow-auto">
      <div v-if="sent">
        <h2>Paid <user-name :user="solution.author" /></h2>
        <div class="flex gap-2">
          <outline-button @click="emit('close')" class="ml-auto"
            >Done</outline-button
          >
        </div>
      </div>
      <div v-else>
        <h2 class="text-lg font-bold text-center my-4">Payout pledges?</h2>
        <div class="flex gap-2">
          <p>
            Pay {{ unlockablePledgesAmount }} sats ({{
              unlockablePledges.length
            }}) to
          </p>
          <div class="w-8 h-8">
            <user-image :user="solution.author" />
          </div>
          <user-name :user="solution.author" />
        </div>
        <div class="my-2">
          <p>Optional message:</p>
          <text-area v-model="content" />
        </div>
        <div class="flex gap-2 justify-between">
          <outline-button @click="emit('close')">Cancel</outline-button>
          <outline-button @click="confirm">Payout</outline-button>
        </div>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { NDKPrivateKeySigner, NDKEvent } from "@nostr-dev-kit/ndk";
import baseModal from "~/components/modals/base-modal.vue";
import outlineButton from "~/components/buttons/outlined-button.vue";
import userName from "../user-name.vue";
import userImage from "../user-image.vue";
import { P2PKCashuWallet, getMint } from "../../composables/cashu/wallet";
import { type Token, type TokenEntry } from "@cashu/cashu-ts";
import { getTokenFromEvent } from "../../composables/helpers/pledge";
import { useNdk } from "../../composables/nostr/ndk";
import { usePostPayoutToSolutionEvent } from "~/composables/nostr/usePostPayoutToSolutionEvent";
import textArea from "../forms/text-area.vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  featureRequest: {
    type: Object as PropType<NDKEvent>,
    default: null,
  },
  solution: {
    type: Object as PropType<NDKEvent>,
    default: null,
  },
  pledges: {
    type: Array as PropType<NDKEvent[]>,
    default: [],
  },
});

const emit = defineEmits(["close"]);

const { ndk } = useNdk();
const total = ref(0);
const sent = ref(false);
const loading = ref(false);
const content = ref("");
const unlockablePledges = computed(() =>
  props.pledges.filter(
    (p) =>
      p.author.pubkey === ndk.activeUser?.pubkey ||
      p.tags.some(
        (t) =>
          t[0] === "p" && t[1] === ndk.activeUser?.pubkey && t[3] === "trustee",
      ),
  ),
);

const unlockablePledgesAmount = computed(() => {
  let total = 0;

  unlockablePledges.value.forEach((e) => {
    let amountTag = e.tags.find((t) => t[0] === "amount");
    if (amountTag !== undefined) {
      total += Number(amountTag[1]);
    }
  });

  return total;
});

const confirm = async () => {
  if (!(ndk.signer instanceof NDKPrivateKeySigner) || !ndk.signer.privateKey)
    return;

  loading.value = true;
  const tokens = unlockablePledges.value
    .map((p) => getTokenFromEvent(p))
    .flat()
    .filter(Boolean) as Token[];
  if (tokens.length > 0) {
    const tokenEntriesByMint: Record<string, TokenEntry[]> = {};
    for (const token of tokens) {
      for (const entry of token.token) {
        const mint = new URL(entry.mint).toString();
        tokenEntriesByMint[mint] = tokenEntriesByMint[mint] || [];
        tokenEntriesByMint[mint].push(entry);
      }
    }

    // unlock all tokens for each mint
    const lockedTokenEntries: TokenEntry[] = [];
    for (const [mintURL, entries] of Object.entries(tokenEntriesByMint)) {
      const token: Token = { token: entries };
      const mint = await getMint(mintURL);
      const wallet = new P2PKCashuWallet(mint);
      wallet.p2pkReceiveSecretKey = ndk.signer.privateKey;
      wallet.p2pkSendLockPubkey = "02" + props.solution.author.pubkey;
      const { token: lockedToken } = await wallet.receive(token);
      wallet.p2pkSendLockPubkey = null;
      lockedTokenEntries.push(...lockedToken.token);
    }

    const lockedToken: Token = { token: lockedTokenEntries };

    await usePostPayoutToSolutionEvent(
      props.solution,
      content.value,
      lockedToken,
    );
    emit("close");
  }
  loading.value = false;
};
</script>
