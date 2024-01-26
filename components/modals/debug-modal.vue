<template>
  <base-modal :show="show" @close="$emit('close')" :cancellable="true">
    <div class="md:w-[8in] px-2 py-4 overflow-auto max-h-screen">
      <code class="whitespace-pre px-2">{{
        JSON.stringify(event.rawEvent(), null, 2)
      }}</code>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { type NDKEvent } from "@nostr-dev-kit/ndk";
import baseModal from "~/components/modals/base-modal.vue";

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
