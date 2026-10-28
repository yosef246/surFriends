import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Teach tailwind-merge about the custom font-size tokens (text-body, text-title, ...),
// otherwise it treats them as text *colors* and drops e.g. text-primary-foreground.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["display", "title", "heading", "body", "body-sm", "caption", "data"],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
