import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

export function useAuthErrorFromSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const error = searchParams.get("error");
    if (error) {
      console.error(error);
      toast.error(error.replace(/_+/g, " "));
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [mounted]);
}
