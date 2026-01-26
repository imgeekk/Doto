import { twMerge } from "tailwind-merge";

export default function ModifiedClassicLoader({ className }: { className?: string }) {
  const classes = twMerge(
    "h-6 w-6 animate-spin rounded-full border-t-2 border-b-2 ease-linear border-zinc-900",
    className
  );

  return <div className={classes}></div>;
}
