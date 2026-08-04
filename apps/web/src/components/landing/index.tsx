import background from "../../assets/background.png";
import { AnimatedSVG } from "./animatedSVG";
import { HeroSection } from "./HeroSection";
import { Sentiment } from "./sentiment";
import { Link } from "react-router";

const LandingPage = () => {
  return (
    <div className="relative">
      <img
        src={background}
        alt="background-image"
        className="w-full h-auto -z-30 "
      />

      <div className="absolute inset-0 bg-background/20 -z-10" />

      <AnimatedSVG className="pointer-events-none absolute inset-0 hidden sm:block" />

      <Link
        to="/login"
        className="absolute right-6 top-6 z-10 rounded-full border border-foreground/25 bg-card px-5 py-2 text-sm font-semibold uppercase tracking-wide text-foreground/80 backdrop-blur-sm transition-colors hover:border-foreground/50 hover:text-foreground md:right-10 md:top-8"
      >
        Login
      </Link>

      <main className="absolute inset-0 z-0 p-6  md:px-10 md:py-24">
        <HeroSection />
        <Sentiment />
      </main>
    </div>
  );
};

export default LandingPage;
