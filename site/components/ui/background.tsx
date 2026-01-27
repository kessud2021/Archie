"use client";

import Image from "next/image";
import { cn } from "~/lib/util";
import General from "~/public/backgrounds/general.png";

export function Background({
  background = "general",
  className,
  mask,
}: {
  background?: "general";
  className?: string;
  mask?: string;
}) {
  return (
    <div className={cn("absolute w-full pointer-events-none -z-50", className)}>
      <Image src={General} alt="" fill={true} className="object-cover object-top" style={{ mask }} priority />
      <div className="relative w-full h-full backdrop-blur-sm" />
    </div>
  );
}
