
import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJobs } from "@/hooks/useJobs";
import { useApplications } from "@/hooks/useApplications";
import { useAuth } from "@/context/AuthContext";
import { Job } from "@/types/auth";
import { 
  Briefcase, 
  Calendar, 
  CheckCircle,
  Loader2, 
  MapPin, 
  Search, 
  Timer, 
  X 
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function JobFeed() {
  const { user } = useAuth();
  const { jobs, isLoadingJobs, searchQuery, setSearchQuery } = useJobs();
  const { applyMutation, useHasApplied } = useApplications();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Check if user has already applied when a job is selected
  const { data: hasApplied, isLoading: checkingApplication } = useHasApplied(
    selectedJob?.id || "",
    user?.id
  );

  const handleApply = async () => {
    if (!user || !selectedJob) return;
    
    setIsApplying(true);
    try {
      await applyMutation.mutateAsync({
        jobId: selectedJob.id,
        employeeId: user.id
      });
      // Close dialog after successful application
      setTimeout(() => {
        setSelectedJob(null);
      }, 1000);
    } finally {
      setIsApplying(false);
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
    <DashboardLayout title="Job Feed">
      {/* Search Bar */}
      <GlassCard className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            className="pl-10 pr-4 py-6 text-lg rounded-lg"
            placeholder="Search jobs by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Job Listings */}
      {isLoadingJobs ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-vortex-500" />
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <GlassCard 
              key={job.id} 
              className="animate-fade-in transition-all hover:bg-white/10" 
              hoverEffect
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{job.title}</h3>
                <span className="px-2 py-1 bg-vortex-500/20 text-vortex-300 text-xs rounded-full">
                  {job.type}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-300 mb-3">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
                  {job.company}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  Posted {formatDate(job.postedAt)}
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">{job.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {job.requirements && job.requirements.slice(0, 3).map((req, idx) => (
                  <span 
                    key={idx}
                    className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded"
                  >
                    {req}
                  </span>
                ))}
                {job.requirements && job.requirements.length > 3 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded">
                          +{job.requirements.length - 3} more
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          {job.requirements.slice(3).map((req, idx) => (
                            <div key={idx} className="mb-1">{req}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-vortex-400 font-medium">
                  {job.salary || "Salary not specified"}
                  {job.deadline && (
                    <span className="flex items-center text-sm text-gray-400">
                      <Timer className="h-3.5 w-3.5 mr-1" />
                      Apply before {formatDate(job.deadline)}
                    </span>
                  )}
                </div>
                <Button onClick={() => setSelectedJob(job)}>View Details</Button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-10">
          <X className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-1">No Jobs Found</h3>
          {searchQuery ? (
            <>
              <p className="text-gray-400">No jobs match your search criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </>
          ) : (
            <p className="text-gray-400">Check back later for new job opportunities.</p>
          )}
        </GlassCard>
      )}

      {/* Job Details Dialog */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap gap-2 mt-1">
                <span className="bg-vortex-500/20 text-vortex-300 px-2 py-0.5 rounded text-sm">
                  {selectedJob.type}
                </span>
                <span className="flex items-center text-gray-400 text-sm">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {selectedJob.company}
                </span>
                <span className="flex items-center text-gray-400 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {selectedJob.location}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2">Description</h4>
                <p className="text-gray-300 whitespace-pre-line">{selectedJob.description}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Requirements</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedJob.requirements?.map((req, idx) => (
                    <li key={idx} className="text-gray-300">{req}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-700">
                <div>
                  {selectedJob.salary && (
                    <p className="text-vortex-400 font-medium">{selectedJob.salary}</p>
                  )}
                  {selectedJob.deadline && (
                    <p className="flex items-center text-sm text-gray-400">
                      <Timer className="h-4 w-4 mr-1" />
                      Apply before {formatDate(selectedJob.deadline)}
                    </p>
                  )}
                </div>
                
                {checkingApplication ? (
                  <Button disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </Button>
                ) : hasApplied ? (
                  <Button disabled variant="outline" className="bg-green-500/20">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Already Applied
                  </Button>
                ) : isApplying ? (
                  <Button disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleApply}>Apply Now</Button>
                    <Button variant="outline" asChild>
                      <Link to="/employee/dashboard">Save for Later</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
