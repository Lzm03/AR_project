import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Signup from "../views/Signup.vue";

import Library from "../views/Library.vue";
import CreateCharacter from "../views/CreateCharacter.vue";
import Chatbot from "../views/chatbot.vue";

import LibraryLayout from "../layouts/libraryLayout.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    /* ===== 不需要 Top Bar 的页面 ===== */
    { path: "/", component: Home },
    { path: "/login", component: Login },
    { path: "/signup", component: Signup },

    /* ===== 需要 Library Top Bar 的页面 ===== */
    {
      path: "/",
      component: LibraryLayout,
      children: [
        { path: "library", component: Library },
        { path: "create", component: CreateCharacter },
        { path: "chat/:id", component: Chatbot },
      ],
    },
  ],
});
