<template>
  <div class="p-4">
    <p class="text-xl font-bold">Post Solution to Feature</p>

    <div class="w-full md:w-1/2">
      <text-area
        v-model="description"
        label="Enter your description:"
        class="mt-4"
      />
      <outlined-button @click="onSubmit" class="mt-4">Submit</outlined-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNdk } from "~/composables/nostr/ndk";
import textInput from "~/components/forms/text-input.vue";
import textArea from "~/components/forms/text-area.vue";
import outlinedButton from "~/components/buttons/outlined-button.vue";

const { ndk, setSk, logout, activeUser } = useNdk();

const description = ref("");

const onSubmit = async () => {};
</script>
