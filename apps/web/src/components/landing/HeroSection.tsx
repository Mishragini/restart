import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { Logo } from "../logo";
import { Button } from "../ui/button";

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const HeroSection = ({ className, ...props }: HeroSectionProps) => {
  const navigate = useNavigate();
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

        <h1 className="mt-10 text-balance text-4xl md:font-extrabold leading-[1.05] tracking-tight  md:text-6xl lg:text-7xl font-medium">
          Your opinion is
          <br />
          now an asset.
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base text-white/60 md:text-lg">
          Trade on the outcome of real-world events. Simple. Real-time.
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col items-center gap-4 sm:w-auto sm:flex-row sm:justify-center">
          <Button
            onClick={() => navigate("/login")}
            className="h-10 min-w-32 w-full  px-4 text-base font-bold uppercase tracking-wide  sm:w-auto md:h-16 md:min-w-56 md:px-10 md:text-2xl mint-btn"
          >
            Trade Yes
          </Button>

          <Button
            onClick={() => navigate("/login")}
            className="card-bg peach-btn text-base font-bold uppercase tracking-wide h-10 min-w-32 w-full sm:w-auto md:h-16 md:min-w-56 md:px-10 md:text-2xl "
          >
            Trade No
          </Button>
        </div>
      </div>
    </section>
  );
};
