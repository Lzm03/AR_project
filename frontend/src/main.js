import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import '@google/model-viewer';


// import "./assets/auth.css";

createApp(App).use(router).mount("#app");
