// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: "/featurestr-bountiestr",
  },
  telemetry: false,
  devtools: { enabled: false },
  devServer: {
    port: 3001,
  },
  modules: ["nuxt-icons"],
  css: ["~/assets/css/main.css"],
  ssr: false,
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  plugins: [],
});
