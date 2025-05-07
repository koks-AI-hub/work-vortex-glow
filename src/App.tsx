import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

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
import ApplicationDetails from "./pages/employee/ApplicationDetails";

// Company Pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyProfile from "./pages/company/CompanyProfile";
import PostJob from "./pages/company/PostJob";
import CompanyApplications from "./pages/company/CompanyApplications";
import CompanyApplicationDetails from "./pages/company/CompanyApplicationDetails";
import SearchWorkers from "./pages/company/SearchWorkers";
import CompanyJobs from "./pages/company/CompanyJobs";
import JobDetails from "./pages/company/JobDetails";

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
            <Route path="/employee/applications/:id" element={<ApplicationDetails />} />
            
            {/* Company Routes */}
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/profile" element={<CompanyProfile />} />
            <Route path="/company/post-job" element={<PostJob />} />
            <Route path="/company/applications" element={<CompanyApplications />} />
            <Route path="/company/applications/:id" element={<CompanyApplicationDetails />} />
            <Route path="/company/search" element={<SearchWorkers />} />
            <Route path="/company/jobs" element={<CompanyJobs />} />
            <Route path="/company/jobs/:id" element={<JobDetails />} />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Analytics /> {/* Add Analytics here */}
      <SpeedInsights /> {/* Add Speed Insights here */}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
