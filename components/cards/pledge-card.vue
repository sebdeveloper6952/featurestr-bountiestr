<template>
  <div class="w-full rounded-xl bg-white p-6">
    <!-- <outlined-button class="absolute bottom-2 right-2">Edit</outlined-button> -->
    <div
      class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300"
    >
      <user-image :user="event.author" />
    </div>
    <p class="px-4 text-gray-500">
      {{ event.content }}
    </p>
    <p>{{ total }} sats</p>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from "vue";
import { type Token } from "@cashu/cashu-ts";
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";
import outlinedButton from "~/components/buttons/outlined-button.vue";
import userImage from "../user-image.vue";
import { getTokenFromPeldge } from "~/composables/helpers/pledge";
import { getTokenTotal } from "~/composables/helpers/cashu";

const props = defineProps({
  event: { type: Object as PropType<NDKEvent>, default: null },
});

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
