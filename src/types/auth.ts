
export type UserRole = "employee" | "company";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
}

export interface Employee extends User {
  role: "employee";
  profileImage?: string;
  resume?: string;
  skills: string[];
  experiences: Experience[];
}

export interface Company extends User {
  role: "company";
  sector: string;
  logo?: string;
  description?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
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
  salary?: string;
  postedAt: string;
  deadline?: string;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  employeeId: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  appliedAt: string;
}

export interface AuthState {
  user: User | Employee | Company | null;
  isLoading: boolean;
  error: string | null;
}
