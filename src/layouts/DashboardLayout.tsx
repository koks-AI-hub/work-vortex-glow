import { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, FileText, LogOut, Search, Settings, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Dynamically protect routes based on the user's role
  useAuthRedirect(user?.role || null, '/login');

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const employeeRoutes = [
    {
      path: "/employee/dashboard",
      label: "Dashboard",
      icon: <Briefcase className="h-5 w-5 mr-2" />,
    },
    {
      path: "/employee/jobs",
      label: "Find Jobs",
      icon: <Search className="h-5 w-5 mr-2" />,
    },
    {
      path: "/employee/applications",
      label: "Applications",
      icon: <FileText className="h-5 w-5 mr-2" />,
    },
    {
      path: "/employee/profile",
      label: "My Profile",
      icon: <UserRound className="h-5 w-5 mr-2" />,
    },
  ];

  const companyRoutes = [
    {
      path: "/company/dashboard",
      label: "Dashboard",
      icon: <Briefcase className="h-5 w-5 mr-2" />,
    },
    {
      path: "/company/post-job",
      label: "Post Job",
      icon: <FileText className="h-5 w-5 mr-2" />,
    },
    {
      path: "/company/applications",
      label: "Applications",
      icon: <FileText className="h-5 w-5 mr-2" />,
    },
    {
      path: "/company/search",
      label: "Search Workers",
      icon: <Search className="h-5 w-5 mr-2" />,
    },
  ];

  const routes = user?.role === "employee" ? employeeRoutes : companyRoutes;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 md:min-h-screen bg-gradient-to-b from-vortex-900 to-vortex-950 p-4">
        <div className="flex justify-between items-center mb-8 md:mb-12">
          <h1 className="text-2xl font-bold text-white">Work Vortex</h1>
          <button className="md:hidden">
            {/* Mobile menu button would go here */}
          </button>
        </div>

        <div className="mb-8">
          <div className="p-3 rounded-lg bg-vortex-700/30 flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-vortex-500 flex items-center justify-center mr-3">
              {user?.role === "employee" ? (
                <UserRound className="h-5 w-5 text-white" />
              ) : (
                <Briefcase className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm text-white font-medium line-clamp-1">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-400">
                {user?.role === "employee" ? "Job Seeker" : "Employer"}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive(route.path)
                    ? "bg-vortex-700 text-white"
                    : "text-gray-300 hover:bg-vortex-800 hover:text-white"
                }`}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-vortex-700/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-vortex-800"
            onClick={() => logout()}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow p-4 md:p-8 bg-gradient-to-b from-black to-vortex-950">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">{title}</h1>
        <main>{children}</main>
      </div>
    </div>
  );
}
