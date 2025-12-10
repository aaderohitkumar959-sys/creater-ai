import * as React from "react"
import { cn } from "@/lib/utils"

const Popover = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLDivElement>(null);

    return (
        <div className="relative inline-block text-left" ref={triggerRef}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && (child.type as any).displayName === "PopoverTrigger") {
                    return React.cloneElement(child as any, { onClick: () => setOpen(!open) });
                }
                if (React.isValidElement(child) && (child.type as any).displayName === "PopoverContent") {
                    return open ? child : null;
                }
                return child;
            })}
        </div>
    )
}

const PopoverTrigger = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "div";
    return (
        <div onClick={props.onClick} className="inline-block cursor-pointer">
            {children}
        </div>
    )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { align?: "center" | "start" | "end"; sideOffset?: number }
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2",
            "mt-2",
            className
        )}
        {...props}
    />
))
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
