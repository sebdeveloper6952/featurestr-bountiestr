<template>
  <div>
    <QRCodeVue3
      :width="512"
      :height="512"
      :value="data"
      :dotsOptions="{
        type: 'rounded',
      }"
      :cornersDotOptions="{
        type: 'dot',
      }"
      :cornersSquareOptions="{
        type: 'extra-rounded',
      }"
    />
  </div>
</template>

<script setup lang="ts">
import QRCodeVue3 from "qrcode-vue3";

defineProps({
  data: {
    type: String,
    default: "",
  },
});
</script>
