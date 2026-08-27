// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import { rehypeCodeFigure } from "./src/lib/rehype-code-figure.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://gutslike.github.io",
  integrations: [mdx(), sitemap()],
  markdown: {
    // Wraps each code block in a <figure> that owns the language label
    // and the copy button, neither of which should scroll with the code.
    rehypePlugins: [rehypeCodeFigure],
    shikiConfig: {
      // Both palettes are emitted as CSS custom properties and resolved in
      // global.css, so code blocks follow the page theme instead of being
      // locked to one at build time.
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
      wrap: false,
    },
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Atkinson",
      cssVariable: "--font-atkinson",
      fallbacks: ["sans-serif"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/atkinson-regular.woff"],
            weight: 400,
            style: "normal",
            display: "swap",
          },
          {
            src: ["./src/assets/fonts/atkinson-bold.woff"],
            weight: 700,
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
    {
      // Code is the primary content here — 360+ fenced blocks. Without this
      // they fall back to whatever `monospace` means on the reader's OS.
      // Astro downloads and self-hosts this, so there is no runtime request
      // to Google.
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      weights: [400, 700],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: [
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Consolas",
        "monospace",
      ],
    },
  ],
});
