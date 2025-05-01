import React, { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={`bg-white rounded-lg shadow p-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={`mb-4 flex items-center justify-between ${className}`}
    {...props}
  >
    {children}
  </div>
);

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = "",
  ...props
}) => (
  <h3 className={`text-lg font-semibold ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`mt-2 ${className}`} {...props}>
    {children}
  </div>
);
