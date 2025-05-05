
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/auth";
import { toast } from "@/hooks/use-toast";

// Transform database job to our frontend job format
function transformJob(job: any): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.company_name || "",
    companyId: job.company_id,
    location: job.location,
    type: job.type,
    description: job.description,
    requirements: job.requirements || [],
    salary: job.salary,
    postedAt: job.posted_at,
    deadline: job.deadline
  };
}

export function useJobs() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get all jobs
  const { 
    data: jobs,
    isLoading: isLoadingJobs,
    error: jobsError,
    refetch: refetchJobs
  } = useQuery({
    queryKey: ['jobs', searchQuery],
    queryFn: async () => {
      let query = supabase.from('jobs')
        .select(`
          id, 
          title, 
          location, 
          type, 
          description, 
          salary, 
          requirements,
          posted_at,
          deadline,
          company_id,
          companies!inner(id, sector),
          profiles!inner(id, name)
        `)
        .eq('is_active', true)
        .order('posted_at', { ascending: false });
      
      // Apply search if provided
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }
      
      return data.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.profiles.name,
        companyId: job.company_id,
        location: job.location,
        type: job.type,
        description: job.description,
        requirements: job.requirements,
        salary: job.salary,
        postedAt: job.posted_at,
        deadline: job.deadline
      }));
    }
  });
  
  // Get job by ID
  const getJobById = async (jobId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_job_with_company_info', { job_id: jobId });
      
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Job not found");
      
      return transformJob(data[0]);
    } catch (error: any) {
      console.error("Error fetching job:", error);
      throw error;
    }
  };

  // Query for a single job
  const useJob = (jobId: string) => {
    return useQuery({
      queryKey: ['job', jobId],
      queryFn: () => getJobById(jobId),
      enabled: !!jobId
    });
  };
  
  // Create a job (for companies)
  const createJobMutation = useMutation({
    mutationFn: async (jobData: Omit<Job, 'id' | 'company' | 'postedAt'>) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          company_id: jobData.companyId,
          title: jobData.title,
          location: jobData.location,
          type: jobData.type,
          description: jobData.description,
          requirements: jobData.requirements,
          salary: jobData.salary,
          deadline: jobData.deadline,
          is_active: true
        })
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('jobs')
        .update({ is_active: isActive })
        .eq('id', jobId)
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
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
  
  // Get company jobs
  const useCompanyJobs = (companyId: string) => {
    return useQuery({
      queryKey: ['company-jobs', companyId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', companyId)
          .order('posted_at', { ascending: false });
        
        if (error) throw error;
        return data.map(transformJob);
      },
      enabled: !!companyId
    });
  };

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
