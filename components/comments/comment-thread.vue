<template>
  <div class="mt-4 p-4 w-full rounded-xl bg-white shadow-xl">
    <div class="flex justify-between">
      <h4 class="text-left font-bold">Comments</h4>
      <outlined-button v-if="reply === false" @click="reply = true"
        >Reply</outlined-button
      >
    </div>
    <div class="flex gap-2 flex-col">
      <new-comment-form
        v-if="reply"
        :root-event="rootEvent"
        @post="handleEvent"
      >
        <template v-slot:buttons>
          <outlined-button @click="reply = false">Cancel</outlined-button>
        </template></new-comment-form
      >
      <div class="w-full flex justify-center" v-if="rootComments.length === 0">
        <div class="flex">
          <p class="text-gray-500">No comments yet</p>
        </div>
      </div>
      <comment
        v-for="comment in rootComments"
        :event="comment"
        :parent="rootEvent"
        :root="rootEvent"
        :events="events"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NDKEvent, NDKFilter, NDKSubscription } from "@nostr-dev-kit/ndk";
import { kinds } from "nostr-tools";
import { useNdk } from "~/composables/nostr/ndk";
import { getEventCoordinate } from "../../composables/helpers/event";
import outlinedButton from "../buttons/outlined-button.vue";
import comment from "./comment.vue";
import newCommentForm from "./new-comment-form.vue";
import { CommentKind } from "../../composables/nostr/kinds";

const props = defineProps({
  rootEvent: {
    type: Object as PropType<NDKEvent>,
    default: [],
  },
});

const { ndk } = useNdk();

const reply = ref(false);
const eventMap = ref(new Map<string, NDKEvent>());
const events = computed(
  () => Array.from(eventMap.value.values()) as NDKEvent[],
);

const rootId = computed(() =>
  kinds.isParameterizedReplaceableKind(props.rootEvent.kind!)
    ? getEventCoordinate(props.rootEvent)
    : props.rootEvent.id,
);
const rootComments = computed(() =>
  events.value.filter((e) => {
    const hasRoot = e.tags.some(
      (t) =>
        (t[0] === "e" || t[0] === "a") &&
        t[1] === rootId.value &&
        t[3] == "root",
    );
    const hasReply = e.tags.some(
      (t) => (t[0] === "e" || t[0] === "a") && t[3] === "reply",
    );
    return hasRoot && !hasReply;
  }),
);
let sub: NDKSubscription;

const handleEvent = (event: NDKEvent) => {
  eventMap.value.set(event.id, event);
};
onMounted(async () => {
  const filter: NDKFilter = kinds.isParameterizedReplaceableKind(
    props.rootEvent.kind!,
  )
    ? { kinds: [CommentKind], "#a": [getEventCoordinate(props.rootEvent)] }
    : { kinds: [CommentKind], "#e": [props.rootEvent.id] };
  const sub = await ndk.subscribe([filter]);
  sub.on("event", handleEvent);
  sub.start();
});

onUnmounted(() => {
  if (sub) sub.stop();
});
</script>
