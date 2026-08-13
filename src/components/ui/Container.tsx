import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className = "", ...props }) => {
  return (
    <div className={`max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 w-full ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Container;
