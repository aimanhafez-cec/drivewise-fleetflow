import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/cost-compliance/DataTable";
import { TollTransactionCorporateRecord } from "@/lib/api/tollTransactionsCorporate";
import { format } from "date-fns";

interface IntegrationViewProps {
  data: TollTransactionCorporateRecord[];
  onRowClick: (row: TollTransactionCorporateRecord) => void;
}

export function IntegrationView({ data, onRowClick }: IntegrationViewProps) {
  const columns: Column<TollTransactionCorporateRecord>[] = [
    {
      key: "transaction_no",
      header: "Transaction No",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm">{item.transaction_no}</span>
      ),
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
    {
      key: "integration_timestamp",
      header: "Integration Date",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(item.integration_timestamp), "dd MMM yyyy HH:mm")}
        </span>
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
