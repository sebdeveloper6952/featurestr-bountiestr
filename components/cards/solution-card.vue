<template>
  <div class="w-full rounded-xl bg-white px-2 py-2">
    <div class="flex gap-2 w-full">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300"
      >
        <user-image :user="event.author" />
      </div>
      <div class="flex items-center gap-2">
        <user-name :user="event.author" />
        <p class="text-gray-500 text-sm">
          {{ dayjs.unix(event.created_at!).format("lll") }}
        </p>
      </div>

      <div class="ml-auto flex gap-2">
        <icon-button
          @click="navigateTo('/feature/solution/details/' + nevent)"
          icon="details"
        />
        <icon-button @click="debug = true" icon="code" />
      </div>
    </div>
    <solution-modal :event="event" :show="details" @close="details = false" />
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
import solutionModal from "../modals/solution-modal.vue";
import iconButton from "~/components/buttons/icon-button.vue";
import userImage from "~/components/user-image.vue";
import userName from "~/components/user-name.vue";
import { getTokensTotal } from "~/composables/helpers/cashu";
import { getTokenFromEvent } from "../../composables/helpers/pledge";
import { nip19 } from "nostr-tools";

const props = defineProps({
  event: { type: Object as PropType<NDKEvent>, default: null },
});

const debug = ref(false);
const details = ref(false);
const withdrawalModal = ref(false);
const { ndk } = useNdk();
const token = ref<Token>();
const total = ref(0);

const nevent = nip19.neventEncode({
  id: props.event.id,
  author: props.event.author.pubkey,
  kind: props.event.kind,
  relays: [props.event.relay?.url!],
});

onMounted(() => {
  const t = getTokenFromEvent(props.event);
  if (t) {
    token.value = t;
    total.value = getTokensTotal([t]);
  }
});
</script>
