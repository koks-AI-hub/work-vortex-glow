
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  MapPin,
  Briefcase,
  Building,
  AlertCircle,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useJobs } from "@/hooks/useJobs";
import { useApplications } from "@/hooks/useApplications";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  
  const { useJob, updateJobStatusMutation } = useJobs();
  const { data: job, isLoading, error } = useJob(id || "");
  
  // Count applications for this job
  const { useJobApplicationsCount } = useApplications();
  const { data: applicationCount = 0, isLoading: loadingCount } = useJobApplicationsCount(id || "");
  
  const handleStatusToggle = async () => {
    if (!job) return;
    
    try {
      await updateJobStatusMutation.mutateAsync({
        jobId: job.id,
        isActive: !job.isActive
      });
      
      toast({
        title: job.isActive ? "Job Deactivated" : "Job Activated",
        description: job.isActive 
          ? "The job listing has been deactivated and is no longer visible to candidates." 
          : "The job listing is now active and visible to candidates."
      });
      
      setShowDeactivateDialog(false);
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
  
  if (isLoading) {
    return (
      <DashboardLayout title="Job Details">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-vortex-500" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !job) {
    return (
      <DashboardLayout title="Job Details">
        <GlassCard className="text-center py-10">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-1">Error Loading Job</h3>
          <p className="text-gray-400 mb-6">
            {error instanceof Error ? error.message : "Job not found or an error occurred."}
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
      <div className="mb-4 flex justify-between items-center">
        <Button variant="outline" size="sm" asChild>
          <Link to="/company/jobs" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
        
        <div>
          <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                variant={job.isActive ? "destructive" : "default"} 
                disabled={updateJobStatusMutation.isPending}
                className="mr-2"
              >
                {updateJobStatusMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : job.isActive ? (
                  "Deactivate Job"
                ) : (
                  "Activate Job"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{job.isActive ? "Deactivate Job?" : "Activate Job?"}</AlertDialogTitle>
                <AlertDialogDescription>
                  {job.isActive 
                    ? "This will make the job invisible to candidates. Any ongoing applications will still be accessible."
                    : "This will make the job visible to candidates again and they will be able to apply."
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleStatusToggle}
                  className={job.isActive ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  {job.isActive ? "Yes, deactivate" : "Yes, activate"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button asChild>
            <Link to={`/company/applications?job=${job.id}`}>
              View Applications ({loadingCount ? "..." : applicationCount})
            </Link>
          </Button>
        </div>
      </div>
      
      {!job.isActive && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Job Inactive</AlertTitle>
          <AlertDescription>
            This job is currently not visible to candidates. Activate it to start receiving applications.
          </AlertDescription>
        </Alert>
      )}
      
      <GlassCard className="animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{job.title}</h1>
              <Badge variant="outline" className={job.isActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}>
                {job.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" className="bg-vortex-500/20 text-vortex-300">
                {job.type}
              </Badge>
            </div>
            
            <div className="flex items-center text-gray-400">
              <Building className="h-4 w-4 mr-1" />
              <span>{job.company}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center text-gray-300">
            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
            {job.location}
          </div>
          
          <div className="flex items-center text-gray-300">
            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
            Posted {formatDate(job.postedAt)}
          </div>
          
          {job.deadline && (
            <div className="flex items-center text-gray-300">
              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
              Expires {formatDate(job.deadline)}
            </div>
          )}
          
          <div className="flex items-center text-gray-300">
            <Users className="h-4 w-4 mr-1 text-gray-400" />
            {loadingCount ? (
              <Loader2 className="h-3 w-3 animate-spin text-vortex-400 ml-1" />
            ) : (
              `${applicationCount} application${applicationCount !== 1 ? 's' : ''}`
            )}
          </div>
        </div>
        
        <Separator className="my-6 bg-white/10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Job Description</h2>
            <div className="text-gray-300 whitespace-pre-wrap">
              {job.description}
            </div>
            
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Requirements</h2>
            <ul className="list-disc pl-5 text-gray-300 space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <GlassCard className="bg-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">Job Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Salary</p>
                  <p className="text-white font-medium">{job.salary || "Not specified"}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Job Type</p>
                  <p className="text-white font-medium">{job.type}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-medium">{job.location}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <div className="flex items-center">
                    {job.isActive ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-400 mr-1.5" />
                        <p className="text-green-400 font-medium">Active</p>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-400 mr-1.5" />
                        <p className="text-red-400 font-medium">Inactive</p>
                      </>
                    )}
                  </div>
                </div>
                
                {job.deadline && (
                  <div>
                    <p className="text-gray-400 text-sm">Application Deadline</p>
                    <p className="text-white font-medium">{formatDate(job.deadline)}</p>
                  </div>
                )}
              </div>
              
              <Separator className="my-4 bg-white/10" />
              
              <div className="flex flex-col gap-2">
                <Button
                  variant={job.isActive ? "destructive" : "default"}
                  onClick={() => setShowDeactivateDialog(true)}
                  disabled={updateJobStatusMutation.isPending}
                >
                  {job.isActive ? "Deactivate Job" : "Activate Job"}
                </Button>
                
                <Button asChild variant="outline">
                  <Link to="/company/applications" className="w-full flex justify-center">
                    View All Applications
                  </Link>
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
