
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, FileText, MapPin, Briefcase, Building, X, Loader2 } from "lucide-react";

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application-details', id],
    queryFn: async () => {
      // First check if the application belongs to the current user
      const { data: applicationCheck, error: checkError } = await supabase
        .from('applications')
        .select('employee_id')
        .eq('id', id)
        .single();
        
      if (checkError) throw checkError;
      
      if (applicationCheck.employee_id !== user?.id) {
        throw new Error('Unauthorized access to application details');
      }
      
      // Get detailed application data
      const { data, error } = await supabase.rpc(
        'get_application_details',
        { application_id: id }
      );
      
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Application not found');
      
      return data[0];
    },
    enabled: !!id && !!user
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
            <Link to="/employee/applications">Back to Applications</Link>
          </Button>
        </GlassCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Application Details">
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/employee/applications" className="flex items-center">
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
          </div>
        </div>
        
        <Separator className="my-6 bg-white/10" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Job Details</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Briefcase className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Position</div>
                  <div className="text-gray-400">{application.job_title}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <Building className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Company</div>
                  <div className="text-gray-400">{application.job_company_name}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-vortex-400 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Location</div>
                  <div className="text-gray-400">{application.location || "Not specified"}</div>
                </div>
              </div>
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
        </div>
        
        <Separator className="my-6 bg-white/10" />
        
        {application.status === "accepted" && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-green-300 text-lg font-semibold mb-2">
              Congratulations! Your application has been accepted.
            </h3>
            <p className="text-green-100/70">
              The employer has reviewed your application and would like to proceed with the next steps. 
              You may be contacted soon for more information or for an interview.
            </p>
          </div>
        )}
        
        {application.status === "reviewing" && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-blue-300 text-lg font-semibold mb-2">
              Your application is being reviewed.
            </h3>
            <p className="text-blue-100/70">
              The employer is currently reviewing your application. You'll be notified when there's an update on your application status.
            </p>
          </div>
        )}
        
        {application.status === "rejected" && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-red-300 text-lg font-semibold mb-2">
              Unfortunately, your application was not selected.
            </h3>
            <p className="text-red-100/70">
              The employer has reviewed your application and has decided to proceed with other candidates. 
              Don't be discouraged - keep applying for other opportunities that match your skills.
            </p>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button asChild variant="outline">
            <Link to="/employee/jobs">Browse More Jobs</Link>
          </Button>
          
          {application.employee_resume_url && (
            <Button asChild variant="outline">
              <a href={application.employee_resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                View My Resume
              </a>
            </Button>
          )}
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
