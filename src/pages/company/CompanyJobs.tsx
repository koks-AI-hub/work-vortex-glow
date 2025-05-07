
import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useJobs } from "@/hooks/useJobs";
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
  Search,
  MapPin,
  Calendar,
  Loader2,
  X,
  Plus,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CompanyJobs() {
  const { user } = useAuth();
  const { useCompanyJobs, updateJobStatusMutation } = useJobs();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const { data: jobs, isLoading, error } = useCompanyJobs(user?.id || "");
  
  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === "active" ? job.is_active : !job.is_active);
    
    return matchesSearch && matchesStatus;
  });
  
  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      await updateJobStatusMutation.mutateAsync({
        jobId,
        isActive: !currentStatus,
      });
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <DashboardLayout title="Your Job Listings">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-9"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button asChild>
          <Link to="/company/post-job" className="flex items-center w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-vortex-500" />
        </div>
      ) : error ? (
        <GlassCard className="text-center py-10">
          <X className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-1">Error Loading Jobs</h3>
          <p className="text-gray-400">There was a problem loading your jobs. Please try again.</p>
        </GlassCard>
      ) : filteredJobs && filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <GlassCard key={job.id} className="animate-fade-in" hoverEffect>
              <div className="md:flex justify-between">
                <div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{job.title}</h3>
                    <Badge variant="outline" className={job.is_active ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}>
                      {job.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="bg-vortex-500/20 text-vortex-300">
                      {job.type}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-300 mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Posted {formatDate(job.postedAt)}
                    </div>
                    {job.deadline && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        Expires {formatDate(job.deadline)}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-gray-400 text-sm mb-4">
                    <p><strong>Salary:</strong> {job.salary || "Not specified"}</p>
                    <p>
                      <strong>Requirements:</strong> {job.requirements.join(", ")}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-col justify-center gap-2">
                  <Button asChild>
                    <Link to={`/company/jobs/${job.id}`}>View Details</Link>
                  </Button>
                  
                  <Button 
                    variant={job.is_active ? "destructive" : "outline"} 
                    onClick={() => toggleJobStatus(job.id, job.is_active)}
                    disabled={updateJobStatusMutation.isPending}
                  >
                    {updateJobStatusMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : job.is_active ? (
                      "Deactivate Job"
                    ) : (
                      "Activate Job"
                    )}
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-10">
          <Briefcase className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-1">No Jobs Found</h3>
          {searchTerm || statusFilter ? (
            <>
              <p className="text-gray-400">No jobs match your search criteria.</p>
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
              <p className="text-gray-400">You haven't posted any jobs yet.</p>
              <Button asChild className="mt-4">
                <Link to="/company/post-job">Post Your First Job</Link>
              </Button>
            </>
          )}
        </GlassCard>
      )}
    </DashboardLayout>
  );
}
