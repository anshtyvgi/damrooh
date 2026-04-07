"use client";

interface CardProps {
  children: React.ReactNode;
  variant?: "solid" | "glass";
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, variant = "solid", className = "", hover = false, onClick }: CardProps) {
  const base =
    variant === "glass"
      ? "glass"
      : "card-elevated rounded-3xl";

  return (
    <div
      onClick={onClick}
      className={`
        rounded-3xl p-6
        ${base}
        ${hover ? "hover:scale-[1.01] hover:-translate-y-0.5 transition-transform" : ""}
        ${onClick ? "cursor-pointer active:scale-[0.99]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
