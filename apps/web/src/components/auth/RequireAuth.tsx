import { Navigate, Outlet } from "react-router";
import { authClient } from "@/lib/auth-client";
import { LoadingDots } from "@/components/loaders";

export const RequireAuth = () => {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="screen-center">
        <LoadingDots />
      </div>
    );
  }
  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export const GuestOnly = () => {
  const { data: session, isPending } = authClient.useSession();

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
  return <Outlet />;
};
