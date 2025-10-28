import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-zinc-950 dark:[&>svg]:text-zinc-50",
  {
    variants: {
      variant: {
        default: "bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50",
        destructive:
          "border-red-500/50 text-red-600 dark:border-red-500 [&>svg]:text-red-600 dark:text-red-400 dark:[&>svg]:text-red-400 bg-red-50 dark:bg-red-950/20",
        warning:
          "border-amber-500/50 text-amber-900 dark:border-amber-500 [&>svg]:text-amber-900 dark:text-amber-400 dark:[&>svg]:text-amber-400 bg-amber-50 dark:bg-amber-950/20",
        success:
          "border-green-500/50 text-green-900 dark:border-green-500 [&>svg]:text-green-900 dark:text-green-400 dark:[&>svg]:text-green-400 bg-green-50 dark:bg-green-950/20",
        info:
          "border-blue-500/50 text-blue-900 dark:border-blue-500 [&>svg]:text-blue-900 dark:text-blue-400 dark:[&>svg]:text-blue-400 bg-blue-50 dark:bg-blue-950/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
