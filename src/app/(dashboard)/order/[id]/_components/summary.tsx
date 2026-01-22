import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePricing } from "@/hooks/use-pricing";
import { Menu } from "@/validations/menu-validation";
import { convertIDR } from "../../../../../lib/utils";

export default function Summary({
  order,
  OrderMenu,
  id,
}: {
  order: {
    customer_name: string;
    status: string;
    tables: { name: string }[];
  };
  OrderMenu: {
    menus: Menu;
    quantity: number;
    status: string;
  }[];
  id: string;
}) {
  const { grandTotal, tax, service, totalPrice } = usePricing(OrderMenu);

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
            <div className="space-y-2">
              <Label>Table</Label>
              <Input
                value={(order?.tables as unknown as { name: string })?.name}
                disabled
              />
            </div>
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
              <span className="font-sm">{convertIDR(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-sm">{convertIDR(tax)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="font-sm">{convertIDR(service)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-bold">Grand Total</span>
            <span className="text-lg font-bold text-primary">
              {convertIDR(grandTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
