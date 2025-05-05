
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/hooks/useApplications";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Briefcase, 
  Calendar, 
  ClipboardList, 
  Eye, 
  Loader2, 
  MapPin, 
  Search, 
  X 
} from "lucide-react";

export default function JobApplications() {
  const { user } = useAuth();
  const { useEmployeeApplications } = useApplications();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { 
    data: applications, 
    isLoading: loadingApplications,
    error: applicationsError
  } = useEmployeeApplications(user?.id);
  
  const filteredApplications = applications?.filter((application) => {
    const matchesStatus = !statusFilter || application.status === statusFilter;
    const matchesSearch = !searchTerm || 
      application.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300">Pending</Badge>;
      case "reviewing":
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-300">Reviewing</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-500/20 text-green-300">Accepted</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/20 text-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout title="My Applications">
      {/* Filters */}
      <GlassCard className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-9"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto">
            <Select 
              value={statusFilter || ""}
              onValueChange={(value) => setStatusFilter(value || null)}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* Applications List */}
      {loadingApplications ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-vortex-500" />
        </div>
      ) : applicationsError ? (
        <GlassCard className="text-center py-10">
          <X className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-1">Error Loading Applications</h3>
          <p className="text-gray-400">
            There was a problem loading your applications. Please try again later.
          </p>
        </GlassCard>
      ) : filteredApplications && filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <GlassCard 
              key={application.id} 
              className="animate-fade-in transition-all hover:bg-white/10" 
              hoverEffect
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">
                  {application.job.title}
                </h3>
                {getStatusBadge(application.status)}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-300 mb-3">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
                  {application.job.company}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {application.job.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  Applied on {formatDate(application.appliedAt)}
                </div>
              </div>
              
              {application.status === "pending" && (
                <p className="text-sm text-yellow-300 mb-3">
                  Your application is awaiting review.
                </p>
              )}
              
              {application.status === "reviewing" && (
                <p className="text-sm text-blue-300 mb-3">
                  The employer is currently reviewing your application.
                </p>
              )}
              
              {application.status === "accepted" && (
                <p className="text-sm text-green-300 mb-3">
                  Congratulations! Your application has been accepted.
                </p>
              )}
              
              {application.status === "rejected" && (
                <p className="text-sm text-red-300 mb-3">
                  Unfortunately, your application was not selected for this position.
                </p>
              )}
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  onClick={() => {/* View application details */}}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-10">
          <ClipboardList className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-1">No Applications Found</h3>
          {searchTerm || statusFilter ? (
            <>
              <p className="text-gray-400">No applications match your filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter(null);
                }}
              >
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-400">You haven't applied to any jobs yet.</p>
              <Button
                className="mt-4"
                onClick={() => {
                  window.location.href = "/employee/jobs";
                }}
              >
                Browse Jobs
              </Button>
            </>
          )}
        </GlassCard>
      )}
    </DashboardLayout>
  );
}
