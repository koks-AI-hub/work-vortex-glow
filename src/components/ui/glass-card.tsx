
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  hoverEffect = false,
  ...props 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel p-6", 
        hoverEffect && "transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:scale-[1.01]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
