
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, Calendar, MapPin, Building, Clock, Loader2, X } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useJobs } from "@/hooks/useJobs";
import { useApplications } from "@/hooks/useApplications";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { useJob, updateJobStatusMutation } = useJobs();
  const { useCompanyApplications } = useApplications();
  
  const { data: job, isLoading: loadingJob, error: jobError } = useJob(id || "");
  const { data: applications, isLoading: loadingApps } = useCompanyApplications(user?.id);
  
  // Filter applications for this job
  const jobApplications = applications?.filter(app => app.jobId === id);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const toggleJobStatus = async () => {
    if (!job) return;
    
    try {
      await updateJobStatusMutation.mutateAsync({
        jobId: job.id,
        isActive: !job.is_active, 
      });
      
      toast({
        title: job.is_active ? "Job Deactivated" : "Job Activated",
        description: `The job listing has been ${job.is_active ? "deactivated" : "activated"}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update job status.",
      });
    }
  };

  if (loadingJob) {
    return (
      <DashboardLayout title="Job Details">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-vortex-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (jobError || !job) {
    return (
      <DashboardLayout title="Job Details">
        <GlassCard className="text-center py-10">
          <X className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-1">Error Loading Job</h3>
          <p className="text-gray-400 mb-6">
            The job listing you requested could not be found.
          </p>
          <Button asChild>
            <Link to="/company/jobs">Back to Jobs</Link>
          </Button>
        </GlassCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Job Details">
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/company/jobs" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                  <Badge variant="outline" className={job.is_active ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}>
                    {job.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-gray-300 mb-6">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1 text-gray-400" />
                    {job.company}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-vortex-500/20 text-vortex-300">
                      {job.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-gray-300 mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    Posted: {formatDate(job.postedAt)}
                  </div>
                  {job.deadline && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      Deadline: {formatDate(job.deadline)}
                    </div>
                  )}
                </div>
                
                <Separator className="my-6 bg-white/10" />
                
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-3">Job Description</h2>
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {job.description}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-3">Requirements</h2>
                  <ul className="list-disc pl-5 text-gray-300">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="mb-1">{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-3">Salary</h2>
                  <p className="text-gray-300">{job.salary || "Not specified"}</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={toggleJobStatus}
                    variant={job.is_active ? "destructive" : "default"}
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
                  
                  {/* Add Edit Job button here when implementing that feature */}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
        
        <div className="lg:col-span-1">
          <GlassCard>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-vortex-400" />
              Applications
              {jobApplications && jobApplications.length > 0 && (
                <Badge className="ml-2 bg-vortex-500">{jobApplications.length}</Badge>
              )}
            </h2>
            
            {loadingApps ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-vortex-500" />
              </div>
            ) : jobApplications && jobApplications.length > 0 ? (
              <div className="space-y-3">
                {jobApplications.map((application) => (
                  <div 
                    key={application.id}
                    className="p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">
                          Applicant ID: {application.employeeId.substring(0, 8)}...
                        </p>
                        <p className="text-xs text-gray-400">
                          Applied: {formatDate(application.appliedAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        application.status === "pending" 
                          ? "bg-yellow-500/20 text-yellow-300"
                          : application.status === "reviewing"
                          ? "bg-blue-500/20 text-blue-300"
                          : application.status === "accepted"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" asChild>
                        <Link to={`/company/applications/${application.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/company/applications">View All Applications</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">No applications received yet for this job.</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
