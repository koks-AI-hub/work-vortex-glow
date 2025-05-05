
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { EditIcon, PlusIcon, Trash2Icon, UploadIcon, UserRound } from "lucide-react";
import { mockExperiences } from "@/lib/mockData";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const experienceSchema = z.object({
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

export default function EmployeeProfile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState(mockExperiences);
  const [isAddingExperience, setIsAddingExperience] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      title: "",
      bio: "",
      location: "",
      website: "",
    },
  });

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

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateUser(data);
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };

  const onExperienceSubmit = (data: z.infer<typeof experienceSchema>) => {
    const newExperience = {
      ...data,
      id: `exp-${Date.now()}`,
    };
    
    setExperiences([...experiences, newExperience]);
    setIsAddingExperience(false);
    experienceForm.reset();
    
    toast({
      title: "Experience added",
      description: "Your experience entry has been added to your profile.",
    });
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
    toast({
      title: "Experience removed",
      description: "The experience entry has been removed from your profile.",
    });
  };

  return (
    <DashboardLayout title="Profile">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="glass-panel">
          <TabsTrigger value="info">Personal Information</TabsTrigger>
          <TabsTrigger value="experience">Skills & Experience</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <GlassCard className="flex flex-col items-center justify-center p-8">
                <div className="h-32 w-32 rounded-full bg-vortex-700/50 flex items-center justify-center mb-4 relative">
                  <UserRound className="h-16 w-16 text-white" />
                  <Button 
                    size="icon" 
                    className="absolute bottom-0 right-0 rounded-full" 
                    variant="secondary"
                  >
                    <UploadIcon className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-gray-400">Software Engineer</p>
                
                <div className="mt-6 w-full">
                  <Button variant="outline" className="w-full mb-2">
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload New Photo
                  </Button>
                </div>
              </GlassCard>
            </div>
            
            <div className="md:col-span-2">
              <GlassCard>
                <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Senior Developer" {...field} />
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
                              <Input placeholder="e.g. New York, NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourwebsite.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell employers about yourself..." 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full sm:w-auto">
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </GlassCard>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="experience" className="mt-6">
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Experience</h2>
              {!isAddingExperience && (
                <Button onClick={() => setIsAddingExperience(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              )}
            </div>
            
            {isAddingExperience && (
              <div className="mb-8 p-4 border border-white/10 rounded-lg bg-white/5">
                <h3 className="text-lg font-bold text-white mb-4">Add New Experience</h3>
                <Form {...experienceForm}>
                  <form onSubmit={experienceForm.handleSubmit(onExperienceSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={experienceForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Senior Developer" {...field} />
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
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                disabled={experienceForm.watch("current")}
                                {...field}
                                value={experienceForm.watch("current") ? "" : field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="current"
                        checked={experienceForm.watch("current")}
                        onChange={(e) => experienceForm.setValue("current", e.target.checked)}
                        className="rounded-sm bg-transparent border border-gray-500"
                      />
                      <label htmlFor="current" className="text-sm text-gray-300">
                        I currently work here
                      </label>
                    </div>
                    
                    <FormField
                      control={experienceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your responsibilities and achievements..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex space-x-2">
                      <Button type="submit">Save Experience</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddingExperience(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
            
            {experiences.length > 0 ? (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div 
                    key={exp.id} 
                    className="p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">{exp.role}</h3>
                        <p className="text-gray-400">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(exp.startDate).toLocaleDateString()} - {" "}
                          {exp.current ? "Present" : new Date(exp.endDate as string).toLocaleDateString()}
                        </p>
                        {exp.description && (
                          <p className="text-gray-300 mt-2">{exp.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="icon" variant="ghost">
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => handleRemoveExperience(exp.id)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-white/20 rounded-lg">
                <p className="text-gray-400 mb-2">No experience entries yet</p>
                {!isAddingExperience && (
                  <Button onClick={() => setIsAddingExperience(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                )}
              </div>
            )}
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <GlassCard>
            <h2 className="text-xl font-bold text-white mb-6">Documents</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium text-white mb-2">Resume/CV</h3>
                <p className="text-gray-400 text-center mb-4">Upload your resume or CV in PDF, DOCX, or RTF format</p>
                <Button>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Resume
                </Button>
              </div>
              
              <div className="p-6 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium text-white mb-2">Cover Letter</h3>
                <p className="text-gray-400 text-center mb-4">Upload a general cover letter to use for applications</p>
                <Button>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Cover Letter
                </Button>
              </div>
              
              <div className="p-6 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium text-white mb-2">Portfolio</h3>
                <p className="text-gray-400 text-center mb-4">Upload portfolio samples or link to your online portfolio</p>
                <Button>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Portfolio
                </Button>
              </div>
              
              <div className="p-6 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium text-white mb-2">Other Documents</h3>
                <p className="text-gray-400 text-center mb-4">Upload certificates, references, or other documents</p>
                <Button>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
