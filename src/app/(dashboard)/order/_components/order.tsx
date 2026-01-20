"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import DropdownAction from "@/components/common/dropdown-action";
import { Pencil, Trash2 } from "lucide-react";
import useDataTable from "@/hooks/use-data-table";
import { Table } from "@/validations/table-validation";
import { HEADER_TABLE_TABLE } from "@/constants/table-constant";
import { cn } from "@/lib/utils";
import DataTable from "@/components/common/data-table";
import { HEADER_TABLE_ORDER } from "@/constants/order-constant";

export default function OrderManagement() {
  const supabase = createClient();
  const {
    currentPage,
    handleChangePage,
    currentLimit,
    handleChangeLimit,
    currentSearch,
    handleChangeSearch,
  } = useDataTable();
  const {
    data: orders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["orders", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const query = supabase
        .from("orders")
        .select(
          `id, order_id, customer_name, status, payment_url, tables (name, id)`,
          { count: "exact" }
        )
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("created_at");

      if (currentSearch) {
        query.or(
          `order_id.ilike.%${currentSearch}%,customer_name.ilike.%${currentSearch}%`
        );
      }

      const result = await query;

      if (result.error)
        toast.error("Get Order data failed", {
          description: result.error.message,
        });

      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    data: Table;
    type: "update" | "delete";
  } | null>(null);

  const handleChangeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  const statusStyles: Record<string, string> = {
    settled: "bg-lime-600 text-white",

    // Amber memberikan kesan "Hati-hati" atau "Sudah di-booking"
    process: "bg-sky-600 text-white",
    reserved: "bg-amber-600 text-white",

    // Rose lebih lembut di mata daripada Red yang mencolok
    canceled: "bg-red-500 text-white",
  };

  const filteredData = useMemo(() => {
    return (orders?.data || []).map((order, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        order.order_id,
        order.customer_name,
        (order.tables as unknown as { name: string }).name,
        <div
          className={cn(
            "w-fit whitespace-nowrap px-2 py-1 rounded-full text-xs font-medium border capitalize",
            // Style warna kamu
            statusStyles[order.status.toLowerCase()]
          )}
        >
          {order.status}
        </div>,
        <DropdownAction menu={[]} />,
      ];
    });
  }, [orders]);

  const totalPages = useMemo(() => {
    return orders && orders.count !== null
      ? Math.ceil(orders.count / currentLimit)
      : 0;
  }, [orders]);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Table Management</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search by name"
            onChange={(e) => handleChangeSearch(e.target.value)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Create</Button>
            </DialogTrigger>
            {/* <DialogCreateTable refetch={refetch} /> */}
          </Dialog>
        </div>
      </div>
      <DataTable
        header={HEADER_TABLE_ORDER}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />
      {/* <DialogUpdateTable
        refetch={refetch}
        currentData={selectedAction?.data as Table}
        open={selectedAction?.type === "update"}
        handleChangeAction={handleChangeAction}
      />
      <DialogDeleteTable
        open={selectedAction?.type === "delete"}
        refetch={refetch}
        currentData={selectedAction?.data as Table}
        handleChangeAction={handleChangeAction}
      /> */}
    </div>
  );
}
