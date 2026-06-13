import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/contexts/language-context";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

// Patient
import PatientDashboard from "@/pages/patient/dashboard";
import VitalsForm from "@/pages/patient/vitals-form";
import VitalsHistory from "@/pages/patient/history";
import PatientAnalytics from "@/pages/patient/analytics";
import PatientAlerts from "@/pages/patient/alerts";
import PatientAppointments from "@/pages/patient/appointments";
import PatientHospitals from "@/pages/patient/hospitals";
import HospitalDetail from "@/pages/patient/hospital-detail";
import AiAssistant from "@/pages/patient/ai-assistant";
import PatientSettings from "@/pages/patient/settings";
import AiInsights from "@/pages/patient/insights";
import GovtSchemes from "@/pages/patient/schemes";
import AmbulanceTracking from "@/pages/patient/ambulance";
import BloodDonation from "@/pages/patient/blood-donation";

// Doctor
import DoctorDashboard from "@/pages/doctor/dashboard";
import DoctorPatients from "@/pages/doctor/patients";
import DoctorAppointments from "@/pages/doctor/appointments";
import DoctorAlerts from "@/pages/doctor/alerts";
import DoctorHospitals from "@/pages/doctor/hospitals";
import DoctorSettings from "@/pages/doctor/settings";

// Admin
import AdminDashboard from "@/pages/hospital-admin/dashboard";
import AdminDoctors from "@/pages/hospital-admin/doctors";
import AdminPatients from "@/pages/hospital-admin/patients";
import AdminAppointments from "@/pages/hospital-admin/appointments";
import AdminAnalytics from "@/pages/hospital-admin/analytics";
import AdminHospitals from "@/pages/hospital-admin/hospitals";
import AdminSettings from "@/pages/hospital-admin/settings";
import AdminBedManagement from "@/pages/hospital-admin/bed-management";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        <Route path="/patient">
          <ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>
        </Route>
        <Route path="/patient/vitals">
          <ProtectedRoute allowedRoles={["patient"]}><VitalsForm /></ProtectedRoute>
        </Route>
        <Route path="/patient/history">
          <ProtectedRoute allowedRoles={["patient"]}><VitalsHistory /></ProtectedRoute>
        </Route>
        <Route path="/patient/analytics">
          <ProtectedRoute allowedRoles={["patient"]}><PatientAnalytics /></ProtectedRoute>
        </Route>
        <Route path="/patient/alerts">
          <ProtectedRoute allowedRoles={["patient"]}><PatientAlerts /></ProtectedRoute>
        </Route>
        <Route path="/patient/appointments">
          <ProtectedRoute allowedRoles={["patient"]}><PatientAppointments /></ProtectedRoute>
        </Route>
        <Route path="/patient/hospitals/:id">
          <ProtectedRoute allowedRoles={["patient"]}><HospitalDetail /></ProtectedRoute>
        </Route>
        <Route path="/patient/hospitals">
          <ProtectedRoute allowedRoles={["patient"]}><PatientHospitals /></ProtectedRoute>
        </Route>
        <Route path="/patient/ai-assistant">
          <ProtectedRoute allowedRoles={["patient"]}><AiAssistant /></ProtectedRoute>
        </Route>
        <Route path="/patient/settings">
          <ProtectedRoute allowedRoles={["patient"]}><PatientSettings /></ProtectedRoute>
        </Route>
        <Route path="/patient/insights">
          <ProtectedRoute allowedRoles={["patient"]}><AiInsights /></ProtectedRoute>
        </Route>
        <Route path="/patient/schemes">
          <ProtectedRoute allowedRoles={["patient"]}><GovtSchemes /></ProtectedRoute>
        </Route>
        <Route path="/patient/ambulance">
          <ProtectedRoute allowedRoles={["patient"]}><AmbulanceTracking /></ProtectedRoute>
        </Route>
        <Route path="/patient/blood-donation">
          <ProtectedRoute allowedRoles={["patient"]}><BloodDonation /></ProtectedRoute>
        </Route>

        <Route path="/doctor">
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></ProtectedRoute>
        </Route>
        <Route path="/doctor/patients">
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorPatients /></ProtectedRoute>
        </Route>
        <Route path="/doctor/appointments">
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorAppointments /></ProtectedRoute>
        </Route>
        <Route path="/doctor/alerts">
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorAlerts /></ProtectedRoute>
        </Route>
        <Route path="/doctor/hospitals">
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorHospitals /></ProtectedRoute>
        </Route>
        <Route path="/doctor/settings">
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorSettings /></ProtectedRoute>
        </Route>

        <Route path="/hospital-admin">
          <ProtectedRoute allowedRoles={["hospital_admin"]}><AdminDashboard /></ProtectedRoute>
        </Route>
        <Route path="/hospital-admin/doctors">
          <ProtectedRoute allowedRoles={["hospital_admin"]}><AdminDoctors /></ProtectedRoute>
        </Route>
        <Route path="/hospital-admin/patients">
          <ProtectedRoute allowedRoles={["hospital_admin"]}><AdminPatients /></ProtectedRoute>
        </Route>
        <Route path="/hospital-admin/appointments">
          <ProtectedRoute allowedRoles={["hospital_admin"]}><AdminAppointments /></ProtectedRoute>
        </Route>
        <Route path="/hospital-admin/analytics">
          <ProtectedRoute allowedRoles={["hospital_admin"]}><AdminAnalytics /></ProtectedRoute>
        </Route>
        <Route path="/hospital-admin/hospitals">
          <ProtectedRoute allowedRoles={["hospital_admin"]}><AdminHospitals /></ProtectedRoute>
        </Route>
        <Route path="/hospital-admin/settings">
          <ProtectedRoute allowedRoles={["hospital_admin"]}><AdminSettings /></ProtectedRoute>
        </Route>
        <Route path="/hospital-admin/bed-management">
          <ProtectedRoute allowedRoles={["hospital_admin"]}><AdminBedManagement /></ProtectedRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <LanguageProvider>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </LanguageProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

