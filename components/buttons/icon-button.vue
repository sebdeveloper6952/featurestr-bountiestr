<template>
  <button
    class="h-fit px-2 py-1 rounded font-bold text-gray-800 bg-white border-2 border-black hover:bg-black hover:text-gray-100 hover:cursor-pointer active:bg-gray-800 active:text-gray-100 active:cursor-pointer"
  >
    <nuxt-icon v-if="icon !== ''" filled :name="icon" class="text-xl" />
  </button>
</template>

<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: "",
  },
});
</script>
