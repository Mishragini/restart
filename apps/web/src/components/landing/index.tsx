import { AnimatedSVG } from "./animatedSVG";
import { HeroSection } from "./HeroSection";
import { Sentiment } from "./sentiment";
import { Link } from "react-router";

const LandingPage = () => {
  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-background">
      <AnimatedSVG className="pointer-events-none absolute inset-0 -z-10 hidden md:block" />

      <Link
        to="/login"
        className="absolute right-6 top-6 z-10 rounded-full border border-foreground/25 bg-card px-5 py-2 text-sm font-semibold uppercase tracking-wide text-foreground/80 backdrop-blur-sm transition-colors hover:border-foreground/50 hover:text-foreground md:right-10 md:top-8"
      >
        Login
      </Link>

      <main className="relative  px-10 py-24">
        <HeroSection />
        <Sentiment />
      </main>
    </div>
  );
};

export default LandingPage;
