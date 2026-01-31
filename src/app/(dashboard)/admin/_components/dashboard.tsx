"use client";

import LineCharts from "@/components/common/line-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function Dashboard() {
  const supabase = createClient();
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 6);
  lastWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfLastMonth = new Date(startOfMonth);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

  const endOfLastMonth = new Date(startOfMonth);
  endOfLastMonth.setMilliseconds(-1);

  const thisMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  ).toISOString();

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
        .eq("status", "settled")
        .gte("created_at", lastWeek.toISOString())
        .order("created_at");

      const counts: Record<string, number> = {};

      (data ?? []).forEach((order) => {
        const date = new Date(order.created_at).toISOString().slice(0, 10);
        counts[date] = (counts[date] || 0) + 1;
      });

      return Object.entries(counts).map(([name, total]) => ({ name, total }));
    },
  });

  const { data: monthlyOrders } = useQuery({
    queryKey: ["monthly-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id")
        .eq("status", "settled")
        .gte("created_at", startOfMonth.toISOString());

      return data ?? [];
    },
  });

  const totalOrdersMonth = monthlyOrders?.length ?? 0;

  const { data: monthlyRevenue } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders_menus")
        .select("quantity, menus (price), orders(created_at)")
        .gte("orders.created_at", startOfMonth.toISOString());

      return data ?? [];
    },
  });

  let subtotal = 0;
  (monthlyRevenue || []).forEach((item) => {
    const prc = (item.menus as unknown as { price: number }).price || 0;
    const qty = item?.quantity || 0;
    subtotal += prc * qty;
  });

  const tax = subtotal * 0.1;
  const service = subtotal * 0.05;
  const totalMonthlyRevenue = subtotal + tax + service;

  const { data: ordersPerDay } = useQuery({
    queryKey: ["orders-per-day-monthly"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("created_at")
        .eq("status", "settled")
        .gte("created_at", startOfMonth.toISOString())
        .order("created_at");

      const counts: Record<string, number> = {};

      (data ?? []).forEach((order) => {
        const date = new Date(order.created_at).toISOString().slice(0, 10);
        counts[date] = (counts[date] || 0) + 1;
      });

      return Object.entries(counts).map(([name, total]) => ({ name, total }));
    },
  });

  const transactionDays = ordersPerDay?.length ?? 0;

  const averageRevenueMonthly =
    transactionDays > 0 ? totalMonthlyRevenue / transactionDays : 0;

  const { data: lastMonthRevenue } = useQuery({
    queryKey: ["lasth-month-revenue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders_menus")
        .select("quantity, menus (price)")
        .gte("orders_menus.created_at", startOfLastMonth.toISOString())
        .lte("orders_menus.created_at", endOfLastMonth.toISOString());

      return data ?? [];
    },
  });

  let totalLastMonth = 0;
  (lastMonthRevenue || []).forEach((item) => {
    const prc = (item.menus as unknown as { price: number }).price || 0;
    const qty = item?.quantity || 0;
    totalLastMonth += prc * qty;
  });

  const LMtax = totalLastMonth * 0.1;
  const LMservice = totalLastMonth * 0.05;
  const totalLMRevenue = totalLastMonth + LMtax + LMservice;

  const growthRate =
    totalLMRevenue > 0
      ? ((totalMonthlyRevenue - totalLMRevenue) / totalLMRevenue) * 100
      : 0;

  const { data: lastOrder } = useQuery({
    queryKey: ["last-order"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_id, customer_name, status, tables (id, name)")
        .eq("status", "process")
        .limit(3)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {convertIDR(totalMonthlyRevenue)}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              *Revenue This Month
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total orders</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {totalOrdersMonth}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">*This Month</div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Average Revenue</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {convertIDR(averageRevenueMonthly)}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">*Per Day</div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Growth Rate</CardDescription>
            <CardTitle className="text-2xl font-bold">{growthRate}</CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              *Compare to last month
            </div>
          </CardFooter>
        </Card>
        {/* <Card>
          <CardHeader>
            <CardDescription>debug</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {thisMonth}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              *Compare to last month
            </div>
          </CardFooter>
        </Card> */}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Order Create Per Week</CardTitle>
          <CardDescription>
            Showing orders from {/* 👇 Bungkus tanggal pakai span ini */}
            <span suppressHydrationWarning>
              {lastWeek.toLocaleDateString()}
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
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Active Orders</CardTitle>
          <CardDescription>Orders currently being processed</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-6 py-3 text-left font-semibold text-foreground">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">
                  Customer
                </th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">
                  Table
                </th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody>
              {lastOrder && lastOrder.length > 0 ? (
                lastOrder?.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-muted/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-muted-foreground">
                      {order.order_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {(order.tables as unknown as { name: string }).name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/order/${order.order_id}`}
                        className="hover:text-gray-300 transition duration-500"
                      >
                        Click Here
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No active orders at the moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
