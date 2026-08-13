import React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ children, className = "", ...props }) => {
  return (
    <section className={`py-12 md:py-18 lg:py-24 ${className}`} {...props}>
      {children}
    </section>
  );
};

export default Section;
