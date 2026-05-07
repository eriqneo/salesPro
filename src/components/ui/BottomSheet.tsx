import * as React from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className
}: BottomSheetProps) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className={cn("max-h-[90vh]", className)}>
        <DrawerHeader className={cn("text-left border-b border-border pb-4", !(title || description) && "sr-only")}>
          <DrawerTitle className="text-lg font-black tracking-tight text-text-primary">
            {title || "Navigation Menu"}
          </DrawerTitle>
          {description && <DrawerDescription className="text-xs text-text-secondary font-medium">{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="overflow-y-auto px-4 py-2">
          {children}
        </div>
        {footer && (
          <DrawerFooter className="border-t border-border mt-2">
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
