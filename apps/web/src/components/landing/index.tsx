import { authClient } from "@/lib/auth-client";
import background from "../../assets/background.png";
import { AnimatedSVG } from "./animatedSVG";
import { HeroSection } from "./HeroSection";
import { Sentiment } from "./sentiment";
import { Link, Navigate } from "react-router";
import { LoadingDots } from "../loaders";

const LandingPage = () => {
  const {
    data: session,
    isPending, //loading state
  } = authClient.useSession();

  if (isPending) {
    return (
      <div className="screen-center">
        <LoadingDots />
      </div>
    );
  }
  if (session?.user) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="relative w-full">
      {/*
        background.png is 873x1802 — portrait. Sizing it with `w-full h-auto`
        made the artwork drive the layout, so the section got *taller* as the
        viewport got wider (~4100px at 2000px wide) and left a screen of dead
        space under the hero. The image is a covering layer now and the content
        sets the height, which crops the bottom of the artwork on md+.
      */}
      {/*
        Cropping the artwork leaves a hard horizontal edge wherever the section
        ends, with the neon runs sheared off mid-stroke. Masking the whole
        artwork layer — image, tint and runs together — dissolves it into the
        page background instead, so the crop has no seam to notice and the gap
        before Sentiment reads as breathing room rather than a cut.
      */}
      <section className="relative w-full overflow-hidden aspect-[873/1802] md:aspect-auto md:min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 [-webkit-mask-image:linear-gradient(to_bottom,#000_55%,transparent_97%)] [mask-image:linear-gradient(to_bottom,#000_55%,transparent_97%)]">
          <img
            src={background}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-top"
          />

          <div className="absolute inset-0 bg-background/20" />

          <AnimatedSVG className="absolute inset-0 h-full w-full hidden sm:block" />
        </div>

        <Link
          to="/login"
          className="absolute right-6 top-6 z-10 rounded-full border border-foreground/25 bg-card px-5 py-2 text-sm font-semibold uppercase tracking-wide text-foreground/80 backdrop-blur-sm transition-colors hover:border-foreground/50 hover:text-foreground md:right-10 md:top-8"
        >
          Login
        </Link>

        <main className="relative flex min-h-full flex-col justify-center p-6 md:px-10 md:py-24">
          <HeroSection />
        </main>
      </section>

      <Sentiment />
    </div>
  );
};

export default LandingPage;
