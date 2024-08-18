"use client";

import { checkAuthStatus } from "@/actions/auth.actions";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const { data } = useQuery({
    queryKey: ["authCheck"],
    queryFn: () => checkAuthStatus(),
  });

  const router = useRouter();

  if (data?.success) router.push("/");

  return (
    <>
      <ShootingStars />
      <StarsBackground />
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="flex flex-col gap-2 items-center">
          <Loader className="w-10 h-10 animate-spin text-muted-foreground" />
          <h3 className="text-xl font-bold">
            Redirecting<span className="dot1">.</span>
            <span className="dot2">.</span>
            <span className="dot3">.</span>
          </h3>
          <p>Please wait</p>
        </div>
      </div>
    </>
  );
}
