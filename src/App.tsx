
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context Providers
import { AuthProvider } from "@/context/AuthContext";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Employee Pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import JobFeed from "./pages/employee/JobFeed";
import JobApplications from "./pages/employee/JobApplications";

// Company Pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import PostJob from "./pages/company/PostJob";
import CompanyApplications from "./pages/company/CompanyApplications";
import SearchWorkers from "./pages/company/SearchWorkers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Employee Routes */}
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/profile" element={<EmployeeProfile />} />
            <Route path="/employee/jobs" element={<JobFeed />} />
            <Route path="/employee/applications" element={<JobApplications />} />
            
            {/* Company Routes */}
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/post-job" element={<PostJob />} />
            <Route path="/company/applications" element={<CompanyApplications />} />
            <Route path="/company/search" element={<SearchWorkers />} />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
