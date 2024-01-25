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
          {{ dayjs.unix(event.created_at!).format("lll") }}
        </p>
        <p class="text-gray-500">{{ total }} sats</p>
      </div>
      <div class="ml-auto flex gap-2">
        <outlined-button
          @click="withdrawalModal = true"
          v-if="event.author.pubkey === ndk.activeUser?.pubkey"
          >Withdraw</outlined-button
        >
        <icon-button @click="debug = true" icon="code" />
      </div>
    </div>
    <p>
      {{ event.content }}
    </p>

    <withdrawal-pledge-modal
      :event="event"
      :show="withdrawalModal"
      @close="withdrawalModal = false"
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
import withdrawalPledgeModal from "../modals/withdrawal-pledge-modal.vue";
import { getTokenFromPeldge } from "~/composables/helpers/pledge";
import { getTokenTotal } from "~/composables/helpers/cashu";

const props = defineProps({
  event: { type: Object as PropType<NDKEvent>, default: null },
});

const debug = ref(false);
const withdrawalModal = ref(false);
const { ndk } = useNdk();
const token = ref<Token>();
const total = ref(0);

onMounted(() => {
  const t = getTokenFromPeldge(props.event);
  if (t) {
    token.value = t;
    total.value = getTokenTotal([t]);
  }
});
</script>
