import React, { ReactNode, CSSProperties } from "react";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md"; 
  variant?: "primary" | "outline";
  color?: "primary" | "info" | "success" | "warning" | "secondary" | "dark" | "error";
  startIcon?: ReactNode; 
  endIcon?: ReactNode; 
  onClick?: () => void; 
  disabled?: boolean; 
  className?: string;
  style?: CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button", // ✅ Default type
  size = "md",
  variant = "primary",
  color = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  style,
}) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
  };

  const variantClasses: Record<string, string> = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    info: "bg-sky-500 text-white hover:bg-sky-600",
    success: "bg-green-500 text-white hover:bg-green-600",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600",
    error: "bg-red-500 text-white hover:bg-red-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
  };

  return (
    <button
      type={type}
      style={style}
      className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition 
        ${sizeClasses[size]} 
        ${variant === "outline" ? variantClasses["outline"] : variantClasses[color]} 
        ${disabled ? "cursor-not-allowed opacity-50" : ""} 
        ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
