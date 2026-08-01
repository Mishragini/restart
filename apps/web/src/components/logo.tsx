import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Logo = ({ className, ...props }: LogoProps) => {
  return (
    <div
      className={cn(
        "inline-flex select-none items-center gap-[0.3em] font-semibold uppercase tracking-[0.2em] text-white",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="inline-block h-[0.68em] w-[0.68em] rounded-full border-[0.11em] border-current"
      />
      <span>Pinio</span>
    </div>
  );
};
