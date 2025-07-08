import React from "react";

export default function Logo({ size = 48 }: { size?: number }) {
  return (
    <span
      className="tracking-tight select-none font-brand bg-gradient-to-r from-primary-600 to-slate-700 bg-clip-text text-transparent"
      style={{
        fontWeight: 700,
        letterSpacing: "-0.04em",
        fontSize: size ? size * 0.5 : 24,
        textTransform: "lowercase",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      rolevate
    </span>
  );
}
