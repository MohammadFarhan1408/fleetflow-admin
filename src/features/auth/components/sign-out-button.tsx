"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { logout } from "../api";

export const SignOutButton = () => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const signOut = async () => {
    setPending(true);
    setFailed(false);
    try {
      await logout();
      router.replace(ROUTES.login);
      router.refresh();
    } catch (error) {
      console.error("Sign out failed", error);
      setFailed(true);
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="secondary" loading={pending} onClick={signOut}>
        <LogOutIcon />
        Sign out
      </Button>
      {failed && (
        <p role="alert" className="text-caption text-error">
          Couldn&apos;t sign out. Check your connection and try again.
        </p>
      )}
    </div>
  );
};
