import React from "react";

export default function Tag({ children }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
      {children}
    </span>
  );
}