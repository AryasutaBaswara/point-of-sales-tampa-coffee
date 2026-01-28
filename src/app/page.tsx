"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import Image from "next/image";
import { DarkmodeToggle } from "../components/common/darkmode-toggle";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

export default function Home() {
  const profile = useAuthStore((state) => state.profile);
  return (
    <div className="bg-muted flex flex-col justify-center items-center h-screen space-y-4">
      <h1 className="text-4xl font-semibold">Welcome {profile.name}</h1>
      <Link
        href={
          profile.role === "kitchen" || profile.role === "cashier"
            ? "/order"
            : "/admin"
        }
      >
        <Button className="bg-teal-500 hover:bg-teal-600 text-white">
          Access Dashboard
        </Button>
      </Link>
    </div>
  );
}
