import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-sans text-xs font-bold uppercase tracking-[0.15em] px-8 py-4 rounded-[10px] transition-all duration-250 ease-in-out cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#111111] text-white hover:bg-black hover:shadow-lg border border-[#111111]",
    secondary: "bg-white text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-white",
    outline: "bg-transparent text-[#111111] border border-[#ECECEC] hover:border-[#111111]",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
