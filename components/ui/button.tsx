import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--radius)] border-2 border-border bg-clip-padding text-sm font-bold whitespace-nowrap transition-[transform,box-shadow,background-color,color] outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/50 active:translate-y-0.5 active:translate-x-0.5 disabled:pointer-events-none disabled:opacity-50 shadow-[3px_3px_0px_0px_var(--shadow-ink)] hover:shadow-[4px_4px_0px_0px_var(--shadow-ink)] hover:-translate-y-px hover:-translate-x-px active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline:
          "bg-card text-card-foreground hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground",
        ghost:
          "border-transparent shadow-none hover:border-border hover:shadow-[3px_3px_0px_0px_var(--shadow-ink)] hover:bg-muted",
        destructive:
          "bg-destructive text-primary-foreground",
        link: "border-transparent shadow-none p-0 h-auto text-foreground underline hover:no-underline",
      },
      size: {
        default:
          "h-10 gap-2 px-4",
        xs: "h-8 gap-2 px-3 text-xs",
        sm: "h-9 gap-2 px-3 text-xs",
        lg: "h-11 gap-2 px-5 text-sm",
        icon: "size-10 p-0",
        "icon-xs":
          "size-8 p-0",
        "icon-sm":
          "size-9 p-0",
        "icon-lg": "size-11 p-0",
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
