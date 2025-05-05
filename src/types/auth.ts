
import { Database } from "@/integrations/supabase/types";

export type UserRole = "employee" | "company";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
}

export interface Employee extends User {
  role: "employee";
  profileImage?: string | null;
  resume?: string | null;
  experiences: Experience[];
}

export interface Company extends User {
  role: "company";
  sector: string;
  logo?: string | null;
  description?: string | null;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string; // ISO date string
  endDate?: string | null; // ISO date string
  current: boolean;
  description?: string | null;
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
  salary?: string | null;
  postedAt: string; // ISO date string
  deadline?: string | null; // ISO date string
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  employeeId: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  appliedAt: string; // ISO date string
}

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
