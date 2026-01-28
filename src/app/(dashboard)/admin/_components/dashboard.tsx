"use client";

import LineCharts from "@/components/common/line-chart";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const supabase = createClient();
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 27);
  lastMonth.setHours(0, 0, 0, 0);

  const {
    data: orders,
    isLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders-per-day"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("created_at")
        .gte("created_at", lastMonth.toISOString())
        .order("created_at");

      const counts: Record<string, number> = {};

      (data ?? []).forEach((order) => {
        const date = new Date(order.created_at).toISOString().slice(0, 10);
        counts[date] = (counts[date] || 0) + 1;
      });

      return Object.entries(counts).map(([name, total]) => ({ name, total }));
    },
  });
  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Order Create Per Month</CardTitle>
          <CardDescription>
            Showing orders from {/* 👇 Bungkus tanggal pakai span ini */}
            <span suppressHydrationWarning>
              {lastMonth.toLocaleDateString()}
            </span>{" "}
            to{" "}
            <span suppressHydrationWarning>
              {new Date().toLocaleDateString()}
            </span>
          </CardDescription>
        </CardHeader>
        <div className="w-full h-64 p-6">
          <LineCharts data={orders} />
        </div>
      </Card>
    </div>
  );
}
