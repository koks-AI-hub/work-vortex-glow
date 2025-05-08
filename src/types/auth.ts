export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "employee" | "company";
}

export interface Employee extends User {
  role: "employee";
  profileImage?: string;
  resume?: string;
  experiences: Experience[];
}

export interface Company extends User {
  role: "company";
  logo?: string;
  description?: string;
  sector: string;
}

export interface Experience {
  id: string;
  employeeId: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary: string;
  postedAt: string;
  deadline: string | null;
  isActive: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  employeeId: string;
  status: string;
  appliedAt: string;
}

export interface ApplicationDetails {
  id: string;
  status: string;
  applied_at: string;
  updated_at: string;
  job_id: string;
  job_title: string;
  job_company_name: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  employee_phone: string;
  employee_profile_picture: string;
  employee_resume_url: string;
  location: string;  // Added the location field to align with the updated Supabase function
}
