
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ApplicationDetails as AppDetails } from "@/types/auth"; 
import { useApplications } from "@/hooks/useApplications";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, FileText, MapPin, Briefcase, Building, X, Loader2, UserRound, Mail, Phone } from "lucide-react";

export default function ApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { updateStatusMutation } = useApplications();
  
  // Get application details
  const { data: application, isLoading, error } = useQuery<AppDetails, Error>({
    queryKey: ['application-details', id],
    queryFn: async () => {
      // First check if the application belongs to one of the company's jobs
      const { data: applicationCheck, error: checkError } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          jobs!inner(company_id)
        `)
        .eq('id', id)
        .single();
        
      if (checkError) throw checkError;
      
      if (applicationCheck.jobs.company_id !== user?.id) {
        throw new Error('Unauthorized access to application details');
      }
      
      // Get detailed application data
      const { data, error } = await supabase.rpc(
        'get_application_details',
        { application_id: id }
      );
      
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Application not found');
      
      return { 
        ...data[0],
        location: data[0].location || "Remote"  // Default location if not available
      };
    },
    enabled: !!id && !!user
  });

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    try {
      await updateStatusMutation.mutateAsync({
        applicationId: id,
        status: newStatus
      });
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

  if (isLoading || updateStatusMutation.isPending) {
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
      
      <GlassCard className="animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{application.job_title}</h1>
              {getStatusBadge(application.status)}
            </div>
            <div className="flex items-center mt-1 text-gray-400">
              <Building className="h-4 w-4 mr-1" />
              <span>{application.job_company_name}</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-gray-400">
              Applied on {formatDate(application.applied_at)}
            </div>
            {application.updated_at && application.status !== "pending" && (
              <div className="text-xs text-gray-500">
                Last updated: {formatDate(application.updated_at)}
              </div>
            )}
          </div>
        </div>
        
        <Separator className="my-6 bg-white/10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate Information */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-white mb-4">Candidate Information</h3>
            <div className="flex flex-col items-center p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="mb-4">
                {application.employee_profile_picture ? (
                  <img 
                    src={application.employee_profile_picture} 
                    alt={application.employee_name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-vortex-700/50 flex items-center justify-center">
                    <UserRound className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              
              <h4 className="text-lg font-medium text-white">{application.employee_name}</h4>
              
              <div className="w-full mt-4 space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-300">{application.employee_email}</span>
                </div>
                
                {application.employee_phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-300">{application.employee_phone}</span>
                  </div>
                )}
                
                {application.employee_resume_url && (
                  <Button asChild variant="outline" className="w-full mt-2">
                    <a href={application.employee_resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                      <FileText className="h-4 w-4 mr-2" />
                      View Resume
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Job and Application Details */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-4">Application Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">Position</div>
                    <div className="text-gray-400">{application.job_title}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">Location</div>
                    <div className="text-gray-400">{application.location || "Remote"}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">Application Date</div>
                    <div className="text-gray-400">{formatDate(application.applied_at)}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`h-5 w-5 rounded-full mr-3 mt-1 flex items-center justify-center ${
                    application.status === "pending" ? "bg-yellow-500" :
                    application.status === "reviewing" ? "bg-blue-500" :
                    application.status === "accepted" ? "bg-green-500" : "bg-red-500"
                  }`}>
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <div>
                    <div className="font-medium text-white">Current Status</div>
                    <div className={
                      application.status === "pending" ? "text-yellow-300" :
                      application.status === "reviewing" ? "text-blue-300" :
                      application.status === "accepted" ? "text-green-300" : "text-red-300"
                    }>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      {application.updated_at && application.status !== "pending" && (
                        <span className="text-gray-400 text-xs block">
                          Updated on {formatDate(application.updated_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border border-white/10 rounded-lg p-4 mb-6">
              <h4 className="text-md font-medium text-white mb-2">Update Application Status</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={application.status === "reviewing" ? "bg-blue-500/20" : ""}
                  onClick={() => handleStatusChange("reviewing")}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark as Reviewing
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={application.status === "accepted" ? "bg-green-500/20" : ""}
                  onClick={() => handleStatusChange("accepted")}
                  disabled={updateStatusMutation.isPending}
                >
                  Accept Application
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={application.status === "rejected" ? "bg-red-500/20" : ""}
                  onClick={() => handleStatusChange("rejected")}
                  disabled={updateStatusMutation.isPending}
                >
                  Reject Application
                </Button>
              </div>
            </div>
            
            {application.status === "accepted" && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-green-300 text-lg font-semibold mb-2">
                  Application Accepted
                </h3>
                <p className="text-green-100/70">
                  You have accepted this candidate's application. Consider reaching out to {application.employee_name} via email to discuss next steps.
                </p>
              </div>
            )}
            
            {application.status === "rejected" && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-red-300 text-lg font-semibold mb-2">
                  Application Rejected
                </h3>
                <p className="text-red-100/70">
                  You have declined this candidate's application. They will be notified about this decision.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <Separator className="my-6 bg-white/10" />
        
        <div className="flex justify-between">
          <Button asChild variant="outline">
            <Link to="/company/applications">Back to Applications</Link>
          </Button>
          
          <Button asChild>
            <Link to={`/company/jobs/${application.job_id}`}>View Job Listing</Link>
          </Button>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
