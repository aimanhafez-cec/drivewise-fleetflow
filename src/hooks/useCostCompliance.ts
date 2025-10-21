import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CostComplianceAPI,
  CreateBillingCycleData,
  BillingPreviewData,
} from "@/lib/api/costCompliance";
import { toast } from "sonner";

export const useCostComplianceDashboard = () => {
  return useQuery({
    queryKey: ["cost-compliance-dashboard"],
    queryFn: () => CostComplianceAPI.getDashboardStats(),
  });
};

export const useBillingCycles = (contractId?: string) => {
  return useQuery({
    queryKey: ["billing-cycles", contractId],
    queryFn: () => CostComplianceAPI.listBillingCycles(contractId),
  });
};

export const useBillingCycle = (id?: string) => {
  return useQuery({
    queryKey: ["billing-cycle", id],
    queryFn: () => CostComplianceAPI.getBillingCycle(id!),
    enabled: !!id,
  });
};

export const useCreateBillingCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBillingCycleData) =>
      CostComplianceAPI.createBillingCycle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-cycles"] });
      toast.success("Billing cycle created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create billing cycle");
      console.error(error);
    },
  });
};

export const useGenerateBillingPreview = () => {
  return useMutation({
    mutationFn: ({
      contractId,
      periodStart,
      periodEnd,
    }: {
      contractId: string;
      periodStart: string;
      periodEnd: string;
    }) => CostComplianceAPI.generateBillingPreview(contractId, periodStart, periodEnd),
    onSuccess: () => {
      toast.success("Billing preview generated successfully");
    },
    onError: (error) => {
      toast.error("Failed to generate billing preview");
      console.error(error);
    },
  });
};

export const useFinalizeBillingCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, invoiceId }: { id: string; invoiceId?: string }) =>
      CostComplianceAPI.finalizeBillingCycle(id, invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-cycles"] });
      queryClient.invalidateQueries({ queryKey: ["billing-cycle"] });
      toast.success("Billing cycle finalized successfully");
    },
    onError: (error) => {
      toast.error("Failed to finalize billing cycle");
      console.error(error);
    },
  });
};

export const useMarkBillingAsInvoiced = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, invoiceId }: { id: string; invoiceId: string }) =>
      CostComplianceAPI.markAsInvoiced(id, invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-cycles"] });
      queryClient.invalidateQueries({ queryKey: ["billing-cycle"] });
      toast.success("Billing cycle marked as invoiced");
    },
    onError: (error) => {
      toast.error("Failed to mark as invoiced");
      console.error(error);
    },
  });
};

export const useExportBillingData = () => {
  return useMutation({
    mutationFn: ({
      billingPreview,
      format,
    }: {
      billingPreview: BillingPreviewData;
      format: "pdf" | "excel" | "csv";
    }) => CostComplianceAPI.exportBillingData(billingPreview, format),
    onSuccess: (result) => {
      toast.success(`Export ready: ${result.filename}`);
      // In production, trigger download
      console.log("Download URL:", result.url);
    },
    onError: (error) => {
      toast.error("Failed to export billing data");
      console.error(error);
    },
  });
};

export const useBatchGenerateBilling = () => {
  return useMutation({
    mutationFn: (
      contracts: Array<{
        contract_id: string;
        period_start: string;
        period_end: string;
      }>
    ) => CostComplianceAPI.batchGenerateBilling(contracts),
    onSuccess: (result) => {
      toast.success(
        `Batch billing completed: ${result.success} succeeded, ${result.failed} failed`
      );
    },
    onError: (error) => {
      toast.error("Batch billing generation failed");
      console.error(error);
    },
  });
};

export const useRunExceptionDetection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => CostComplianceAPI.runExceptionDetection(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["compliance-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["exception-statistics"] });
      queryClient.invalidateQueries({ queryKey: ["cost-compliance-dashboard"] });
      toast.success(
        `Exception detection completed: ${result.created} new exceptions found`
      );
      if (result.errors.length > 0) {
        console.error("Detection errors:", result.errors);
      }
    },
    onError: (error) => {
      toast.error("Exception detection failed");
      console.error(error);
    },
  });
};
