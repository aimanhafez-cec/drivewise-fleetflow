import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import PWAInstallPrompt from "@/components/ui/pwa-install-prompt";
import Auth from "./pages/Auth";
import { Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";
import NewReservation from "./pages/NewReservation";
import NewReservationWizard from "./pages/NewReservationWizard";
import ReservationsMulti from "./pages/ReservationsMulti";
import Planner from "./pages/Planner";
import DailyPlanner from "./pages/DailyPlanner";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import Customers from "./pages/Customers";
import NotFound from "./pages/NotFound";
import Quotes from "./pages/Quotes";
import NewQuote from "./pages/NewQuote";
import QuoteDetails from "./pages/QuoteDetails";
import QuoteView from "./pages/QuoteView";
import ManageQuotations from "./pages/ManageQuotations";
import Inspections from "./pages/Inspections";
import NewInspection from "./pages/NewInspection";
import InspectionDetails from "./pages/InspectionDetails";
import ReservationDetails from "./pages/ReservationDetails";
import ReservationDetailsPage from "./pages/ReservationDetailsPage";
import Agreements from "./pages/Agreements";
import AgreementDetails from "./pages/AgreementDetails";
import CustodyDetail from "@/pages/CustodyDetail";
import AgreementWizardPage from "./pages/AgreementWizardPage";
import RFQs from "./pages/RFQs";
import NewRFQ from "./pages/NewRFQ";
import RFQDetails from "./pages/RFQDetails";
import CustomerDetails from "./pages/CustomerDetails";
import InstantBooking from "./pages/InstantBooking";
import NewInstantBooking from "./pages/NewInstantBooking";
import InstantBookingSettings from "./pages/InstantBookingSettings";
import InstantBookingAnalytics from "./pages/InstantBookingAnalytics";
import Reports from "./pages/Reports";
import MasterAgreements from "./pages/MasterAgreements";
import MasterAgreementDetails from "./pages/MasterAgreementDetails";
import NewMasterAgreement from "./pages/NewMasterAgreement";
import MasterAgreementEdit from "./pages/MasterAgreementEdit";
import ManageExpenses from "./pages/transactions/ManageExpenses";
import ManageInvoices from "./pages/transactions/ManageInvoices";
import PaymentProcessing from "./pages/transactions/PaymentProcessing";
import RevenueReports from "./pages/transactions/RevenueReports";
import AccountLedger from "./pages/transactions/AccountLedger";
import FinancialSummary from "./pages/transactions/FinancialSummary";
import ReplacementsHub from "./pages/operations/ReplacementsHub";
import MaintenanceHub from "./pages/operations/MaintenanceHub";
import NewWorkOrder from "./pages/operations/NewWorkOrder";
import VehicleStatusBoard from "./pages/operations/VehicleStatusBoard";
import OperationsWorkbench from "./pages/operations/OperationsWorkbench";
import IntegrationsHub from "./pages/integrations/IntegrationsHub";
import SecurityHub from "./pages/security/SecurityHub";
import AnalyticsHub from "./pages/analytics/AnalyticsHub";
import ComponentsLibrary from "./pages/components/ComponentsLibrary";
import TestingHub from "./pages/testing/TestingHub";
import DeploymentHub from "./pages/deployment/DeploymentHub";
import TransactionsHub from "./pages/transactions/TransactionsHub";
import CostComplianceHub from "./pages/transactions/CostComplianceHub";
import OperationsHub from "./pages/operations/OperationsHub";
import FleetOperationsHub from "./pages/operations/FleetOperationsHub";
import NewMovement from "./pages/operations/NewMovement";
import MovementDetail from "./pages/operations/MovementDetail";
import VehicleOwnershipHub from "./pages/operations/VehicleOwnershipHub";
import ExpensesHub from "./pages/operations/ExpensesHub";
import NewExpense from "./pages/operations/NewExpense";
import Custody from "./pages/Custody";
import NewCustody from "./pages/NewCustody";
import CustodySettings from "./pages/CustodySettings";
import CustodyAnalytics from "./pages/CustodyAnalytics";
// Hidden - commented out imports
// import { CarSubscriptions } from "./pages/CarSubscriptions";
// import { NewCarSubscription } from "./pages/NewCarSubscription";

const queryClient = new QueryClient();

const App = () => {
  console.log('App rendering. React version:', React.version);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
              </Route>
              <Route path="/instant-booking" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<InstantBooking />} />
                <Route path="new" element={<NewInstantBooking />} />
                <Route path="settings" element={<InstantBookingSettings />} />
                <Route path="analytics" element={<InstantBookingAnalytics />} />
              </Route>
              <Route path="/reservations" element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Reservations />} />
                  <Route path="new" element={<NewReservationWizard />} />
                  <Route path="new-legacy" element={<NewReservation />} />
                  <Route path="new-multi" element={<ReservationsMulti />} />
                  <Route path=":id" element={<ReservationDetailsPage />} />
                </Route>
              <Route path="/vehicles" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Vehicles />} />
                <Route path=":id" element={<VehicleDetails />} />
              </Route>
              <Route path="/customers" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Customers />} />
                <Route path=":id" element={<CustomerDetails />} />
              </Route>
              <Route path="/planner" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Planner />} />
              </Route>
              <Route path="/daily-planner" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DailyPlanner />} />
              </Route>
              <Route path="/agreements" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Agreements />} />
                <Route path="new" element={<AgreementWizardPage />} />
                <Route path=":id" element={<AgreementDetails />} />
              </Route>
              <Route path="/payments" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<div>Payments - Coming Soon</div>} />
              </Route>
              <Route path="/settings" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<div>Settings - Coming Soon</div>} />
              </Route>
              <Route path="/quotes" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Quotes />} />
                <Route path="new" element={<NewQuote />} />
                <Route path="view/:id" element={<QuoteView />} />
                <Route path=":id" element={<QuoteDetails />} />
              </Route>
              <Route path="/manage-quotations" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<ManageQuotations />} />
              </Route>
              <Route path="/rfqs" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<RFQs />} />
                <Route path="new" element={<NewRFQ />} />
                <Route path=":id" element={<RFQDetails />} />
              </Route>
              <Route path="/inspections" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Inspections />} />
                <Route path="new" element={<NewInspection />} />
                <Route path=":id" element={<InspectionDetails />} />
              </Route>
              <Route path="/operations" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<OperationsWorkbench />} />
                <Route path="fleet" element={<FleetOperationsHub />} />
                <Route path="movements/new" element={<NewMovement />} />
                <Route path="movements/:id" element={<MovementDetail />} />
                <Route path="ownership" element={<VehicleOwnershipHub />} />
                <Route path="expenses" element={<ExpensesHub />} />
                <Route path="expenses/new" element={<NewExpense />} />
                <Route path="replacement" element={<ReplacementsHub />} />
                <Route path="maintenance" element={<MaintenanceHub />} />
                <Route path="maintenance/new" element={<NewWorkOrder />} />
                <Route path="status-board" element={<VehicleStatusBoard />} />
              </Route>
              <Route path="/reports" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Reports />} />
              </Route>
            <Route path="/master-agreements" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<MasterAgreements />} />
              <Route path="new" element={<NewMasterAgreement />} />
              <Route path=":id" element={<MasterAgreementDetails />} />
              <Route path=":id/edit" element={<MasterAgreementEdit />} />
            </Route>
            <Route path="/transactions" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<TransactionsHub />} />
              <Route path="expenses" element={<ManageExpenses />} />
              <Route path="invoices" element={<ManageInvoices />} />
              <Route path="payments" element={<PaymentProcessing />} />
              <Route path="revenue" element={<RevenueReports />} />
              <Route path="ledger" element={<AccountLedger />} />
              <Route path="summary" element={<FinancialSummary />} />
              <Route path="cost-compliance" element={<CostComplianceHub />} />
            </Route>
            <Route path="/integrations" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<IntegrationsHub />} />
            </Route>
            <Route path="/security" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<SecurityHub />} />
            </Route>
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AnalyticsHub />} />
            </Route>
            <Route path="/testing" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<TestingHub />} />
            </Route>
            <Route path="/deployment" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DeploymentHub />} />
            </Route>
            <Route path="/components" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ComponentsLibrary />} />
            </Route>
            <Route path="/custody" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Custody />} />
              <Route path="new" element={<NewCustody />} />
              <Route path="settings" element={<CustodySettings />} />
              <Route path="analytics" element={<CustodyAnalytics />} />
              <Route path=":id" element={<CustodyDetail />} />
            </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;