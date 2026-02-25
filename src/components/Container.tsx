import React from "react";

export function Container({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["mx-auto w-full max-w-6xl px-4", className].join(" ")} {...props} />;
}
