<template>
  <label for="input" class="mb-2 text-sm font-medium text-gray-900">{{
    label
  }}</label>
  <input
    id="input"
    @input="updateInputValue"
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    class="w-full px-2 py-2 bg-gray-50 text-black placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none"
  />
</template>

<script setup lang="ts">
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  type: { type: String, default: "text" },
  autocomplete: { type: String },
});

const updateInputValue = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
};
</script>
