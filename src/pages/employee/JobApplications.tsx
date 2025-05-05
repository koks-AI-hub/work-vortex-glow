
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockApplications } from "@/lib/mockData";
import { Link } from "react-router-dom";

export default function JobApplications() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30">Pending</Badge>;
      case "reviewing":
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">Reviewing</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-500/20 text-green-300 hover:bg-green-500/30">Accepted</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/20 text-red-300 hover:bg-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout title="My Applications">
      {mockApplications.length > 0 ? (
        <div className="space-y-6">
          {mockApplications.map((application) => (
            <GlassCard key={application.id} className="animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <div className="flex items-start md:items-center flex-col md:flex-row md:gap-3">
                    <h3 className="text-xl font-bold text-white">{application.job.title}</h3>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-2 md:mt-0">{application.job.company} • {application.job.location}</p>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-white">Application Timeline:</h4>
                    <div className="border-l-2 border-white/20 pl-4 py-1">
                      <p className="text-xs text-gray-300">
                        {new Date(application.appliedAt).toLocaleDateString()} - Application submitted
                      </p>
                    </div>
                    {application.status !== "pending" && (
                      <div className="border-l-2 border-white/20 pl-4 py-1">
                        <p className="text-xs text-gray-300">
                          {new Date(new Date(application.appliedAt).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()} - Application under review
                        </p>
                      </div>
                    )}
                    {(application.status === "accepted" || application.status === "rejected") && (
                      <div className="border-l-2 border-white/20 pl-4 py-1">
                        <p className="text-xs text-gray-300">
                          {new Date(new Date(application.appliedAt).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {application.status === "accepted" ? "Application accepted" : "Application rejected"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-4 flex flex-col gap-2">
                  <Button asChild>
                    <Link to={`/employee/applications/${application.id}`}>View Details</Link>
                  </Button>
                  {(application.status === "accepted" || application.status === "reviewing") && (
                    <Button variant="outline">Contact Recruiter</Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-10">
          <p className="text-gray-400 mb-4">You haven't applied to any jobs yet.</p>
          <Button asChild>
            <Link to="/employee/jobs">Browse Jobs</Link>
          </Button>
        </GlassCard>
      )}
    </DashboardLayout>
  );
}
