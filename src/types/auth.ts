
import { Database } from "@/integrations/supabase/types";

export type UserRole = "employee" | "company";

// Base user interface with common fields
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  created_at?: string;
}

// Employee interface extends User with employee-specific fields
export interface Employee extends User {
  role: "employee";
  profileImage: string | null;
  resume: string | null;
  experiences: Experience[];
}

// Company interface extends User with company-specific fields
export interface Company extends User {
  role: "company";
  sector: string;
  logo: string | null;
  description: string | null;
}

// Experience interface for employee work history
export interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string; // ISO date string
  endDate?: string | null; // ISO date string
  current: boolean;
  description?: string | null;
}

// Job posting interface
export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary?: string | null;
  postedAt: string; // ISO date string
  deadline?: string | null; // ISO date string
  isActive: boolean;
}

// Job application interface
export interface Application {
  id: string;
  jobId: string;
  job: Job;
  employeeId: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  appliedAt: string; // ISO date string
}

// Application details from database RPC function
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
  location?: string; // Make location optional
}

// Auth state for managing authentication context
export interface AuthState {
  user: User | Employee | Company | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
}

// Helper types for Supabase Database tables
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbEmployee = Database['public']['Tables']['employees']['Row'];
export type DbCompany = Database['public']['Tables']['companies']['Row'];
export type DbJob = Database['public']['Tables']['jobs']['Row'];
export type DbApplication = Database['public']['Tables']['applications']['Row'];
export type DbExperience = Database['public']['Tables']['experiences']['Row'];
