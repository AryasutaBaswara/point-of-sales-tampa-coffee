import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TableForm, tableFormSchema } from "@/validations/table-validation";
import { INITIAL_STATE_TABLE, INITIAL_TABLE } from "@/constants/table-constant";
import FormTable from "./form-table";
import { createTable } from "../action";

export default function DialogCreateTable({
  refetch,
}: {
  refetch: () => void;
}) {
  const form = useForm<TableForm>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: INITIAL_TABLE,
  });

  const [createTableState, createTableAction, isPendingCreateTable] =
    useActionState(createTable, INITIAL_STATE_TABLE);

  // const [preview, setPreview] = useState<Preview | undefined>(undefined);

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    startTransition(() => {
      createTableAction(formData);
    });
  });

  useEffect(() => {
    if (createTableState?.status === "error") {
      toast.error("Create Table Failed", {
        description: createTableState.errors?._form?.[0],
      });
    }

    if (createTableState?.status === "success") {
      toast.success("Create Table Success");
      form.reset();
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
    }
  }, [createTableState]);

  return (
    <FormTable
      form={form}
      onSubmit={onSubmit}
      isLoading={isPendingCreateTable}
      type="Create"
    />
  );
}
