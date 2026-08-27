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
        light: "gruvbox-light-medium",
        dark: "gruvbox-dark-medium",
      },
      defaultColor: false,
      wrap: false,
    },
  },
  fonts: [
    {
      // Body text. Astro downloads and self-hosts this, so there is no runtime
      // request to Google. Source Serif 4 ships a true italic — Atkinson, which
      // this replaces, had no italic file in the repo, so every <em> on the site
      // was a browser-synthesised oblique.
      provider: fontProviders.google(),
      name: "Source Serif 4",
      cssVariable: "--font-serif",
      weights: [400, 600],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "Cambria", "Times New Roman", "serif"],
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
