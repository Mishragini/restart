import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { signOut } from "@/lib/utils";

export const Navbar = () => {
  const navigate = useNavigate();
  const {
    data: session,
    isPending, //loading state
  } = authClient.useSession();
  return (
    <nav className="navbar">
      <Logo className="text-lg md:text-xl" />
      {isPending ? null : session ? (
        <div className="navbar-actions">
          <Button
            onClick={async () => {
              await signOut();
            }}
            className="navbar-btn bg-card peach-btn hover:bg-transparent"
          >
            Logout
          </Button>
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt="pfp"
              className="navbar-avatar"
            />
          )}
        </div>
      ) : (
        <Button
          onClick={() => navigate("/login")}
          className="navbar-btn"
        >
          Login
        </Button>
      )}
    </nav>
  );
};
