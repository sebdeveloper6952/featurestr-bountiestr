<template>
  <div>
    <ul class="px-2 py-2 border-t border-gray-300">
      <li
        @click="selectUser(u.user)"
        v-for="u in pubkeys"
        :key="u.user.pubkey"
        :value="u.user.pubkey"
        :class="{ 'bg-gray-300': selectedUser?.pubkey === u.user.pubkey }"
        class="hover:cursor-pointer my-2 border-b border-gray-300"
      >
        <div class="flex gap-2">
          <div class="h-8 w-8">
            <user-image :user="u.user" />
          </div>
          <user-name :user="u.user" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { type Token } from "@cashu/cashu-ts";
import { NDKUser } from "@nostr-dev-kit/ndk";
import userImage from "~/components/user-image.vue";
import userName from "~/components/user-name.vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: { type: String, default: "" },
  pubkeys: {
    type: Array as PropType<{ user: NDKUser; tokens: Token[] }[]>,
    default: [],
  },
});

const selectedUser = ref<NDKUser>();

onMounted(() => {
  selectedUser.value = props.pubkeys[0].user;
});

const selectUser = (u: NDKUser) => {
  selectedUser.value = u;
  emit("update:modelValue", selectedUser.value.pubkey);
};
</script>
