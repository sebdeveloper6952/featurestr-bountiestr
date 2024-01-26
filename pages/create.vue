<template>
  <div class="w-full flex justify-center">
    <div
      class="p-2 md:p-0 w-full md:max-w-screen-md lg:max-w-screen-lg flex flex-col items-center justify-center"
    >
      <p class="text-xl font-bold">Create Feature Request</p>

      <div class="w-full md:w-1/2">
        <text-input v-model="title" label="Enter a title:" />
        <text-area
          v-model="description"
          label="Enter your description:"
          class="mt-4"
        />
        <p class="mt-4 text-sm">Additional tags:</p>
        <div class="flex items-center gap-1">
          <text-input v-model="tag" autocomplete="off" />
          <outlined-button @click="addTag">Add</outlined-button>
        </div>

        <div class="flex gap-1">
          <div
            v-for="(t, i) in additionalTags"
            class="w-fit mt-2 px-2 py-1 flex text-sm bg-blue-300/50 text-blue-500 font-bold rounded"
          >
            <p>{{ t }}</p>
            <div @click="removeTag(i)" class="ml-2 cursor-pointer">x</div>
          </div>
        </div>
        <outlined-button @click="onSubmit" class="mt-4">Submit</outlined-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNdk } from "~/composables/nostr/ndk";
import { useCreatePledge } from "~/composables/nostr/useCreatePledge";
import textInput from "~/components/forms/text-input.vue";
import textArea from "~/components/forms/text-area.vue";
import outlinedButton from "~/components/buttons/outlined-button.vue";

const { ndk, setSk, logout, activeUser } = useNdk();

const title = ref("");
const description = ref("");
const tag = ref("");
const additionalTags = ref<string[]>([]);

const addTag = () => {
  if (tag.value === "") return;
  additionalTags.value.push(tag.value);
  tag.value = "";
};

const removeTag = (i: number) => {
  additionalTags.value.splice(i, 1);
};

const onSubmit = async () => {
  await useCreatePledge(title.value, description.value, additionalTags.value);
  title.value = "";
  description.value = "";
  tag.value = "";
  additionalTags.value = [];
};
</script>
