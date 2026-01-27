import { cn } from "~/lib/util";

const dividerVariants = {
  white: "bg-white/50",
  black: "bg-black/50",
};

const dividerOrientation = {
  horizontal: "w-full h-[2px]",
  vertical: "w-[2px] h-full",
};

export function Divider({
  className,
  variant = "white",
  orientation = "horizontal",
}: {
  className?: string;
  variant?: keyof typeof dividerVariants;
  orientation?: keyof typeof dividerOrientation;
}) {
  return <div className={cn(`${dividerOrientation[orientation]} ${dividerVariants[variant]}`, className)} />;
}
