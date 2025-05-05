
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { PlusIcon, TrashIcon, Loader2 } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useNavigate } from "react-router-dom";

const jobSchema = z.object({
  title: z.string().min(2, "Title is required"),
  location: z.string().min(2, "Location is required"),
  type: z.string().min(2, "Job type is required"),
  description: z.string().min(10, "Description is too short"),
  salary: z.string().optional(),
  deadline: z.string().optional(),
});

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createJobMutation } = useJobs();
  const [requirements, setRequirements] = useState<string[]>([""]);

  // Redirect if not company
  if (user && user.role !== 'company') {
    navigate('/');
    return null;
  }
  
  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      location: "",
      type: "Full-time",
      description: "",
      salary: "",
      deadline: "",
    },
  });
  
  const addRequirement = () => {
    setRequirements([...requirements, ""]);
  };
  
  const removeRequirement = (index: number) => {
    const newRequirements = [...requirements];
    newRequirements.splice(index, 1);
    setRequirements(newRequirements);
  };
  
  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };
  
  const onSubmit = async (data: z.infer<typeof jobSchema>) => {
    if (!user) return;
    
    // Filter out empty requirements
    const validRequirements = requirements.filter(req => req.trim() !== "");
    
    try {
      await createJobMutation.mutateAsync({
        title: data.title,
        companyId: user.id,
        location: data.location,
        type: data.type,
        description: data.description,
        requirements: validRequirements,
        salary: data.salary || null,
        deadline: data.deadline || null
      });
      
      // Reset form after successful submission
      form.reset();
      setRequirements([""]);
      
      // Redirect to company dashboard
      navigate('/company/dashboard');
    } catch (error) {
      console.error("Error posting job:", error);
    }
  };
  
  return (
    <DashboardLayout title="Post a New Job">
      <GlassCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Frontend Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Remote, New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md bg-transparent border border-input px-3 py-2 text-sm"
                        {...field}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Range (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. $70,000 - $90,000" {...field} />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Jobs with salary information get more applications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="col-span-full md:col-span-1">
                    <FormLabel>Application Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the role, responsibilities, and company..." 
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Provide a detailed description of the job role and what candidates can expect.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <FormLabel>Requirements</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addRequirement}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Requirement
                </Button>
              </div>
              
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder={`e.g. ${index === 0 ? '3+ years React experience' : '2+ years TypeScript experience'}`}
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    className="flex-grow"
                  />
                  
                  {requirements.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeRequirement(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-1">
                List specific requirements, skills, or qualifications needed for this role.
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={createJobMutation.isPending}
            >
              {createJobMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : "Publish Job Listing"}
            </Button>
          </form>
        </Form>
      </GlassCard>
    </DashboardLayout>
  );
}
