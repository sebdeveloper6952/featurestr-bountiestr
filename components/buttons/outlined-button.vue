<template>
  <button
    class="h-fit px-6 py-1 rounded font-bold text-gray-800 bg-white border-2 border-black hover:bg-black hover:text-gray-100 hover:cursor-pointer active:bg-gray-800 active:text-gray-100 active:cursor-pointer disabled:cursor-not-allowed"
    :type="type"
    :disabled="disabled"
  >
    <div class="flex items-center gap-1">
      <slot />
      <nuxt-icon v-if="icon !== ''" filled :name="icon" class="text-xl" />
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: "",
  },
  type: {
    type: String as PropType<"button" | "submit">,
    default: "button",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>
