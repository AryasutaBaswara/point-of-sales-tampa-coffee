import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePricing } from "@/hooks/use-pricing";
import { Menu } from "@/validations/menu-validation";
import { convertIDR } from "../../../../../lib/utils";
import { startTransition, useActionState, useEffect, useMemo } from "react";
import { generatePayment } from "../../actions";
import { INITIAL_STATE_GENERATE_PAYMENT } from "@/constants/order-constant";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function Summary({
  order,
  orderMenu,
  id,
}: {
  order: {
    customer_name: string;
    status: string;
    tables: { name: string }[];
    payment_token: string;
  };
  orderMenu: {
    menus: Menu;
    quantity: number;
    nominal: number;
    status: string;
  }[];
  id: string;
}) {
  const { grandTotal, tax, service, totalPrice } = usePricing(orderMenu);

  const isAllServed = useMemo(() => {
    return orderMenu?.every((item) => item.status === "served");
  }, [orderMenu]);

  const [
    generatePaymentState,
    generatePaymentAction,
    isPendingGeneratePayment,
  ] = useActionState(generatePayment, INITIAL_STATE_GENERATE_PAYMENT);

  const handleGeneratePayment = () => {
    if (order?.payment_token) {
      window.snap.pay(order.payment_token);
    } else {
      const formData = new FormData();
      formData.append("id", id || "");
      formData.append("gross_amount", grandTotal.toString());
      formData.append("customer_name", order?.customer_name || "");
      startTransition(() => {
        generatePaymentAction(formData);
      });
    }
  };

  useEffect(() => {
    if (generatePaymentState?.status === "error") {
      toast.error("Generate Payment Failed", {
        description: generatePaymentState.errors?._form?.[0],
      });
    }

    if (generatePaymentState?.status === "success") {
      window.snap.pay(generatePaymentState.data.payment_token);
    }
  }, [generatePaymentState]);

  const profile = useAuthStore((state) => state.profile);

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">Customer</h3>
        {order && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={order?.customer_name} disabled />
            </div>
            {order?.tables && (
              <div className="space-y-2">
                <Label>Table</Label>
                <Input
                  value={(order?.tables as unknown as { name: string })?.name}
                  disabled
                />
              </div>
            )}
          </div>
        )}
        <Separator />
        <div className="space-y-6">
          {" "}
          {/* Saya perbesar space container utama biar lebih lega */}
          <h3 className="text-lg font-semibold">Order Summary</h3>
          {/* Bagian Rincian (Label kecil, warna agak pudar) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Price</span>
              <span className="text-muted-foreground">
                {convertIDR(totalPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span className="text-muted-foreground">{convertIDR(tax)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service Fee (5%)</span>
              <span className="text-muted-foreground">
                {convertIDR(service)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-bold">Total</span>
            <span className="text-lg font-bold text-primary">
              {convertIDR(grandTotal)}
            </span>
          </div>
          {order?.status === "process" && profile.role !== "kitchen" && (
            <Button
              type="submit"
              onClick={handleGeneratePayment}
              disabled={
                !isAllServed ||
                isPendingGeneratePayment ||
                orderMenu.length === 0
              }
              className="w-full font-semibold bg-teal-500 hover:bg-teal-600 text-light cursor-pointer"
            >
              {isPendingGeneratePayment ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Pay sire"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
