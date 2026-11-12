import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// surFriends v5 "Slush": pill buttons, 48px tall, bold with slightly open tracking. Colors live in the globals.css
// `bubble-*` utilities (black primary, white outlined secondary, sticker variants). Focus uses :focus-visible.
// Use className="btn-gradient" with variant="default" for the full-width key action.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-body-sm font-bold tracking-[0.02em] whitespace-nowrap transition-[color,background-color,border-color,transform,filter,opacity] duration-(--dur-fast) ease-out select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:outline-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bubble-primary",
        accent: "bubble-primary",
        ocean: "bubble-ocean border-black",
        // border-black wins over the base border-transparent (tailwind-merge), so outlined variants keep their edge.
        secondary: "bubble-glass border-black",
        soft: "bubble-soft border-black",
        outline: "bubble-outline border-black",
        ghost: "bubble-ghost",
        destructive: "bubble-danger border-black",
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-12 gap-2 px-6 text-body has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        xs: "h-8 gap-1 px-3 text-caption has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-4",
        sm: "h-10 gap-1.5 px-4 text-body-sm has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-14 gap-2 px-8 text-body has-data-[icon=inline-end]:pe-6 has-data-[icon=inline-start]:ps-6",
        icon: "size-12",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-10",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
