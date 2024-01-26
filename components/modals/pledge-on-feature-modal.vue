<template>
  <base-modal :show="show" @close="$emit('close')">
    <div class="md:w-[512px] px-16 py-4">
      <div v-if="pledgeStep === 0">
        <p class="font-bold">Set Pledge Amount (SATs)</p>
        <div class="mt-2 flex gap-1">
          <button
            class="w-fit px-2 py-1 text-center border border-black rounded text-sm hover:bg-gray-200"
            v-for="a in amounts"
            @click="pledgeAmount = a"
          >
            <p>{{ a }}</p>
          </button>
        </div>
        <p>OR set amount manually</p>
        <div>
          <numeric-input v-model="pledgeAmount" />
        </div>
        <p class="font-bold mt-1">Requirements</p>
        <text-area v-model="description" class="mt-4" />
      </div>
      <div v-if="pledgeStep === 1">
        <p class="font-bold">Lock Funds</p>
        <div class="mt-2 flex gap-1">
          <button
            :class="{ '!bg-black text-gray-50': lockToYourself }"
            class="w-fit px-2 py-1 text-center border border-black rounded text-sm hover:bg-gray-200"
            @click="lockToSelf"
          >
            Yourself
          </button>
          <button
            @click="pubkeyToLockTo = ''"
            :class="{ '!bg-black text-gray-50': !lockToYourself }"
            class="w-fit px-2 py-1 text-center border border-black rounded text-sm hover:bg-gray-200"
          >
            <p>Someone else</p>
          </button>
        </div>
        <div
          v-if="!lockToYourself"
          class="mt-2 w-full bg-gray-100 border border-gray-100 rounded relative"
        >
          <pubkey-select v-model="pubkeyToLockTo" :pubkeys="pkOptions" />
        </div>
      </div>
      <div v-if="pledgeStep === 2">
        <!-- <img
          :src="`https://chart.googleapis.com/chart?cht=qr&chs=512x512&chl=${payRequest}`"
          alt="img"
          class="w-full h-auto"
        /> -->
        <qr-code :data="payRequest" />
        <div class="flex gap-2 mt-2">
          <outlined-button @click="openInvoiceInApp">Open App</outlined-button>
          <outlined-button @click="payWithWebLN">WebLN</outlined-button>
        </div>
      </div>
      <div class="flex w-full justify-between">
        <outlined-button
          v-if="pledgeStep !== 0 && pledgeStep !== pledgeSteps.length - 1"
          @click="previousStep"
          class="mt-4"
          >Previous</outlined-button
        >
        <div class="grow"></div>
        <outlined-button
          v-if="pledgeStep < pledgeSteps.length - 1"
          @click="nextStep"
          class="mt-4"
          >Next</outlined-button
        >
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";
import {
  isHexKey,
  safeDecode,
  getEventIdFromDecodeResult,
} from "~/composables/helpers/nip19";
import outlinedButton from "~/components/buttons/outlined-button.vue";
import baseModal from "~/components/modals/base-modal.vue";
import textArea from "~/components/forms/text-area.vue";
import numericInput from "~/components/forms/numeric-input.vue";
import { wallet } from "~/composables/cashu/wallet";
import { type Token, getEncodedToken } from "@cashu/cashu-ts";
import { useCreatePledgeOnFeature } from "~/composables/nostr/useCreatePledgeOnFeature";
import pubkeySelect from "~/components/forms/pubkey-select.vue";
import { useGetPledgesForFeature } from "~/composables/nostr/useGetPledgesForFeature";
import qrCode from "~/components/qr-code.vue";
import { getUsersFromPledges } from "../../composables/helpers/pledge";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  cancellable: {
    type: Boolean,
    default: false,
  },
});

const r = useRoute();
const { ndk } = useNdk();

const id = r.params["id"] as string;
const hexId = isHexKey(id) ? id : getEventIdFromDecodeResult(safeDecode(id));
if (!hexId) throw new Error("Missing event id");
const event = ref<NDKEvent>();

const amounts = [1, 21, 2100, 21000];
const pledgeAmount = ref(1);
const description = ref("");
const pledgeSteps = ["amount", "lock", "pay", "success"];
const pledgeStep = ref(0);
const pubkeyToLockTo = ref<string>("");
const lockToYourself = computed(
  () => pubkeyToLockTo.value === ndk.activeUser?.pubkey,
);
const invoiceHash = ref("");
const payRequest = ref("");
const pkOptions = ref<{ user: NDKUser; tokens: Token[] }[]>([]);

onMounted(async () => {
  const e = await ndk.fetchEvent(hexId);
  if (!e) {
    throw new Error("could not find feature event");
  }

  event.value = e;
  const pledges = await useGetPledgesForFeature(event.value);
  pkOptions.value = getUsersFromPledges(pledges);
});

const lockToSelf = () => {
  if (ndk.activeUser?.pubkey) pubkeyToLockTo.value = ndk.activeUser.pubkey;
};

const openInvoiceInApp = () => {
  if (payRequest.value)
    window.open(`lightning://${payRequest.value}`, "_blank");
};
const payWithWebLN = async () => {
  if (window.webln) {
    if (!window.webln.enabled) await window.webln.enable();
    await window.webln.sendPayment(payRequest.value);
    nextStep();
  }
};

const nextStep = async () => {
  if (pledgeStep.value === pledgeSteps.length - 1) {
    return;
  }

  if (pledgeStep.value === 0) {
    lockToSelf();
  }

  if (pledgeStep.value === 1) {
    const { pr, hash } = await wallet.requestMint(pledgeAmount.value);
    payRequest.value = pr;
    invoiceHash.value = hash;
  }

  if (pledgeStep.value === 2) {
    try {
      if (!pubkeyToLockTo.value) throw new Error("missing p2pk pubkey");
      wallet.p2pkSendLockPubkey = "02" + pubkeyToLockTo.value;
      const { proofs } = await wallet.requestTokens(
        pledgeAmount.value,
        invoiceHash.value,
      );
      wallet.p2pkSendLockPubkey = null;
      const token: Token = {
        token: [
          {
            proofs,
            mint: wallet.mint.mintUrl,
          },
        ],
      };
      const encodedToken = getEncodedToken(token);
      await useCreatePledgeOnFeature(
        event.value!,
        description.value,
        encodedToken,
        pledgeAmount.value,
        pubkeyToLockTo.value,
      );
    } catch (error) {
      return;
    }
  }

  pledgeStep.value += 1;
};

const previousStep = async () => {
  if (pledgeStep.value === 0) {
    return;
  }
  pledgeStep.value -= 1;
};

const onSubmit = () => {};
</script>
