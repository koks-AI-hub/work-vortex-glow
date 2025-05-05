
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, File, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockJobs, mockApplications } from "@/lib/mockData";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const applications = mockApplications;
  const recentJobs = mockJobs.slice(0, 3);

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-vortex-500/20 flex items-center justify-center mr-4">
            <Briefcase className="h-6 w-6 text-vortex-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">Available Jobs</h3>
            <p className="text-2xl font-bold text-white">{mockJobs.length}</p>
          </div>
        </GlassCard>
        
        <GlassCard className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-vortex-500/20 flex items-center justify-center mr-4">
            <File className="h-6 w-6 text-vortex-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">Applications</h3>
            <p className="text-2xl font-bold text-white">{applications.length}</p>
          </div>
        </GlassCard>
        
        <GlassCard className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-vortex-500/20 flex items-center justify-center mr-4">
            <FileCheck className="h-6 w-6 text-vortex-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">Profile Completion</h3>
            <p className="text-2xl font-bold text-white">70%</p>
          </div>
        </GlassCard>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Jobs</h2>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <GlassCard key={job.id} className="animate-fade-in" hoverEffect>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">{job.title}</h3>
                  <span className="px-2 py-1 bg-vortex-500/20 text-vortex-300 text-xs rounded-full">
                    {job.type}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{job.company} • {job.location}</p>
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{job.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-vortex-400">{job.salary || "Salary not specified"}</p>
                  <Button size="sm" asChild>
                    <Link to={`/employee/jobs/${job.id}`}>View Details</Link>
                  </Button>
                </div>
              </GlassCard>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/employee/jobs">View All Jobs</Link>
            </Button>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Your Applications</h2>
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <GlassCard key={application.id} className="animate-fade-in" hoverEffect>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{application.job.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      application.status === "pending" 
                        ? "bg-yellow-500/20 text-yellow-300"
                        : application.status === "reviewing"
                        ? "bg-blue-500/20 text-blue-300"
                        : application.status === "accepted"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{application.job.company}</p>
                  <p className="text-xs text-gray-400 mb-4">
                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/employee/applications/${application.id}`}>View Details</Link>
                  </Button>
                </GlassCard>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/employee/applications">View All Applications</Link>
              </Button>
            </div>
          ) : (
            <GlassCard className="text-center py-8">
              <p className="text-gray-400 mb-4">You haven't applied to any jobs yet.</p>
              <Button asChild>
                <Link to="/employee/jobs">Browse Jobs</Link>
              </Button>
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
