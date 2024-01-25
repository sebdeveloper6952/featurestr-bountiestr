<template>
  <div>
    <button @click="showItems = !showItems" class="w-full px-2 py-2">
      <div v-if="selectedUser?.profile" class="h-full flex gap-2 items-center">
        <user-image :user="selectedUser" />
        <user-name :user="selectedUser" />
        <div class="grow"></div>
        <nuxt-icon filled name="arrow_down" class="text-xl" />
      </div>
    </button>
    <ul v-if="showItems" class="px-2 py-2 border-t border-gray-300">
      <li
        @click="selectUser(u)"
        :key="u.pubkey"
        v-for="u in pubkeys"
        :value="u?.pubkey"
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
const showItems = ref(false);

onMounted(() => {
  selectedUser.value = props.pubkeys[0];
});

const selectUser = (u: NDKUser) => {
  selectedUser.value = u;
  showItems.value = false;
  emit("update:modelValue", selectedUser.value.pubkey);
};
</script>
