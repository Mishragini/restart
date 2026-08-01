import { Cards } from "./cards";
import { Graph } from "./cards/Graph";

export const Sentiment = () => {
  return (
    <div className="w-full py-10 sm:py-50 md:pt-200 md:pb-0 gap-8 flex flex-col justify-center items-center text-center">
      <p className="text-2xl md:text-5xl font-light sm:py-12">
        Sentiment Tracker
      </p>
      <Cards />
      <Graph />
    </div>
  );
};
