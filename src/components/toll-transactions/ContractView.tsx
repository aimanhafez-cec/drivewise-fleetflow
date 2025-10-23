import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/cost-compliance/DataTable";
import { TollTransactionCorporateRecord } from "@/lib/api/tollTransactionsCorporate";
import { format } from "date-fns";

interface ContractViewProps {
  data: TollTransactionCorporateRecord[];
  onRowClick: (row: TollTransactionCorporateRecord) => void;
}

export function ContractView({ data, onRowClick }: ContractViewProps) {
  const columns: Column<TollTransactionCorporateRecord>[] = [
    {
      key: "contract_no",
      header: "Contract",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm">
          {item.contract_no || (
            <span className="text-muted-foreground italic">Not linked</span>
          )}
        </span>
      ),
    },
    {
      key: "customer_id",
      header: "Customer",
      render: (item) => (
        <span className="text-sm">
          {item.customer?.company_name || item.customer?.full_name || (
            <span className="text-muted-foreground italic">Unknown</span>
          )}
        </span>
      ),
    },
    {
      key: "vehicle_id",
      header: "Vehicle",
      render: (item) => {
        if (!item.vehicle) {
          return <span className="text-muted-foreground italic">Unknown</span>;
        }
        return (
          <div className="text-sm">
            <div className="font-medium">
              {item.vehicle.make} {item.vehicle.model}
            </div>
            <div className="text-muted-foreground">{item.vehicle.license_plate}</div>
          </div>
        );
      },
    },
    {
      key: "plate_number",
      header: "Plate",
      sortable: true,
      render: (item) => (
        <span className="font-semibold">{item.plate_number}</span>
      ),
    },
    {
      key: "driver_id",
      header: "Driver",
      render: (item) => (
        <span className="text-sm">
          {item.driver?.full_name || (
            <span className="text-muted-foreground italic">Unknown</span>
          )}
        </span>
      ),
    },
    {
      key: "emirate",
      header: "Emirate",
      sortable: true,
      render: (item) => (
        <Badge
          variant="outline"
          className={
            item.emirate === "Dubai"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-green-50 text-green-700 border-green-200"
          }
        >
          {item.emirate}
        </Badge>
      ),
    },
    {
      key: "gate_name",
      header: "Gate",
      sortable: true,
    },
    {
      key: "crossing_date",
      header: "Date/Time",
      sortable: true,
      render: (item) => (
        <div className="text-sm">
          <div>{format(new Date(item.crossing_date), "dd MMM yyyy")}</div>
          <div className="text-muted-foreground">{item.crossing_time}</div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (item) => (
        <span className="font-semibold">
          AED {Number(item.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "payment_status",
      header: "Status",
      sortable: true,
      render: (item) => {
        const status = item.payment_status;
        const variants: Record<string, string> = {
          charged: "bg-blue-50 text-blue-700 border-blue-200",
          pending: "bg-orange-50 text-orange-700 border-orange-200",
          failed: "bg-red-50 text-red-700 border-red-200",
          exempt: "bg-gray-50 text-gray-700 border-gray-200",
        };
        return (
          <Badge variant="outline" className={variants[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: "toll_authority",
      header: "Authority",
      sortable: true,
      render: (item) => (
        <Badge variant="secondary">{item.toll_authority}</Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      idField="id"
      onRowClick={onRowClick}
    />
  );
}
