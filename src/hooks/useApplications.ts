
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job, Application } from "@/types/auth";
import { toast } from "@/hooks/use-toast";
import { useJobs } from "./useJobs";

export function useApplications() {
  const queryClient = useQueryClient();
  const { getJobById } = useJobs();
  
  // Transform database application to our frontend format
  const transformApplication = async (application: any): Promise<Application> => {
    // Fetch job details for each application
    let job: Job;
    try {
      job = await getJobById(application.job_id);
    } catch (error) {
      // Fallback if job details can't be fetched
      job = {
        id: application.job_id,
        title: "Unknown Job",
        company: "Unknown Company",
        companyId: "",
        location: "",
        type: "",
        description: "",
        requirements: [],
        postedAt: application.applied_at
      };
    }
    
    return {
      id: application.id,
      jobId: application.job_id,
      job,
      employeeId: application.employee_id,
      status: application.status,
      appliedAt: application.applied_at
    };
  };
  
  // Get employee applications
  const useEmployeeApplications = (employeeId: string | undefined) => {
    return useQuery({
      queryKey: ['applications', 'employee', employeeId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            job_id,
            employee_id,
            status,
            applied_at,
            updated_at
          `)
          .eq('employee_id', employeeId)
          .order('applied_at', { ascending: false });
          
        if (error) throw error;
        
        // Transform all applications (fetch job details in parallel)
        const transformPromises = data.map(transformApplication);
        return Promise.all(transformPromises);
      },
      enabled: !!employeeId
    });
  };
  
  // Get company applications (for jobs posted by the company)
  const useCompanyApplications = (companyId: string | undefined) => {
    return useQuery({
      queryKey: ['applications', 'company', companyId],
      queryFn: async () => {
        // Get applications for jobs posted by this company
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            job_id,
            employee_id,
            status,
            applied_at,
            updated_at,
            jobs!inner(id, company_id)
          `)
          .eq('jobs.company_id', companyId)
          .order('applied_at', { ascending: false });
          
        if (error) throw error;
        
        // Transform all applications
        const transformPromises = data.map(transformApplication);
        return Promise.all(transformPromises);
      },
      enabled: !!companyId
    });
  };
  
  // Apply for a job
  const applyMutation = useMutation({
    mutationFn: async ({ jobId, employeeId }: { jobId: string; employeeId: string }) => {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          employee_id: employeeId,
          status: 'pending'
        })
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted."
      });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({
          variant: "destructive",
          title: "Already Applied",
          description: "You have already applied to this job."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to submit application. Please try again."
        });
      }
    }
  });
  
  // Update application status (for companies)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const { data, error } = await supabase
        .from('applications')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Status Updated",
        description: "The application status has been updated."
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update status. Please try again."
      });
    }
  });
  
  // Check if user has applied to a specific job
  const useHasApplied = (jobId: string, employeeId: string | undefined) => {
    return useQuery({
      queryKey: ['hasApplied', jobId, employeeId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('employee_id', employeeId)
          .maybeSingle();
        
        if (error) throw error;
        return !!data; // Convert to boolean (true if data exists)
      },
      enabled: !!jobId && !!employeeId
    });
  };
  
  // Get application details
  const useApplicationDetails = (applicationId: string) => {
    return useQuery({
      queryKey: ['application', applicationId],
      queryFn: async () => {
        const { data, error } = await supabase.rpc(
          'get_application_details',
          { application_id: applicationId }
        );
        
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("Application not found");
        
        const appDetails = data[0];
        
        // Format the application data
        return {
          id: appDetails.id,
          status: appDetails.status,
          appliedAt: appDetails.applied_at,
          updatedAt: appDetails.updated_at,
          job: {
            id: appDetails.job_id,
            title: appDetails.job_title,
            company: appDetails.job_company_name
          },
          employee: {
            id: appDetails.employee_id,
            name: appDetails.employee_name,
            email: appDetails.employee_email,
            phone: appDetails.employee_phone,
            profilePicture: appDetails.employee_profile_picture,
            resumeUrl: appDetails.employee_resume_url
          }
        };
      },
      enabled: !!applicationId
    });
  };

  return {
    useEmployeeApplications,
    useCompanyApplications,
    applyMutation,
    updateStatusMutation,
    useHasApplied,
    useApplicationDetails
  };
}
