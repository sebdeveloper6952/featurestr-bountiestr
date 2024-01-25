<template>
  <div
    class="w-full h-16 flex justify-between items-center border-b border-gray-300 py-2 px-2 md:px-4 relative"
  >
    <div
      class="flex items-center gap-1 cursor-pointer"
      @click="navigateTo('/')"
    >
      <nuxt-icon filled name="cashu" class="text-4xl" />
      <p class="text-xl font-bold">Cashu</p>
    </div>
    <div class="flex items-center relative">
      <outlined-button
        v-if="activeUser !== undefined"
        class="mr-5"
        @click="navigateTo('/create')"
        >Create</outlined-button
      >
      <button
        @click="showDropdown = !showDropdown"
        v-if="activeUser != undefined"
      >
        <img
          :src="
            activeUser.profile?.image ||
            'https://robohash.org/' + activeUser?.npub
          "
          alt="img"
          class="w-10 h-10 p-px ring ring-slate-300 rounded-full"
        />
      </button>
      <outlined-button v-else @click="showLoginModal = true"
        >login</outlined-button
      >
      <transition
        enter-from-class="opacity-0 -translate-y-8 translate-x-8"
        enter-active-class="duration-150 ease-out"
        enter-to-class="opacity-100"
        leave-from-class=""
        leave-active-class="duration-150 ease-out"
        leave-to-class="opacity-0 -translate-y-8 scale-x-0 translate-x-16"
      >
        <div
          v-if="showDropdown"
          class="flex flex-col bg-gray-100 border rounded-md absolute top-10 right-2 z-50"
        >
          <div
            @click="navTo('/profile')"
            class="py-1 px-12 flex gap-2 hover:bg-gray-200 cursor-pointer"
          >
            <nuxt-icon filled name="profile" class="text-xl" />
            <p>Profile</p>
          </div>
          <div
            @click="onLogout"
            class="py-1 px-12 flex gap-2 hover:bg-gray-200 cursor-pointer"
          >
            <nuxt-icon filled name="logout" class="text-xl" />
            <p>Logout</p>
          </div>
        </div>
      </transition>
    </div>

    <base-modal :show="showLoginModal" @close="showLoginModal = false">
      <div class="px-16 py-4">
        <p class="text-lg font-bold">nsec:</p>
        <p>
          Your nsec will be saved in local storage, you can logout at any time.
        </p>
        <text-input v-model="sk" type="password" class="mt-4" />
        <div class="flex justify-center">
          <outlined-button
            :disabled="sk === null || sk === ''"
            @click="onLogin"
            class="mt-4 px-2 py-1 text-md bg-white text-black rounded"
          >
            Login
          </outlined-button>
        </div>
      </div>
    </base-modal>
  </div>
</template>

<script setup lang="ts">
import { useNdk } from "~/composables/nostr/ndk";
import baseModal from "~/components/modals/base-modal.vue";
import textInput from "~/components/forms/text-input.vue";
import outlinedButton from "~/components/buttons/outlined-button.vue";

import { safeDecode, isHexKey } from "~/composables/helpers/nip19";
import { bytesToHex } from "@noble/hashes/utils";

const { activeUser, setSk, logout } = useNdk();

const showLoginModal = ref(false);
const showDropdown = ref(false);
const sk = ref("");

const onLogin = async () => {
  if (isHexKey(sk.value)) {
    await setSk(sk.value);
  } else {
    const decode = safeDecode(sk.value);
    if (decode && decode.type === "nsec") await setSk(bytesToHex(decode.data));
  }
  showLoginModal.value = false;
};

const onLogout = () => {
  showDropdown.value = false;
  logout();
};

const navTo = (route: string) => {
  showDropdown.value = false;
  navigateTo(route);
};
</script>
