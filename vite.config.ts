import md from "unplugin-vue-markdown/vite";
import vue from "@vitejs/plugin-vue";
import {pages} from "vike-cloudflare";
import { defineConfig } from "vite";
import vike from "vike/plugin";

export default defineConfig({
  plugins: [vike({}), pages(), vue({
    include: [/\.vue$/, /\.md$/],
  }), md({})],
});