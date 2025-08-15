import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Auth from "./pages/Auth";
import { Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";
import NewReservation from "./pages/NewReservation";
import ReservationsMulti from "./pages/ReservationsMulti";
import Planner from "./pages/Planner";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import Customers from "./pages/Customers";
import NotFound from "./pages/NotFound";
import Quotes from "./pages/Quotes";
import NewQuote from "./pages/NewQuote";
import QuoteDetails from "./pages/QuoteDetails";
import Inspections from "./pages/Inspections";
import NewInspection from "./pages/NewInspection";
import ReservationDetails from "./pages/ReservationDetails";
import ReservationDetailsPage from "./pages/ReservationDetailsPage";
import Agreements from "./pages/Agreements";
import AgreementDetails from "./pages/AgreementDetails";
import AgreementWizardPage from "./pages/AgreementWizardPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
            </Route>
              <Route path="/reservations" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Reservations />} />
                <Route path="new" element={<NewReservation />} />
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
            </Route>
            <Route path="/planner" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Planner />} />
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
              <Route path=":id" element={<QuoteDetails />} />
            </Route>
            <Route path="/inspections" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Inspections />} />
              <Route path="new" element={<NewInspection />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
