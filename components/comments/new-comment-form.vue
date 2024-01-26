<template>
  <form @submit="submit">
    <text-area v-model="content" class="mt-4" :required="true" />
    <div class="flex gap-2 justify-end mt-2">
      <slot name="buttons"></slot>
      <outlined-button type="submit" :disabled="content.length === 0 || loading"
        >Post</outlined-button
      >
    </div>
  </form>
</template>

<script setup lang="ts">
import { NDKEvent } from "@nostr-dev-kit/ndk";
import textArea from "../forms/text-area.vue";
import outlinedButton from "../buttons/outlined-button.vue";
import { useNdk } from "~/composables/nostr/ndk";
import { CommentKind } from "~/composables/nostr/kinds";
import { kinds } from "nostr-tools";
import { getEventCoordinate } from "~/composables/helpers/event";

const props = defineProps({
  rootEvent: {
    type: Object as PropType<NDKEvent>,
    default: null,
  },
  parent: {
    type: Object as PropType<NDKEvent>,
    default: null,
  },
});

if (!props.rootEvent) throw new Error("Expected root event");

const { ndk } = useNdk();
const loading = ref(false);
const content = ref("");

const emit = defineEmits(["post"]);

const submit = async (e: Event) => {
  e.preventDefault();
  loading.value = true;
  const comment = new NDKEvent(ndk);
  comment.kind = CommentKind;
  comment.content = content.value;

  // add root tag
  if (kinds.isParameterizedReplaceableKind(props.rootEvent.kind!))
    comment.tags.push(["a", getEventCoordinate(props.rootEvent), "", "root"]);
  else comment.tags.push(["e", props.rootEvent.id, "", "root"]);

  comment.tags.push(["p", props.rootEvent.author.pubkey]);

  // add reply tag
  if (props.parent && props.parent.kind === CommentKind) {
    comment.tags.push(["e", props.parent.id, "", "reply"]);
    comment.tags.push(["p", props.parent.author.pubkey]);
  }

  await comment.publish();
  content.value = "";
  loading.value = false;
  emit("post", comment);
};
</script>
