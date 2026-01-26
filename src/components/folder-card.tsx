import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils"; // Your path to shadcn's cn utility

// Defines the variants for the card's color scheme
const folderCardVariants = cva(
  "relative overflow-hidden flex flex-col justify-between rounded-md border p-4 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        high: "bg-gradient-to-br from-red-300/50 to-red-300/10 dark:from-red-950/100 dark:to-red-950/200 border-red-300/30 dark:border-purple-950/40",
        medium: "bg-gradient-to-b from-emerald-300/50 to-emerald-300/10 dark:from-emerald-950/100 dark:to-emerald-950/200 border-emerald-300/30 dark:border-emerald-950/40",
        low: "bg-gradient-to-b from-blue-300/50 to-blue-300/10 dark:from-cyan-950/100 dark:to-cyan-950/200 border-blue-300/30 dark:border-cyan-950/40",
      },
    },
    defaultVariants: {
      variant: "low",
    },
  }
);

// Defines the props for the FolderCard component
export interface FolderCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof folderCardVariants> {
  /** The icon to be displayed in the card. */
  icon: React.ReactNode;
  /** The title or name of the folder. */
  title: string;
  /** The size of the folder, e.g., "25 MB". */
  size: string;
}

const FolderCard = React.forwardRef<HTMLDivElement, FolderCardProps>(
  ({ className, variant, icon, title, size, ...props }, ref) => {
    
    // Animation properties for framer-motion
    const cardAnimation = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: "easeOut" },
      whileHover: { scale: 1.03, y: -4, transition: { duration: 0.2 } },
    };

    return (
      <motion.div
        className={cn(folderCardVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        {/* Icon container */}
        <div className="mb-6">
          {icon}
        </div>
        
        {/* Text content container */}
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-card-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {size}
          </p>
        </div>
      </motion.div>
    );
  }
);
FolderCard.displayName = "FolderCard";

export { FolderCard };