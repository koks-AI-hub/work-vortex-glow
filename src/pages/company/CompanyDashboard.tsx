
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, File, Users } from "lucide-react";
import { mockJobs, mockApplications } from "@/lib/mockData";

export default function CompanyDashboard() {
  // For a real app, this would filter to only show this company's jobs
  const companyJobs = mockJobs.slice(0, 2);
  const recentApplications = mockApplications.slice(0, 3);

  return (
    <DashboardLayout title="Company Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-vortex-500/20 flex items-center justify-center mr-4">
            <Briefcase className="h-6 w-6 text-vortex-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">Active Jobs</h3>
            <p className="text-2xl font-bold text-white">{companyJobs.length}</p>
          </div>
        </GlassCard>
        
        <GlassCard className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-vortex-500/20 flex items-center justify-center mr-4">
            <File className="h-6 w-6 text-vortex-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">Applications</h3>
            <p className="text-2xl font-bold text-white">{recentApplications.length}</p>
          </div>
        </GlassCard>
        
        <GlassCard className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-vortex-500/20 flex items-center justify-center mr-4">
            <Users className="h-6 w-6 text-vortex-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">Profile Views</h3>
            <p className="text-2xl font-bold text-white">124</p>
          </div>
        </GlassCard>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Your Active Job Listings</h2>
            <Button asChild>
              <Link to="/company/post-job">Post New Job</Link>
            </Button>
          </div>
          
          {companyJobs.length > 0 ? (
            <div className="space-y-4">
              {companyJobs.map((job) => (
                <GlassCard key={job.id} className="animate-fade-in" hoverEffect>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                    <span className="px-2 py-1 bg-vortex-500/20 text-vortex-300 text-xs rounded-full">
                      {job.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{job.location}</p>
                  <p className="text-sm text-gray-300 mb-2">
                    Posted {new Date(job.postedAt).toLocaleDateString()}
                    {job.deadline && ` • Expires ${new Date(job.deadline).toLocaleDateString()}`}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-vortex-400">{job.salary || "Salary not specified"}</p>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/company/jobs/${job.id}`}>View Details</Link>
                    </Button>
                  </div>
                </GlassCard>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/company/jobs">View All Jobs</Link>
              </Button>
            </div>
          ) : (
            <GlassCard className="text-center py-8">
              <p className="text-gray-400 mb-4">You haven't posted any jobs yet.</p>
              <Button asChild>
                <Link to="/company/post-job">Post Your First Job</Link>
              </Button>
            </GlassCard>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Applications</h2>
          {recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <GlassCard key={application.id} className="animate-fade-in" hoverEffect>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white">Application for {application.job.title}</h3>
                      <p className="text-sm text-gray-400">
                        Candidate ID: {application.employeeId.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-400">
                        Applied on {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
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
                  
                  <div className="flex justify-end mt-2">
                    <Button size="sm" asChild>
                      <Link to={`/company/applications/${application.id}`}>Review</Link>
                    </Button>
                  </div>
                </GlassCard>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/company/applications">View All Applications</Link>
              </Button>
            </div>
          ) : (
            <GlassCard className="text-center py-8">
              <p className="text-gray-400">No applications have been received yet.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
