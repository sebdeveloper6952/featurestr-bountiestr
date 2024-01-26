<template>
  <base-modal :show="show" @close="$emit('close')" :cancellable="false">
    <div class="md:w-[6in] px-6 py-4 overflow-auto">
      <div v-if="encodedToken">
        <img
          :src="`https://chart.googleapis.com/chart?cht=qr&chs=512x512&chl=${encodedToken}`"
          alt="img"
          class="w-full h-auto"
        />
        <div class="flex gap-2">
          <outline-button @click="openInWallet">Open in wallet</outline-button>
          <outline-button @click="copyToken">Copy</outline-button>
          <outline-button @click="emit('close')" class="ml-auto"
            >Done</outline-button
          >
        </div>
      </div>
      <div v-else>
        <h2 class="text-lg font-bold text-center my-4">Redeem payout?</h2>
        <div class="flex gap-2 justify-between">
          <outline-button @click="emit('close')">Cancel</outline-button>
          <outline-button @click="confirm">Redeem</outline-button>
        </div>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { type NDKEvent } from "@nostr-dev-kit/ndk";
import baseModal from "~/components/modals/base-modal.vue";
import outlineButton from "~/components/buttons/outlined-button.vue";
import { wallet } from "../../composables/cashu/wallet";
import { getEncodedToken } from "@cashu/cashu-ts";
import { getTokenFromEvent } from "../../composables/helpers/pledge";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object as PropType<NDKEvent>,
    default: null,
  },
});

const emit = defineEmits(["close"]);

const encodedToken = ref();

const confirm = async () => {
  const token = getTokenFromEvent(props.event);
  if (!token) return alert("No token on pledge");
  const { token: newToken } = await wallet.receive(token);
  encodedToken.value = getEncodedToken(newToken);
};

const openInWallet = () => {
  if (encodedToken.value) {
    window.open(`cashu://${encodedToken.value}`, "_blank");
  }
};
const copyToken = () => {
  if (encodedToken.value) {
    navigator.clipboard.writeText(encodedToken.value);
  }
};
</script>
