
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/hooks/useApplications";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Loader2, FileText, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

export default function CompanyApplications() {
  const { user } = useAuth();
  const { useCompanyApplications, updateStatusMutation } = useApplications();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingResume, setViewingResume] = useState(false);
  
  // Fetch applications for this company
  const { 
    data: applications, 
    isLoading: loadingApplications, 
    error: applicationsError
  } = useCompanyApplications(user?.id);
  
  const filteredApplications = applications?.filter(app => {
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesSearch = !searchTerm || 
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        applicationId,
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };
  
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

  const handleViewResume = (application: any) => {
    if (!application) return;
    
    setViewingResume(true);
    
    // Find the resume URL
    const resumeUrl = application.job?.employee?.resumeUrl || null;
    
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
    
    setTimeout(() => setViewingResume(false), 1000);
  };
  
  return (
    <DashboardLayout title="Applications">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            className="pl-9"
            placeholder="Search by job title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-auto">
          <Select 
            value={statusFilter || "all"}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? null : value);
            }}
          >
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loadingApplications ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-vortex-500" />
        </div>
      ) : applicationsError ? (
        <GlassCard className="text-center py-10">
          <X className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-1">Error Loading Applications</h3>
          <p className="text-gray-400">
            There was a problem loading applications. Please try again later.
          </p>
        </GlassCard>  
      ) : filteredApplications && filteredApplications.length > 0 ? (
        <div className="space-y-6">
          {filteredApplications.map((application) => (
            <GlassCard key={application.id} className="animate-fade-in">
              <div className="md:flex justify-between">
                <div>
                  <div className="flex items-start md:items-center flex-col md:flex-row gap-0 md:gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {application.job.title}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-1 mb-2">
                    Candidate ID: {application.employeeId.substring(0, 8)}...
                  </p>
                  
                  <p className="text-xs text-gray-400 mb-4">
                    Applied on {formatDate(application.appliedAt)}
                  </p>
                  
                  <div className="mt-4 mb-4 md:mb-0">
                    <p className="text-sm text-white mb-1">Update Status:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={application.status === "reviewing" ? "bg-blue-500/20" : ""}
                        onClick={() => handleStatusChange(application.id, "reviewing")}
                        disabled={updateStatusMutation.isPending}
                      >
                        Reviewing
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={application.status === "accepted" ? "bg-green-500/20" : ""}
                        onClick={() => handleStatusChange(application.id, "accepted")}
                        disabled={updateStatusMutation.isPending}
                      >
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={application.status === "rejected" ? "bg-red-500/20" : ""}
                        onClick={() => handleStatusChange(application.id, "rejected")}
                        disabled={updateStatusMutation.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-col justify-center gap-2">
                  <Button asChild>
                    <Link to={`/company/applications/${application.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-10">
          <p className="text-gray-400">No applications found matching your criteria.</p>
          {(statusFilter || searchTerm) && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setStatusFilter(null);
                setSearchTerm("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </GlassCard>
      )}
    </DashboardLayout>
  );
}
