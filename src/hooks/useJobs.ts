
import { useState } from "react";
import { useJobQueries } from "./jobs/useJobQueries";
import { useJobMutations } from "./jobs/useJobMutations";
import { fetchJobById } from "@/api/jobs-api";

export function useJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get job queries (all jobs, single job, company jobs)
  const { 
    jobs, 
    isLoadingJobs, 
    jobsError, 
    refetchJobs, 
    useJob, 
    useCompanyJobs 
  } = useJobQueries(searchQuery);
  
  // Get job mutations (create, update)
  const { createJobMutation, updateJobStatusMutation } = useJobMutations();
  
  // Export the getJobById function directly for use in other hooks
  const getJobById = fetchJobById;

  return {
    jobs,
    isLoadingJobs,
    jobsError,
    refetchJobs,
    searchQuery,
    setSearchQuery,
    getJobById,
    useJob,
    createJobMutation,
    updateJobStatusMutation,
    useCompanyJobs
  };
}
