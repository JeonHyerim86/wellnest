import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

const FAB_CLASS =
  "fixed bottom-26 right-[max(1.25rem,calc(50%-15rem+1.25rem))] z-30 grid size-14 place-items-center " +
  "rounded-full bg-sage-500 text-white shadow-fab transition-colors hover:bg-sage-600 active:bg-sage-700 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500";

export function Fab({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(FAB_CLASS, className)}
    >
      <Icon name="add" size={26} weight={700} />
    </button>
  );
}

export function FabLink({
  label,
  href,
  className,
}: {
  label: string;
  href: string;
  className?: string;
}) {
  return (
    <Link href={href} aria-label={label} className={cn(FAB_CLASS, className)}>
      <Icon name="add" size={26} weight={700} />
    </Link>
  );
}
