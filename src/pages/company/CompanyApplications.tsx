
import { useState } from "react";
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
import { mockApplications } from "@/lib/mockData";
import { Application } from "@/types/auth";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";

export default function CompanyApplications() {
  const { toast } = useToast();
  const [applications, setApplications] = useState(mockApplications);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleStatusChange = (applicationId: string, newStatus: string) => {
    // In a real app, this would update the status in Supabase
    const updatedApplications = applications.map(app => 
      app.id === applicationId 
        ? { ...app, status: newStatus as Application["status"] } 
        : app
    );
    
    setApplications(updatedApplications);
    
    toast({
      title: "Status Updated",
      description: `The application status has been updated to ${newStatus}.`,
    });
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
  
  const filteredApplications = applications.filter(app => {
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesSearch = !searchTerm || 
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  return (
    <DashboardLayout title="Applications">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            className="pl-9"
            placeholder="Search by job title or candidate ID"
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
      
      {filteredApplications.length > 0 ? (
        <div className="space-y-6">
          {filteredApplications.map((application) => (
            <GlassCard key={application.id} className="animate-fade-in">
              <div className="md:flex justify-between">
                <div>
                  <div className="flex items-start md:items-center flex-col md:flex-row gap-0 md:gap-3">
                    <h3 className="text-xl font-bold text-white">
                      {application.job.title}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-1 mb-2">
                    Candidate ID: {application.employeeId.substring(0, 8)}...
                  </p>
                  
                  <p className="text-xs text-gray-400">
                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                  
                  <div className="mt-4 mb-4 md:mb-0">
                    <p className="text-sm text-white mb-1">Update Status:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={application.status === "reviewing" ? "bg-blue-500/20" : ""}
                        onClick={() => handleStatusChange(application.id, "reviewing")}
                      >
                        Reviewing
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={application.status === "accepted" ? "bg-green-500/20" : ""}
                        onClick={() => handleStatusChange(application.id, "accepted")}
                      >
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={application.status === "rejected" ? "bg-red-500/20" : ""}
                        onClick={() => handleStatusChange(application.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-col justify-center gap-2">
                  <Button>View Details</Button>
                  <Button variant="outline">View Resume</Button>
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
