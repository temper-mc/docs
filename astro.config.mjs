// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://docs.temper-mc.com",

  integrations: [
    starlight({
      title: "Temper MC Documentation",
      description: "Documentation for the Temper MC Server",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/temper-mc/temper",
        },
        {
          icon: "discord",
          label: "Discord",
          href: "https://discord.gg/6QPZgUy4sA",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/temper-mc/docs/edit/main/",
      },
      customCss: ["./src/styles/global.css"],
      defaultLocale: "en",
      components: {
        SiteTitle: "./src/components/SiteTitle.astro",
        Head: "./src/components/Head.astro",
      },
      sidebar: [
        {
          label: "ECS",
          items: [
            { label: "Quick introduction to Bevy ECS", slug: "ecs/intro" },
            { label: "Why use an ECS?", slug: "ecs/why" },
            { label: "How to use an ECS", slug: "ecs/how" },
            { label: "Performance in the ECS", slug: "ecs/performance" },
          ],
        },
        {
          label: "Guides",
          items: [{ label: "Example Guide", slug: "guides/example" }],
        },
        {
          label: "Docs",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        {
          label: "Reference",
          items: [{ autogenerate: { directory: "reference" } }],
        },
      ],
    }),
    sitemap(),
    mdx(),
  ],

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true,
    },
  },
});
