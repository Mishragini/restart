import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { signOut } from "@/lib/utils";
import { BalanceWallet } from "./balanceWallet";

const getInitials = (name?: string | null) => {
  const first = name?.trim()?.[0];
  return first ? first.toUpperCase() : "?";
};

export const Navbar = () => {
  const { data: session } = authClient.useSession();
  const [imageFailed, setImageFailed] = useState(false);
  const image = session?.user?.image;

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  const showImage = Boolean(image) && !imageFailed;

  return (
    <nav className="navbar">
      <Logo className="text-lg md:text-xl" />
      <div className="navbar-actions">
        <BalanceWallet />
        <Button
          onClick={async () => {
            await signOut();
          }}
          className="navbar-btn bg-card peach-btn hover:bg-transparent"
        >
          Logout
        </Button>
        {showImage ? (
          <img
            src={image!}
            alt={session?.user?.name ?? "profile"}
            className="navbar-avatar"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="navbar-avatar navbar-avatar-initials" aria-hidden>
            {getInitials(session?.user?.name)}
          </span>
        )}
      </div>
    </nav>
  );
};
