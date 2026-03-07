"use client";

import { useRef, useEffect } from "react";

interface ProgressBarProps {
  value: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Thin client wrapper that sets a dynamic width via CSS custom property,
 * avoiding inline `style` props on the element.
 */
export function ProgressBar({
  value,
  className = "",
  children,
}: ProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.style.setProperty("--progress", value);
  }, [value]);

  return (
    <div ref={ref} className={`w-progress ${className}`}>
      {children}
    </div>
  );
}
