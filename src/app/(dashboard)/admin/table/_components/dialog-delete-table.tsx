import DialogDelete from "@/components/common/dialog-delete";
import { startTransition, useActionState, useEffect } from "react";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { toast } from "sonner";
import { deleteTable } from "../actions";
import { Table } from "@/validations/table-validation";

export default function DialogDeleteTable({
  open,
  refetch,
  currentData,
  handleChangeAction,
}: {
  open: boolean;
  refetch: () => void;
  currentData?: Table;
  handleChangeAction: (open: boolean) => void;
}) {
  const [deleteTableState, deleteTableAction, isPendingDeleteTable] =
    useActionState(deleteTable, INITIAL_STATE_ACTION);

  const onSubmit = () => {
    const formData = new FormData();
    formData.append("id", currentData!.id as string);
    startTransition(() => {
      deleteTableAction(formData);
    });
  };

  useEffect(() => {
    if (deleteTableState?.status === "error") {
      toast.error("Delete Table Failed", {
        description: deleteTableState.errors?._form?.[0],
      });
    }

    if (deleteTableState?.status === "success") {
      toast.success("Delete Table Success");
      handleChangeAction?.(false);
      refetch();
    }
  }, [deleteTableState]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      isLoading={isPendingDeleteTable}
      onSubmit={onSubmit}
      title="Table"
    />
  );
}
