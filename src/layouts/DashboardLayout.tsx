
import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, 
  ChevronDown, 
  FileText, 
  LogOut, 
  Menu, 
  Search, 
  Settings, 
  Star,
  User, 
  UserRound, 
  Users, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isEmployee = user?.role === "employee";
  
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 glass-panel border-r border-white/10 p-4 transition-transform duration-200 lg:translate-x-0 lg:relative",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-vortex-600 to-vortex-400 flex items-center justify-center mr-2">
              <span className="text-white font-bold">W</span>
            </div>
            <span className="text-xl font-bold text-white">Work Vortex</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="h-10 w-10 rounded-full bg-vortex-700 flex items-center justify-center">
              <UserRound className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">{isEmployee ? "Employee" : "Company"}</p>
            </div>
          </div>
        </div>

        <Separator className="my-4 bg-white/10" />

        <nav className="space-y-1">
          {isEmployee ? (
            <>
              <Link
                to="/employee/dashboard"
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10"
              >
                <Star className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/employee/profile"
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Link
                to="/employee/jobs"
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10"
              >
                <Briefcase className="h-4 w-4" />
                <span>Jobs</span>
              </Link>
              <Link
                to="/employee/applications"
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10"
              >
                <FileText className="h-4 w-4" />
                <span>Applications</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/company/dashboard"
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10"
              >
                <Star className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/company/post-job"
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10"
              >
                <Briefcase className="h-4 w-4" />
                <span>Post Job</span>
              </Link>
              <Link
                to="/company/applications"
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10"
              >
                <FileText className="h-4 w-4" />
                <span>Applications</span>
              </Link>
              <Link
                to="/company/search"
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10"
              >
                <Search className="h-4 w-4" />
                <span>Search Workers</span>
              </Link>
            </>
          )}
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="glass-panel border-b border-white/10 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden" 
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-white">{title}</h1>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
