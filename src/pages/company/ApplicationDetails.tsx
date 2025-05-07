
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ApplicationDetails } from "@/types/auth";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useApplications } from "@/hooks/useApplications";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  MapPin,
  AtSign,
  Phone,
  User,
  FileText,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Use the existing hook for application details
  const { useApplicationDetails, updateStatusMutation } = useApplications();
  
  // Fetch application details
  const { data: application, isLoading, error } = useApplicationDetails(id || "");
  
  // Status update handler
  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    
    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        applicationId: id,
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating application status:", error);
    } finally {
      setIsUpdating(false);
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

  if (isLoading) {
    return (
      <DashboardLayout title="Application Details">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-vortex-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !application) {
    return (
      <DashboardLayout title="Application Details">
        <GlassCard className="text-center py-10">
          <XCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-1">Error Loading Application</h3>
          <p className="text-gray-400 mb-6">
            {error instanceof Error ? error.message : "There was an error loading the application details."}
          </p>
          <Button asChild>
            <Link to="/company/applications">Back to Applications</Link>
          </Button>
        </GlassCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Application Details">
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/company/applications" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Link>
        </Button>
      </div>
      
      <GlassCard className="animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{application.job_title}</h1>
              {getStatusBadge(application.status)}
            </div>
            <div className="flex items-center mt-1 text-gray-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{application.location || "Remote"}</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-gray-400">
              Applied on {formatDate(application.applied_at)}
              {application.updated_at && application.status !== "pending" && (
                <div className="text-xs">
                  Status updated on {formatDate(application.updated_at)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Separator className="my-6 bg-white/10" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Applicant Details</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Name</div>
                  <div className="text-gray-400">{application.employee_name}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <AtSign className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Email</div>
                  <div className="text-gray-400">{application.employee_email}</div>
                </div>
              </div>
              
              {application.employee_phone && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">Phone</div>
                    <div className="text-gray-400">{application.employee_phone}</div>
                  </div>
                </div>
              )}
              
              {application.employee_resume_url && (
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">Resume</div>
                    <Button variant="link" className="h-auto p-0 text-vortex-400" asChild>
                      <a 
                        href={application.employee_resume_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        View Resume
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Application Status</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Applied Date</div>
                  <div className="text-gray-400">{formatDate(application.applied_at)}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Status</div>
                  <div className="flex items-center">
                    {getStatusBadge(application.status)}
                    {application.updated_at && application.status !== "pending" && (
                      <span className="text-gray-400 text-xs ml-2">
                        Updated: {formatDate(application.updated_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="font-medium text-white mb-2">Update Status</div>
                <div className="flex items-center space-x-3">
                  <Select
                    defaultValue={application.status}
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-6 bg-white/10" />
        
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Job Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Position</p>
              <p className="text-white font-medium">{application.job_title}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Company</p>
              <p className="text-white font-medium">{application.job_company_name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Applied On</p>
              <p className="text-white font-medium">{formatDate(application.applied_at)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Location</p>
              <p className="text-white font-medium">{application.location || "Remote"}</p>
            </div>
          </div>
        </div>
        
        {application.status === "accepted" && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-green-300 text-lg font-semibold mb-2 flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Application Accepted
            </h3>
            <p className="text-green-100/70">
              You have accepted this candidate's application. Consider reaching out to them via email 
              to discuss the next steps in the hiring process.
            </p>
          </div>
        )}
        
        {application.status === "rejected" && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-red-300 text-lg font-semibold mb-2 flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              Application Rejected
            </h3>
            <p className="text-red-100/70">
              You have rejected this application. The candidate will be notified about the status change.
            </p>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button asChild variant="outline">
            <Link to={`/company/jobs/${application.job_id}`}>View Job Posting</Link>
          </Button>
          
          {application.employee_resume_url && (
            <Button asChild>
              <a 
                href={application.employee_resume_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Resume
              </a>
            </Button>
          )}
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
