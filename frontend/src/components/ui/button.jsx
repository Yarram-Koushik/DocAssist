import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const buttonVariants = {
  default: "bg-primary text-white hover:bg-primary-dark",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  outline: "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
  ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
};

export const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={twMerge(clsx("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50", buttonVariants[variant], buttonSizes[size], className))}
      {...props}
    />
  );
});
Button.displayName = "Button";
