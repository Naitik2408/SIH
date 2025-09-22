import * as React from "react"

import { cn } from "@/lib/utils"

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
