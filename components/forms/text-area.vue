<template>
  <div>
    <label for="message" class="block mb-2 text-sm font-medium text-gray-900">{{
      label
    }}</label>
    <textarea
      :value="modelValue"
      @input="updateInputValue"
      id="message"
      rows="4"
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none"
      :placeholder="placeholder"
      :required="required"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: { type: String, default: "" },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const updateInputValue = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
};
</script>
