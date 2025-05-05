
import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Search, UserRound, Loader2, FileText, Plus, X } from "lucide-react";
import { useSearchEmployees } from "@/hooks/useSearchEmployees";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const experienceSchema = z.object({
  role: z.string().min(2, "Role is required"),
  company: z.string().min(2, "Company name is required"),
  startDate: z.string().min(2, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

export default function SearchWorkers() {
  const { toast } = useToast();
  const { 
    isLoading, 
    employee, 
    experiences, 
    searchPerformed, 
    searchByPhone,
    addExperience
  } = useSearchEmployees();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addingExperience, setAddingExperience] = useState(false);
  
  const experienceForm = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      role: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  });

  const handleSearch = () => {
    if (!phoneNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Please enter a phone number to search.",
      });
      return;
    }
    
    searchByPhone(phoneNumber);
  };
  
  const onExperienceSubmit = async (data: z.infer<typeof experienceSchema>) => {
    if (!employee) return;
    
    try {
      const success = await addExperience(employee.id, data);
      if (success) {
        setAddingExperience(false);
        experienceForm.reset();
      }
    } catch (error) {
      console.error("Error adding experience:", error);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <DashboardLayout title="Search Workers">
      <GlassCard className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Find Worker by Phone Number</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-9"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : "Search"}
          </Button>
        </div>
      </GlassCard>
      
      {searchPerformed && (
        isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-vortex-500" />
          </div>
        ) : employee ? (
          <GlassCard className="animate-fade-in">
            <div className="md:flex gap-6">
              <div className="mb-6 md:mb-0">
                <div className="h-24 w-24 rounded-full bg-vortex-700/50 flex items-center justify-center mb-4">
                  {employee.profile_picture ? (
                    <img 
                      src={employee.profile_picture} 
                      alt={employee.name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-12 w-12 text-white" />
                  )}
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
                  </div>
                  <Dialog open={addingExperience} onOpenChange={setAddingExperience}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-2 md:mt-0">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Experience
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Experience</DialogTitle>
                        <DialogDescription>
                          Add work experience to {employee.name}'s profile.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...experienceForm}>
                        <form onSubmit={experienceForm.handleSubmit(onExperienceSubmit)} className="space-y-4 mt-4">
                          <FormField
                            control={experienceForm.control}
                            name="role"
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
                            control={experienceForm.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Acme Inc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={experienceForm.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={experienceForm.control}
                              name="current"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-8">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="h-4 w-4 text-vortex-500 border-gray-400 rounded focus:ring-vortex-500"
                                    />
                                  </FormControl>
                                  <FormLabel className="m-0">Currently works here</FormLabel>
                                </FormItem>
                              )}
                            />
                            
                            {!experienceForm.watch("current") && (
                              <FormField
                                control={experienceForm.control}
                                name="endDate"
                                render={({ field }) => (
                                  <FormItem className="col-span-2">
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                          
                          <FormField
                            control={experienceForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe responsibilities and achievements..." 
                                    className="h-24"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setAddingExperience(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">
                              Add Experience
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white">{employee.phone}</p>
                  </div>
                </div>
                
                {/* Resume link if available */}
                {employee.resume_url && (
                  <div className="mb-6">
                    <a 
                      href={employee.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-vortex-400 hover:text-vortex-300"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Resume
                    </a>
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-white mb-3">Experience</h3>
                {experiences && experiences.length > 0 ? (
                  <div className="space-y-3">
                    {experiences.map((exp: any) => (
                      <div 
                        key={exp.id}
                        className="p-3 border border-white/10 rounded-lg bg-white/5"
                      >
                        <h4 className="text-md font-medium text-white">{exp.role}</h4>
                        <p className="text-gray-400">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(exp.start_date)} - {" "}
                          {exp.current ? "Present" : formatDate(exp.end_date)}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-300 mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No experience information available.</p>
                )}
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="text-center py-10 animate-fade-in">
            <X className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No employee found with that phone number.</p>
            <p className="text-sm text-gray-500">Try a different phone number or check the format.</p>
          </GlassCard>
        )
      )}
    </DashboardLayout>
  );
}
