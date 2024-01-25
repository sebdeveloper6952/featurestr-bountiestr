import { mergeProps } from 'vue';
<template>
  <div
    v-if="show"
    @click="onModalBackgroundClick"
    class="w-screen h-screen flex justify-center items-center bg-gray-500/50 absolute top-0 left-0 z-40"
  >
    <div
      class="w-full h-full md:w-fit md:h-fit bg-gray-50 rounded-lg z-50 relative"
    >
      <slot />
      <div class="absolute top-1 right-1">
        <button
          @click="emit('close')"
          class="rounded-full hover:bg-gray-400/50"
        >
          <nuxt-icon filled name="close" class="text-xl" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  cancellable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const onModalBackgroundClick = (event: MouseEvent) => {
  if (props.cancellable && event.target === event.currentTarget) {
    emit("close");
  }
};
</script>
