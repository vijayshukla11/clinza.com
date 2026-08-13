import React from "react";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  children,
  className = "",
  ...props
}) => {
  const Tag = `h${level}` as React.ElementType;

  const styles = {
    1: "text-4xl md:text-5xl lg:text-[64px] font-bold leading-[1.1] tracking-tight text-[#111111]",
    2: "text-3xl md:text-4xl lg:text-[48px] font-medium leading-[1.15] tracking-tight text-[#111111]",
    3: "text-2xl md:text-3xl font-semibold leading-snug tracking-tight text-[#111111]",
    4: "text-xl font-semibold leading-normal text-[#111111]",
  };

  return (
    <Tag className={`${styles[level]} ${className}`} {...props}>
      {children}
    </Tag>
  );
};

export default Heading;
