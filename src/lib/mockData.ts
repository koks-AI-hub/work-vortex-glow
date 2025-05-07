
import { Job, Application, Experience } from "@/types/auth";

// Mock jobs data
export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Frontend Developer",
    company: "TechFlow Systems",
    companyId: "comp-1",
    location: "Remote",
    type: "Full-time",
    description: "We're looking for an experienced frontend developer proficient in React and TypeScript to join our growing team.",
    requirements: ["3+ years React experience", "TypeScript", "Responsive design", "State management"],
    salary: "$80,000 - $110,000",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: "job-2",
    title: "UX/UI Designer",
    company: "DesignHub",
    companyId: "comp-2",
    location: "New York, NY",
    type: "Full-time",
    description: "Join our creative team designing beautiful interfaces for enterprise clients.",
    requirements: ["Figma", "User research", "Design systems", "Prototyping"],
    salary: "$90,000 - $120,000",
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: "job-3",
    title: "Backend Engineer",
    company: "DataStack",
    companyId: "comp-3",
    location: "Remote",
    type: "Contract",
    description: "Help build scalable backend services for our data processing platform.",
    requirements: ["Node.js", "PostgreSQL", "API design", "Cloud infrastructure"],
    salary: "$50 - $70/hour",
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: "job-4",
    title: "DevOps Specialist",
    company: "CloudScale",
    companyId: "comp-4",
    location: "San Francisco, CA",
    type: "Full-time",
    description: "Manage and improve our cloud infrastructure and deployment pipelines.",
    requirements: ["AWS", "Terraform", "CI/CD", "Kubernetes"],
    salary: "$120,000 - $150,000",
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: "job-5",
    title: "Product Manager",
    company: "InnovateCorp",
    companyId: "comp-5",
    location: "Boston, MA",
    type: "Full-time",
    description: "Lead product development for our flagship SaaS platform.",
    requirements: ["3+ years product management", "SaaS experience", "Agile methodologies"],
    salary: "$110,000 - $140,000",
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
];

// Mock applications data
export const mockApplications: Application[] = [
  {
    id: "app-1",
    jobId: "job-1",
    job: mockJobs[0],
    employeeId: "user-123",
    status: "reviewing",
    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "app-2",
    jobId: "job-3",
    job: mockJobs[2],
    employeeId: "user-123",
    status: "pending",
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock experiences data
export const mockExperiences: Experience[] = [
  {
    id: "exp-1",
    role: "Frontend Developer",
    company: "WebTech Solutions",
    startDate: "2019-06-01",
    endDate: "2021-08-15",
    current: false,
    description: "Developed responsive web applications using React and TypeScript.",
  },
  {
    id: "exp-2",
    role: "UI Designer",
    company: "CreativeMinds Agency",
    startDate: "2018-01-15",
    endDate: "2019-05-30",
    current: false,
    description: "Created user interfaces and design systems for mobile and web applications.",
  },
];
