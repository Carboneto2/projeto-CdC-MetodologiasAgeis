import React from "react";

export default function Button({ className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-2xl shadow transition hover:shadow-md disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}