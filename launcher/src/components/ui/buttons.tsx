import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: ReactNode;
  icon?: ReactNode;
  size?: "md" | "lg";
};

export function PrimaryButton({ children, icon, size = "md", className, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`btn btn-primary${size === "lg" ? " btn-lg" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
}

export function SecondaryButton({ children, icon, size = "md", className, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`btn btn-secondary${size === "lg" ? " btn-lg" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
}
