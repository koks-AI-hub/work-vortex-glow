
import { useQuery } from "@tanstack/react-query";
import { fetchJobs, fetchJobById, fetchCompanyJobs } from "@/api/jobs-api";

export function useJobQueries(searchQuery: string = "") {
  // Get all jobs
  const { 
    data: jobs,
    isLoading: isLoadingJobs,
    error: jobsError,
    refetch: refetchJobs
  } = useQuery({
    queryKey: ['jobs', searchQuery],
    queryFn: () => fetchJobs(searchQuery)
  });

  // Query for a single job
  const useJob = (jobId: string) => {
    return useQuery({
      queryKey: ['job', jobId],
      queryFn: () => fetchJobById(jobId),
      enabled: !!jobId
    });
  };

  // Get company jobs
  const useCompanyJobs = (companyId: string) => {
    return useQuery({
      queryKey: ['company-jobs', companyId],
      queryFn: () => fetchCompanyJobs(companyId),
      enabled: !!companyId
    });
  };

  return {
    jobs,
    isLoadingJobs,
    jobsError,
    refetchJobs,
    useJob,
    useCompanyJobs
  };
}
