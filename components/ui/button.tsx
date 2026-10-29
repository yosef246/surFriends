import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// surFriends v3 "Sea": bubbly pill buttons. Look (gloss, ocean-tinted shadow, hover lift,
// press squish) lives in globals.css `bubble-*` utilities. Focus uses the global
// :focus-visible outline (box-shadow is reserved for the bubble look).
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-pill border border-transparent bg-clip-padding text-body-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform,filter,opacity] duration-(--dur-base) ease-(--ease-spring) select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:outline-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bubble-primary",
        accent: "bubble-primary",
        secondary: "bubble-glass",
        soft: "bubble-soft",
        outline: "bubble-outline",
        ghost: "bubble-ghost",
        destructive: "bubble-danger",
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
