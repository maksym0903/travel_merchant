import { createSSRApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import i18n from "./i18n";
import App from "./App.vue";
import "./fix-inputs.css";
import "./responsive.css";
import "./toast-modal.css";
import "./tailwind.css";

export function createApp() {
  const app = createSSRApp(App);
  app.use(i18n);
  app.use(VueQueryPlugin);
  return {
    app,
  };
}
