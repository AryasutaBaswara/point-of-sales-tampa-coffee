"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable from "../../../../../components/common/data-table";
import { useEffect, useMemo, useState } from "react";
import DropdownAction from "@/components/common/dropdown-action";
import { Pencil, Trash2 } from "lucide-react";
import useDataTable from "@/hooks/use-data-table";
import { Profile } from "@/types/auth";
import { Table } from "@/validations/table-validation";
import { HEADER_TABLE_TABLE } from "@/constants/table-constant";
import { cn } from "@/lib/utils";
import DialogCreateTable from "./dialog-create-table";
import DialogUpdateTable from "./dialog-update-table";
import DialogDeleteTable from "./dialog-delete-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableMap from "./table-map";

export default function TableManagement() {
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
    data: tables,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tables", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const query = supabase
        .from("tables")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("created_at");

      if (currentSearch) {
        query.or(
          `name.ilike.%${currentSearch}%,capacity.ilike.%${currentSearch}%,status.ilike.%${currentSearch}%`,
        );
      }

      const result = await query;

      if (result.error)
        toast.error("Get Table data failed", {
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
    available: "bg-green-600 text-white",

    // Amber memberikan kesan "Hati-hati" atau "Sudah di-booking"
    reserved: "bg-yellow-600 text-white",

    // Rose lebih lembut di mata daripada Red yang mencolok
    unavailable: "bg-red-500 text-white",
  };

  const filteredData = useMemo(() => {
    return (tables?.data || []).map((table: Table, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        <div>
          <h4 className="font-bold">{table.name}</h4>
          <p className="text-xs">{table.description}</p>
        </div>,
        table.capacity,
        <div
          className={cn(
            "w-fit whitespace-nowrap px-2 py-1 rounded-full text-xs font-medium border capitalize",
            // Style warna kamu
            statusStyles[table.status.toLowerCase()],
          )}
        >
          {table.status}
        </div>,
        <DropdownAction
          menu={[
            {
              label: (
                <span className="flex items-center gap-2">
                  <Pencil />
                  Edit
                </span>
              ),
              action: () => {
                setSelectedAction({ data: table, type: "update" });
              },
            },
            {
              label: (
                <span className="flex items-center gap-2">
                  <Trash2 className="text-red-400" />
                  Delete
                </span>
              ),
              variant: "destructive",
              action: () => {
                setSelectedAction({
                  data: table,
                  type: "delete",
                });
              },
            },
          ]}
        />,
      ];
    });
  }, [tables]);

  const totalPages = useMemo(() => {
    return tables && tables.count !== null
      ? Math.ceil(tables.count / currentLimit)
      : 0;
  }, [tables]);

  const { data: allTable, refetch: refetchTables } = useQuery({
    queryKey: ["all-tables"],
    queryFn: async () => {
      const result = await supabase.from("tables").select("*");

      return result.data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("change-table")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tables",
        },
        () => {
          refetch();
          refetchTables();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });

  return (
    <div className="w-full">
      <Tabs defaultValue="list">
        <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
          <h1 className="text-2xl font-bold">Table Management</h1>
          <TabsList>
            <TabsTrigger value="list">Table List</TabsTrigger>
            <TabsTrigger value="map">Table Map</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="list">
          <div className="flex gap-2 justify-between mb-4">
            <Input
              placeholder="Search by name"
              className="max-w-64"
              onChange={(e) => handleChangeSearch(e.target.value)}
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Create</Button>
              </DialogTrigger>
              <DialogCreateTable refetch={refetch} />
            </Dialog>
          </div>
          <DataTable
            header={HEADER_TABLE_TABLE}
            data={filteredData}
            isLoading={isLoading}
            totalPages={totalPages}
            currentPage={currentPage}
            currentLimit={currentLimit}
            onChangePage={handleChangePage}
            onChangeLimit={handleChangeLimit}
          />
          <DialogUpdateTable
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
          />
        </TabsContent>
        <TabsContent value="map">
          <TableMap tables={allTable ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
