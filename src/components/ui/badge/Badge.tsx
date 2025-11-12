import React, { CSSProperties } from "react";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant; // Light or solid variant
  size?: BadgeSize; // Badge size
  color?: BadgeColor; // Badge color
  startIcon?: React.ReactNode; // Icon at the start
  endIcon?: React.ReactNode; // Icon at the end
  children: React.ReactNode; // Badge content
  style?: CSSProperties; // Inline custom styles
  className?: string; // Additional classes
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
  style,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-1 font-medium rounded-full transition";

  // Size classes
  const sizeClasses: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  // Color variants
  const variantClasses: Record<BadgeVariant, Record<BadgeColor, string>> = {
    light: {
      primary:
        "bg-blue-100 text-blue-700 dark:bg-blue-700/15 dark:text-blue-400",
      success:
        "bg-green-100 text-green-700 dark:bg-green-700/15 dark:text-green-400",
      error: "bg-red-100 text-red-700 dark:bg-red-700/15 dark:text-red-400",
      warning:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/15 dark:text-yellow-400",
      info: "bg-sky-100 text-sky-700 dark:bg-sky-700/15 dark:text-sky-400",
      light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
      dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
    },
    solid: {
      primary: "bg-blue-700 text-white dark:text-white",
      success: "bg-green-700 text-white dark:text-white",
      error: "bg-red-700 text-white dark:text-white",
      warning: "bg-yellow-700 text-white dark:text-white",
      info: "bg-sky-700 text-white dark:text-white",
      light: "bg-gray-400 text-white dark:bg-white/5 dark:text-white/80",
      dark: "bg-gray-800 text-white dark:text-white",
    },
  };

  const sizeClass = sizeClasses[size];
  const colorClass = variantClasses[variant][color];

  return (
    <span
      className={`${baseStyles} ${sizeClass} ${colorClass} ${className}`}
      style={style}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </span>
  );
};

export default Badge;
