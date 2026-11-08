import type { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  children?: ReactNode;
};

export function Button({ label, children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(
        "cursor-pointer rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {children ?? label}
    </button>
  );
}
