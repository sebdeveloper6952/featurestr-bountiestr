<template>
  <div class="flex items-center">
    <div v-for="user in pubkeys" class="flex -space-x-2">
      <user-image :user="user" />
    </div>
    <div
      v-if="summarized && showSummary"
      class="flex justify-center items-center h-10 w-10 rounded-full bg-gray-300 text-gray-500"
    >
      +9
    </div>
  </div>
</template>

<script setup lang="ts">
import userImage from "./user-image.vue";
import { type NDKUser } from "@nostr-dev-kit/ndk";

const props = defineProps({
  pubkeys: {
    type: Array as PropType<NDKUser[]>,
    default: [],
  },
  limit: {
    type: Number,
    default: 3,
  },
  summarized: {
    type: Boolean,
    default: false,
  },
});

const showSummary = props.pubkeys.length > props.limit;
</script>
