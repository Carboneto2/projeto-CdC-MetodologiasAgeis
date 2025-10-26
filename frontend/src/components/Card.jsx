import React from "react";

export default function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow p-5 ${className}`}>
      {(title || right || subtitle) && (
        <div className="mb-4 flex items-start gap-3 justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}