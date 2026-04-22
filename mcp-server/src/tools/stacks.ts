import { z } from "zod";

/** Mirrors `core.py` STACK_CONFIG keys. */
export const SUPPORTED_STACKS = [
  "react",
  "nextjs",
  "vue",
  "svelte",
  "astro",
  "swiftui",
  "react-native",
  "flutter",
  "nuxtjs",
  "nuxt-ui",
  "html-tailwind",
  "shadcn",
  "jetpack-compose",
  "threejs",
  "angular",
  "laravel",
] as const;

export const stackSchema = z.enum(SUPPORTED_STACKS);
