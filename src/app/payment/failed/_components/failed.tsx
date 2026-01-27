"use client";

import { Button } from "@/components/ui/button";
import { Ban, CircleX } from "lucide-react";
import Link from "next/link";

export default function Failed() {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-4">
      <CircleX className="size-15 text-red-500" />
      <h1 className="text-2xl font-bold">Payment Failed</h1>
      <Link href="/order">
        <Button>Back to Order</Button>
      </Link>
    </div>
  );
}
