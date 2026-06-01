import type { ElementType, HTMLAttributes } from "react";

type CardProps<T extends ElementType = "div"> = HTMLAttributes<HTMLElement> & {
  as?: T;
  type?: "button" | "submit" | "reset";
};

export function Card<T extends ElementType = "div">({ as, className = "", ...props }: CardProps<T>) {
  const Component = as || "div";
  return <Component className={`glass-panel rounded-lg ${className}`} {...props} />;
}
