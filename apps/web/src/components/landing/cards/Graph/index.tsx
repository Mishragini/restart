import { GraphSVG } from "./graphSVG";

export const Graph = () => {
  return (
    <div className="card-bg landing-card landing-graph-card">
      <div className="flex items-center gap-4">
        <p className="card-bg landing-card-heading  py-2! px-4! rounded-full! hover:none!">
          POLITICS
        </p>
        <p className="landing-card-heading">TECH</p>
        <p className="landing-card-heading">SPORTS</p>
      </div>
      <GraphSVG />
    </div>
  );
};
