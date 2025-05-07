
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/hooks/useApplications";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, FileText, MapPin, Briefcase, Building, X, Loader2, Mail, Phone } from "lucide-react";

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { useApplicationDetails, updateStatusMutation } = useApplications();
  
  const { data: application, isLoading, error, refetch } = useApplicationDetails(id || "");
  
  // Add loading state for resume view
  const [viewingResume, setViewingResume] = useState(false);
  
  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    try {
      await updateStatusMutation.mutateAsync({
        applicationId: id,
        status: newStatus
      });
      
      // Refetch the application details to show updated status
      refetch();
    } catch (error) {
      console.error("Error updating status:", error);
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
          <X className="h-10 w-10 text-red-400 mx-auto mb-4" />
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{application.job.title}</h1>
                  {getStatusBadge(application.status)}
                </div>
                <div className="flex items-center mt-1 text-gray-400">
                  <Building className="h-4 w-4 mr-1" />
                  <span>{application.job.company}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="text-sm text-gray-400">
                  Applied on {formatDate(application.appliedAt)}
                </div>
                {application.updatedAt && application.status !== "pending" && (
                  <div className="text-sm text-gray-400">
                    Status updated on {formatDate(application.updatedAt)}
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-6 bg-white/10" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Applicant Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-vortex-700/50 flex items-center justify-center mr-3">
                      {application.employee.profilePicture ? (
                        <img 
                          src={application.employee.profilePicture} 
                          alt={application.employee.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        application.employee.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">{application.employee.name}</div>
                      <div className="text-gray-400">Candidate</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium text-white">Email</div>
                      <div className="text-gray-400">{application.employee.email}</div>
                    </div>
                  </div>
                  
                  {application.employee.phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                      <div>
                        <div className="font-medium text-white">Phone</div>
                        <div className="text-gray-400">{application.employee.phone}</div>
                      </div>
                    </div>
                  )}
                  
                  {application.employee.resumeUrl && (
                    <div className="pt-2">
                      <Button 
                        variant="outline"
                        className="w-full flex items-center justify-center"
                        onClick={() => {
                          setViewingResume(true);
                          // Open resume in a new tab
                          window.open(application.employee.resumeUrl, '_blank');
                          setTimeout(() => setViewingResume(false), 1000);
                        }}
                        disabled={viewingResume}
                      >
                        {viewingResume ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Opening Resume...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            View Resume
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Application Status</h3>
                <div className="space-y-6">
                  <div className="flex flex-col space-y-2 relative before:absolute before:left-[15px] before:h-full before:w-[1px] before:bg-gray-600/30 before:top-6">
                    <div className="flex items-start z-10">
                      <div className="h-5 w-5 rounded-full bg-vortex-500 flex items-center justify-center mr-3">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                      <div>
                        <div className="font-medium text-white">Applied</div>
                        <div className="text-xs text-gray-400">
                          {new Date(application.appliedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {application.status !== "pending" && application.updatedAt && (
                      <div className="flex items-start ml-0 pt-6 z-10">
                        <div className={`h-5 w-5 rounded-full mr-3 flex items-center justify-center ${
                          application.status === "reviewing" ? "bg-blue-500" :
                          application.status === "accepted" ? "bg-green-500" : "bg-red-500"
                        }`}>
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            Status Updated to {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(application.updatedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white mb-2">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={application.status === "reviewing" ? "bg-blue-500/20" : ""}
                        onClick={() => handleStatusChange("reviewing")}
                        disabled={updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending && application.status !== "reviewing" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Reviewing
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={application.status === "accepted" ? "bg-green-500/20" : ""}
                        onClick={() => handleStatusChange("accepted")}
                        disabled={updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending && application.status !== "accepted" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={application.status === "rejected" ? "bg-red-500/20" : ""}
                        onClick={() => handleStatusChange("rejected")}
                        disabled={updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending && application.status !== "rejected" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
        
        <div className="lg:col-span-1">
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Job Details</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-vortex-400 mr-3" />
                <div className="text-white">{application.job.title}</div>
              </div>
              
              <div className="flex items-center">
                <Building className="h-5 w-5 text-vortex-400 mr-3" />
                <div className="text-white">{application.job.company}</div>
              </div>
              
              <Button 
                asChild
                className="w-full mt-4"
                variant="outline"
              >
                <Link to={`/company/jobs/${application.job.id}`}>
                  View Complete Job Details
                </Link>
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
