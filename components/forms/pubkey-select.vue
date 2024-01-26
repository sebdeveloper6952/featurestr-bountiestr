<template>
  <div>
    <ul class="px-2 py-2 border-t border-gray-300">
      <li
        @click="selectUser(u)"
        :key="u.pubkey"
        v-for="u in pubkeys"
        :value="u?.pubkey"
        :class="{ 'bg-gray-300': selectedUser?.pubkey === u?.pubkey }"
        class="hover:cursor-pointer my-2 border-b border-gray-300"
      >
        <div class="flex gap-2">
          <user-image :user="u" />
          <user-name :user="u" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { NDKUser } from "@nostr-dev-kit/ndk";
import userImage from "~/components/user-image.vue";
import userName from "~/components/user-name.vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: { type: String, default: "" },
  pubkeys: {
    type: Array as PropType<NDKUser[]>,
    default: [],
  },
});

const selectedUser = ref<NDKUser>();

onMounted(() => {
  selectedUser.value = props.pubkeys[0];
});

const selectUser = (u: NDKUser) => {
  selectedUser.value = u;
  emit("update:modelValue", selectedUser.value.pubkey);
};
</script>
