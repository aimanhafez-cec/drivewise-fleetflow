import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TollTransactionCorporateRecord } from "@/lib/api/tollTransactionsCorporate";
import { format } from "date-fns";
import { MapPin, Navigation, DollarSign, FileText, Link2, Clock } from "lucide-react";

interface TransactionDetailsPanelProps {
  transaction: TollTransactionCorporateRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailsPanel({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailsPanelProps) {
  if (!transaction) return null;

  const statusVariants: Record<string, string> = {
    charged: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-orange-50 text-orange-700 border-orange-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    exempt: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const emirateColor = transaction.emirate === "Dubai" 
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-green-50 text-green-700 border-green-200";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Transaction Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Transaction Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-600" />
              <h3 className="font-semibold">Transaction Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Transaction No</p>
                <p className="font-mono font-medium">{transaction.transaction_no}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="outline" className={statusVariants[transaction.payment_status]}>
                  {transaction.payment_status.charAt(0).toUpperCase() + transaction.payment_status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold text-lg">AED {Number(transaction.amount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Plate Number</p>
                <p className="font-semibold">{transaction.plate_number}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Gate Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-600" />
              <h3 className="font-semibold">Gate Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Gate Name</p>
                <p className="font-medium">{transaction.gate_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gate ID</p>
                <p className="font-mono">{transaction.gate_id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Emirate</p>
                <Badge variant="outline" className={emirateColor}>
                  {transaction.emirate}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Authority</p>
                <Badge variant="secondary">{transaction.toll_authority}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Crossing Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-600" />
              <h3 className="font-semibold">Crossing Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">
                  {format(new Date(transaction.crossing_date), "dd MMM yyyy")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Time</p>
                <p className="font-medium">{transaction.crossing_time}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contract Linkage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-cyan-600" />
              <h3 className="font-semibold">Contract Linkage</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Contract ID</p>
                {transaction.contract_id ? (
                  <p className="font-mono">{transaction.contract_id}</p>
                ) : (
                  <p className="text-muted-foreground italic">Not linked to contract</p>
                )}
              </div>
              {transaction.vehicle_id && (
                <div>
                  <p className="text-muted-foreground">Vehicle ID</p>
                  <p className="font-mono">{transaction.vehicle_id}</p>
                </div>
              )}
              {transaction.customer_id && (
                <div>
                  <p className="text-muted-foreground">Customer ID</p>
                  <p className="font-mono">{transaction.customer_id}</p>
                </div>
              )}
              {transaction.driver_id && (
                <div>
                  <p className="text-muted-foreground">Driver ID</p>
                  <p className="font-mono">{transaction.driver_id}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Integration Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-cyan-600" />
              <h3 className="font-semibold">Integration Info</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Source</p>
                <p className="font-medium">{transaction.integration_source}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Batch ID</p>
                <p className="font-mono text-xs">{transaction.integration_batch_id || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Last Synced</p>
                <p className="font-medium">
                  {format(new Date(transaction.integration_timestamp), "dd MMM yyyy HH:mm:ss")}
                </p>
              </div>
            </div>
          </div>

          {transaction.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Notes</h3>
                <p className="text-sm text-muted-foreground">{transaction.notes}</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
