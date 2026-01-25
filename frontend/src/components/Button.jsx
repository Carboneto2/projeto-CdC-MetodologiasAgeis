import React from "react";

export default function Button({
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "px-4 py-2 rounded-xl font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-ifverde text-white hover:bg-ifverdeclaro",
    danger: "bg-ifvermelho text-white hover:brightness-90",
    outline:
      "border border-ifverde text-ifverde hover:bg-ifverdeclaro hover:text-white",
    ghost: "text-ifverde hover:bg-ifverdeclaro/20",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
