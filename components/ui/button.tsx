import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// surFriends day 3: 44px touch targets, logical (RTL-safe) padding, brand focus ring,
// press feedback via scale, motion tokens from globals.css.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-pill border border-transparent bg-clip-padding text-body-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-(--dur-fast) ease-(--ease-press) outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-signature text-ink hover:bg-signature-hover active:bg-signature-pressed",
        accent:
          "bg-signature text-ink hover:bg-signature-hover active:bg-signature-pressed",
        outline:
          "border-input bg-card text-ink hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        secondary:
          "bg-surface text-ink hover:bg-secondary aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "text-ink hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[color-mix(in_srgb,var(--destructive),black_12%)] focus-visible:ring-destructive",
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-4 text-body has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        xs: "h-8 gap-1 px-2.5 text-caption has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-4",
        sm: "h-10 gap-1.5 px-3 text-body-sm has-data-[icon=inline-end]:pe-2.5 has-data-[icon=inline-start]:ps-2.5 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 gap-2 px-5 text-body has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        icon: "size-11",
        "icon-xs":
          "size-8 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm":
          "size-10 ",
        "icon-lg": "size-12",
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
