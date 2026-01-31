import { Button } from "@/components/ui/button";
import { usePricing } from "@/hooks/use-pricing";
import { convertIDR } from "@/lib/utils";
import { Menu } from "@/validations/menu-validation";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const Receipt = ({
  order,
  orderMenu,
  orderId,
}: {
  order: {
    customer_name: string;
    tables: { name: string }[];
    status: string;
    created_at: string;
  };
  orderMenu:
    | {
        menus: Menu;
        quantity: number;
        status: string;
        id: string;
      }[]
    | null
    | undefined;
  orderId: string;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const { grandTotal, tax, service, totalPrice } = usePricing(orderMenu);

  const reactToPrintFn = useReactToPrint({ contentRef });

  return (
    <div className="relative">
      <Button className="no-print" onClick={reactToPrintFn}>
        Print Receipt
      </Button>
      <div ref={contentRef} className="print-area hidden">
        <h4 className="text-2xl font-bold center pb-2">TAMPA Coffee</h4>
        <div className="py-4 border-b border-dashed text-sm space-y-2">
          <p>
            Bill No: <span className="font-bold">{orderId}</span>
          </p>
          <p>
            Table:{" "}
            <span className="font-bold">
              {(order?.tables as unknown as { name: string })?.name}
            </span>
          </p>
          <p>
            Customer: <span className="font-bold">{order?.customer_name}</span>
          </p>
          <p>
            Date:{" "}
            <span className="font-bold">
              {new Date(order?.created_at).toLocaleString()}
            </span>
          </p>
        </div>
        <div className="items py-2 border-b border-dashed small">
          {orderMenu?.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="w-2/3">
                <div className="bold">{item.menus.name}</div>
                <div className="small">x {item.quantity}</div>
              </div>
              <div className="w-1/3 right">
                {convertIDR(item.menus.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
        <div className="summary py-2 small">
          <div className="flex justify-between items-center">
            <p>Sub Total</p>
            <p>{convertIDR(totalPrice)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p>Tax</p>
            <p>{convertIDR(tax)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p>Service</p>
            <p>{convertIDR(service)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="bold">Grand Total</p>
            <p className="bold">{convertIDR(grandTotal)}</p>
          </div>
        </div>
        <div className="footer small center">
          <div>Thank you for visiting TAMPA Coffee</div>
          <div className="small">Please visit again!</div>
        </div>
      </div>
      {/* print styles */}
      <style>{`
        @media print {
          /* use full printable width and remove large page margins */
          @page { size: auto; margin: 0mm; }
          html, body { -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          /* Make print area fill printable width (avoid centered narrow strip) */
          .print-area { display: block !important; position: relative !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 6mm 4mm !important; color: #000 !important; background: #fff !important; font-family: Arial, Helvetica, sans-serif !important; font-size: 14px !important; line-height: 1.25 !important; }
          .print-area h4 { font-size: 18px !important; margin: 0 0 6px 0 !important; text-align: center !important; }
          .print-area .border-dashed { border-bottom: 1px dashed #444 !important; }
          .print-area .items p { margin: 0 !important; }
          .print-area .small { font-size: 12px !important; }
          .print-area .right { text-align: right !important; }
          .print-area .bold { font-weight: 700 !important; }
          .print-area .center { text-align: center !important; }
          .print-area .footer { margin-top: 8px !important; text-align: center !important; font-size: 12px !important; }
        }
        /* Ensure print-area is hidden on screen */
        .print-area { display: none; }
      `}</style>
    </div>
  );
};

export default Receipt;
