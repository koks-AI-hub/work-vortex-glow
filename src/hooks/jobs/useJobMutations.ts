
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob, updateJobStatus } from "@/api/jobs-api";
import { toast } from "@/hooks/use-toast";
import { Job } from "@/types/auth";

export function useJobMutations() {
  const queryClient = useQueryClient();

  // Create a job (for companies)
  const createJobMutation = useMutation({
    mutationFn: async (jobData: Omit<Job, 'id' | 'company' | 'postedAt' | 'isActive'>) => {
      return createJob(jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job Created",
        description: "Your job posting has been published."
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create job. Please try again."
      });
    }
  });
  
  // Update job status (for companies)
  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: string; isActive: boolean }) => {
      return updateJobStatus(jobId, isActive);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', data.id] });
      toast({
        title: "Job Updated",
        description: "Job status has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update job. Please try again."
      });
    }
  });

  return {
    createJobMutation,
    updateJobStatusMutation
  };
}
