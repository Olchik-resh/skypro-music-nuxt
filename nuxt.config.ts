// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/test-utils",
    "@pinia/nuxt",
    "@nuxtjs/google-fonts",
    "@nuxt/image",
  ],
  css: ["assets/main.css"],
  image: {
    provider: "ipx",
  },
  googleFonts: {
    families: {
      Montserrat: [400, 700],
    },
  },
});
