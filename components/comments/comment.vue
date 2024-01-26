<template>
  <div class="flex gap-2 flex-col">
    <div class="flex gap-2">
      <user-image :user="event.author" />
      <user-name :user="event.author" />
      <div class="ml-auto">
        <icon-button @click="debug = true" icon="code" />
      </div>
    </div>
    <p>{{ event.content }}</p>
    <div class="flex" v-if="reply === false">
      <outlined-button @click="reply = true">Reply</outlined-button>
    </div>
    <new-comment-form v-if="reply" :root-event="root" :parent="event">
      <template v-slot:buttons>
        <outlined-button @click="reply = false">Cancel</outlined-button>
      </template>
    </new-comment-form>
    <div class="flex flex-col gap-2 pl-4">
      <comment
        v-for="child in replies"
        :event="child"
        :parent="event"
        :root="root"
        :events="events"
      />
    </div>
    <debug-modal :event="event" :show="debug" @close="debug = false" />
  </div>
</template>
<script setup lang="ts">
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import userImage from "../user-image.vue";
import userName from "../user-name.vue";
import newCommentForm from "./new-comment-form.vue";
import outlinedButton from "../buttons/outlined-button.vue";
import debugModal from "~/components/modals/debug-modal.vue";
import iconButton from "~/components/buttons/icon-button.vue";

const props = defineProps({
  event: {
    type: Object as PropType<NDKEvent>,
    default: null,
  },
  parent: {
    type: Object as PropType<NDKEvent>,
    default: null,
  },
  root: {
    type: Object as PropType<NDKEvent>,
    default: null,
  },
  events: {
    type: Array as PropType<NDKEvent[]>,
    default: [],
  },
});

const debug = ref(false);
const reply = ref(false);

const replies = computed(() => {
  return props.events.filter((e) =>
    e.tags.some(
      (t) => t[0] === "e" && t[1] === props.event.id && t[3] === "reply",
    ),
  );
});
</script>
