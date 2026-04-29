import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-clip-padding text-sm font-black uppercase tracking-wider whitespace-nowrap transition-[transform,box-shadow,background-color,color] outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/50 active:translate-y-1 active:translate-x-1 disabled:pointer-events-none disabled:opacity-50 shadow-[8px_8px_0px_0px_var(--color-border)] hover:shadow-[12px_12px_0px_0px_var(--color-border)] hover:-translate-y-1 hover:-translate-x-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline:
          "bg-background text-foreground hover:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground",
        ghost:
          "border-transparent shadow-none hover:border-border hover:shadow-[8px_8px_0px_0px_var(--color-border)] hover:bg-muted",
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
