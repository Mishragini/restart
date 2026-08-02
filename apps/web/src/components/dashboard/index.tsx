import { authClient } from "@/lib/auth-client";
import { LoadingDots } from "../loaders";
import empty from "../../assets/empty.svg";
import { CreateMarketDialog } from "./createMarketDialog";

const Dashboard = () => {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) {
    return (
      <div className="screen-center">
        <LoadingDots />
      </div>
    );
  }
  return (
    <div className="w-full h-full p-4">
      {session?.user.role === "ADMIN" && (
        <div className="w-full flex justify-end p-4">
          <CreateMarketDialog />
        </div>
      )}
      <div className="screen-center flex-col gap-10">
        <img src={empty} className="h-50 w-50 sm:w-100 sm:h-100" />
        <p className="heading">No Markets yet</p>
        <CreateMarketDialog triggerClassName="min-w-md text-xl font-semibold py-6! sm:py-8!" />
      </div>
    </div>
  );
};

export default Dashboard;
