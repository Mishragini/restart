import { Analytics } from "./analytics";
import { LiveMarket } from "./liveMarket";
import { Settlement } from "./settlement";

export const Cards = () => {
  return (
    <div className="landing-card-section">
      <LiveMarket />
      <Settlement />
      <Analytics />
    </div>
  );
};
