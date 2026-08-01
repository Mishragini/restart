import { cn } from "@/lib/utils";
import { Logo } from "../logo";
import { Button } from "../ui/button";

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const HeroSection = ({ className, ...props }: HeroSectionProps) => {
  return (
    <section
      className={cn(
        "w-full flex  flex-col items-center justify-center overflow-hidden text-center ",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_35%,rgba(255,255,255,0.06),transparent_70%)] "
      />

      <div className="relative flex w-full max-w-3xl flex-col items-center">
        <Logo className="text-xl md:text-5xl" />

        <h1 className="mt-10 text-balance text-4xl md:font-extrabold leading-[1.05] tracking-tight text-white  md:text-6xl lg:text-7xl font-medium">
          Your opinion is
          <br />
          now an asset.
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base text-white/60 md:text-lg">
          Trade on the outcome of real-world events. Simple. Real-time.
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col items-center gap-4 sm:w-auto sm:flex-row sm:justify-center">
          <Button className="h-10 min-w-32 w-full rounded-full bg-mint hover:bg-mint px-4 text-base font-bold uppercase tracking-wide text-[#0f1115] shadow-[0_0_35px_rgba(143,227,182,0.45)] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-offset-2 focus-visible:outline-[#8fe3b6] active:scale-[0.98] sm:w-auto md:h-16 md:min-w-56 md:px-10 md:text-2xl ">
            Trade Yes
          </Button>

          <Button className="card-bg h-10 min-w-32 w-full rounded-full border-2 border-peach px-4 text-base font-bold uppercase tracking-wide text-[#eda874] shadow-[0_0_28px_rgba(237,168,116,0.35)] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-offset-2 focus-visible:outline-[#eda874] active:scale-[0.98] sm:w-auto md:h-16 md:min-w-56 md:px-10 md:text-2xl ">
            Trade No
          </Button>
        </div>
      </div>
    </section>
  );
};
