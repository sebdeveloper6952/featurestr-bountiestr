<template>
  <base-modal :show="show" @close="$emit('close')" cancellable>
    <div class="md:w-[8in] px-2 py-4 overflow-auto">
      <div class="flex items-center">
        <p class="text-gray-500">Solution submitted by:</p>
        <div
          class="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-300"
        >
          <user-image :user="event.author" />
        </div>
        <div class="ml-2 flex items-center gap-2">
          <user-name :user="event.author" />
          <p class="text-gray-500 text-sm">
            @ {{ dayjs.unix(event.created_at!).format("lll") }}
          </p>
        </div>
      </div>
      <div>
        <p class="text-gray-500 text-xl">Details</p>
        <p>{{ event.content }}</p>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { type NDKEvent } from "@nostr-dev-kit/ndk";
import baseModal from "~/components/modals/base-modal.vue";
import dayjs from "dayjs";

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
</script>
