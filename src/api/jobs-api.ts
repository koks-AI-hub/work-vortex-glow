
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/auth";

// Transform database job to our frontend job format
export function transformJob(job: any): Job {
  return {
    id: job.id,
    title: job.title || "Unknown Job",
    company: job.company_name || "Unknown Company",
    companyId: job.company_id,
    location: job.location || "Unknown Location",
    type: job.type || "Unknown Type",
    description: job.description || "No description provided.",
    requirements: job.requirements || [],
    salary: job.salary || "Not specified",
    postedAt: job.posted_at,
    deadline: job.deadline,
    isActive: job.is_active !== undefined ? job.is_active : true
  };
}

// Fetch all active jobs
export async function fetchJobs(searchQuery: string = "") {
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
      is_active,
      companies!inner(id, sector)
    `)
    .eq('is_active', true)
    .order('posted_at', { ascending: false });
  
  // Apply search if provided
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching jobs:", error.message);
    throw error;
  }
  
  return data.map((job: any) => ({
    id: job.id,
    title: job.title,
    company: job.companies.name,
    companyId: job.company_id,
    location: job.location,
    type: job.type,
    description: job.description,
    requirements: job.requirements,
    salary: job.salary,
    postedAt: job.posted_at,
    deadline: job.deadline,
    isActive: job.is_active
  }));
}

// Get job by ID
export async function fetchJobById(jobId: string) {
  try {
    const { data, error } = await supabase.rpc('get_job_with_company_info', { job_id: jobId });
    
    if (error) {
      console.error("RPC Error:", error.message);
      throw error;
    }
    if (!data || data.length === 0) {
      console.warn(`Job with ID ${jobId} not found in RPC response.`);
      throw new Error("Job not found");
    }
    
    return transformJob(data[0]);
  } catch (error: any) {
    console.error("Error fetching job:", error);
    throw error;
  }
}

// Fetch jobs for a specific company
export async function fetchCompanyJobs(companyId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', companyId)
    .order('posted_at', { ascending: false });
  
  if (error) throw error;
  return data.map(transformJob);
}

// Create a new job
export async function createJob(jobData: Omit<Job, 'id' | 'company' | 'postedAt' | 'isActive'>) {
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
}

// Update job status
export async function updateJobStatus(jobId: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('jobs')
    .update({ is_active: isActive })
    .eq('id', jobId)
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}
