import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'sonner';
import { RolePortal } from "@/components/auth/role-portal";
import Dashboard from "@/pages/dashboard";
import StaffDashboard from "@/pages/staff-dashboard";
import ManagementDashboard from "@/pages/management-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import { ForgotPasswordCard } from "@/components/ui/forgot-password-card";
import { ThemeProvider } from "@/components/theme-provider";

function DashboardRouter() {
  const userRole = localStorage.getItem('userRole') || 'student';
  const roleLower = userRole.toLowerCase();

  if (roleLower === 'staff') {
    return <StaffDashboard />;
  } else if (roleLower === 'management') {
    return <ManagementDashboard />;
  } else if (roleLower === 'admin') {
    return <AdminDashboard />;
  }
  return <Dashboard />;
}

/**
 * Main Application Entry Point
 * Sole responsibility: Rendering the Core UI components.
 */
function App() {
  return (
    <BrowserRouter>
      <main className="antialiased">
        <Routes>
          {/* Public / Auth routes (hardcoded themes) */}
          <Route path="/" element={<RolePortal />} />
          <Route path="/forgot-password" element={<ForgotPasswordCard />} />

          {/* Dashboard routes wrapped in ThemeProvider */}
          <Route path="/dashboard/*" element={
            <ThemeProvider defaultTheme="dark" storageKey="university-theme">
              <Routes>
                <Route path="/" element={<DashboardRouter />} />
              </Routes>
            </ThemeProvider>
          } />
        </Routes>
      </main>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white'
          }
        }}
      />
    </BrowserRouter>
  );
}

export default App;