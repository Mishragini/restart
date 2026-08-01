import background from "../../assets/background.png";
import { AnimatedSVG } from "./animatedSVG";
import { HeroSection } from "./HeroSection";
import { Sentiment } from "./sentiment";

const LandingPage = () => {
  return (
    <div className="relative">
      <img
        src={background}
        alt="background-image"
        className="w-full h-auto -z-30 "
      />

      <div className="absolute inset-0 bg-black/20 -z-10" />

      <AnimatedSVG className="pointer-events-none absolute inset-0 hidden sm:block" />

      <main className="absolute inset-0 z-0 p-6 text-white md:px-10 md:py-24">
        <HeroSection />
        <Sentiment />
      </main>
    </div>
  );
};

export default LandingPage;
