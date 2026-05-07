import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';

import PublicRoute from './components/guards/PublicRoute';
import PrivateRoute from './components/guards/PrivateRoute';
import AdminRoute from './components/guards/AdminRoute';
import AdminLayout from './components/layouts/AdminLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

import Landing from './pages/Landing';
import HowItWorks from './pages/HowItWorks';
import AboutUs from './pages/AboutUs';
import Blog from './pages/Blog';
import Careers from './pages/Careers';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';

import AdminOverview from './pages/admin/Overview';
import AdminTenants from './pages/admin/Tenants';
import TenantDetail from './pages/admin/TenantDetail';
import AdminLeads from './pages/admin/AdminLeads';
import LeadsNew from './pages/admin/LeadsNew';
import AdminLeadDetail from './pages/admin/AdminLeadDetail';
import Analytics from './pages/admin/Analytics';
import AdminUsers from './pages/admin/Users';
import AdminPayments from './pages/admin/Payments';

import DashboardOverview from './pages/dashboard/DashboardOverview';
import DashboardLeads from './pages/dashboard/DashboardLeads';
import LeadDetail from './pages/dashboard/LeadDetail';
import Messages from './pages/dashboard/Messages';
import Quota from './pages/dashboard/Quota';
import Team from './pages/dashboard/Team';
import Settings from './pages/dashboard/Settings';
import Billing from './pages/dashboard/Billing';

import NotFound from './pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const base = import.meta.env.BASE_URL.replace(/\/$/, '') || '';

export default function App() {
  return (
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={base}>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/pricing" element={<Landing />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="tenants" element={<AdminTenants />} />
            <Route path="tenants/:id" element={<TenantDetail />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="leads/new" element={<LeadsNew />} />
            <Route path="leads/:id" element={<AdminLeadDetail />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>

          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="leads" element={<DashboardLeads />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="messages" element={<Messages />} />
            <Route path="quota" element={<Quota />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
            <Route path="billing" element={<Billing />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
    </HelmetProvider>
  );
}
