
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { 
  EditIcon, 
  PlusIcon, 
  Trash2Icon, 
  UploadIcon, 
  UserRound, 
  Loader2,
} from "lucide-react";
import { Experience, Employee } from "@/types/auth";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
});

const experienceSchema = z.object({
  role: z.string().min(2, "Role is required"),
  company: z.string().min(2, "Company name is required"),
  startDate: z.string().min(2, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

export default function EmployeeProfile() {
  const { user, updateUser, uploadProfileImage, uploadResume, addExperience, updateExperience, deleteExperience } = useAuth();
  const employee = user?.role === 'employee' ? user as Employee : null;
  
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [uploading, setUploading] = useState<"profile" | "resume" | null>(null);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
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

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    await updateUser(data);
  };

  const resetExperienceForm = () => {
    experienceForm.reset({
      role: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    setEditingExperience(null);
  };

  const onExperienceSubmit = async (data: z.infer<typeof experienceSchema>) => {
    if (editingExperience) {
      await updateExperience({
        ...data,
        id: editingExperience.id,
        role: data.role,
        company: data.company,
        startDate: data.startDate,
        endDate: data.endDate || null,
        current: data.current,
        description: data.description || null,
      });
    } else {
      await addExperience({
        role: data.role,
        company: data.company,
        startDate: data.startDate,
        endDate: data.endDate || null,
        current: data.current,
        description: data.description || null,
      });
    }
    
    setIsAddingExperience(false);
    resetExperienceForm();
  };

  const handleEditExperience = (experience: Experience) => {
    experienceForm.reset({
      role: experience.role,
      company: experience.company,
      startDate: experience.startDate,
      endDate: experience.endDate || "",
      current: experience.current,
      description: experience.description || "",
    });
    setEditingExperience(experience);
    setIsAddingExperience(true);
  };

  const handleCancelExperience = () => {
    setIsAddingExperience(false);
    resetExperienceForm();
  };

  const handleDeleteExperience = async (id: string) => {
    await deleteExperience(id);
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setUploading("profile");
    try {
      await uploadProfileImage(file);
    } finally {
      setUploading(null);
    }
  };
  
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setUploading("resume");
    try {
      await uploadResume(file);
    } finally {
      setUploading(null);
    }
  };

  // Only show employee-specific content if user is an employee
  if (!employee) {
    return (
      <DashboardLayout title="Profile">
        <GlassCard className="text-center py-10">
          <p className="text-gray-400">Please log in as an employee to view this page.</p>
        </GlassCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile">
      {/* Profile Section */}
      <GlassCard className="mb-6">
        <div className="md:flex items-start gap-8">
          <div className="flex flex-col items-center mb-6 md:mb-0">
            <div className="relative">
              {employee.profileImage ? (
                <img 
                  src={employee.profileImage} 
                  alt={employee.name} 
                  className="h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-vortex-700/50 flex items-center justify-center">
                  <UserRound className="h-16 w-16 text-white" />
                </div>
              )}
              
              <label 
                htmlFor="profile-upload" 
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-vortex-500 flex items-center justify-center cursor-pointer"
              >
                {uploading === "profile" ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <UploadIcon className="h-4 w-4 text-white" />
                )}
              </label>
              <input 
                id="profile-upload" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleProfileImageChange}
                disabled={uploading === "profile"}
              />
            </div>
            
            <div className="mt-4 w-full">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                asChild
              >
                <label 
                  htmlFor="resume-upload"
                  className="cursor-pointer flex items-center"
                >
                  {uploading === "resume" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      {employee.resume ? "Update Resume" : "Upload Resume"}
                    </>
                  )}
                </label>
              </Button>
              <input 
                id="resume-upload" 
                type="file" 
                className="hidden" 
                accept=".pdf,.doc,.docx" 
                onChange={handleResumeUpload}
                disabled={uploading === "resume"}
              />
              
              {employee.resume && (
                <div className="text-center mt-2">
                  <a 
                    href={employee.resume} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-vortex-400 hover:underline"
                  >
                    View Current Resume
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <Input {...field} disabled />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Update Profile</Button>
              </form>
            </Form>
          </div>
        </div>
      </GlassCard>

      {/* Experience Section */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Experience</h2>
        {!isAddingExperience && (
          <Button 
            onClick={() => setIsAddingExperience(true)} 
            className="flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        )}
      </div>

      {/* Add/Edit Experience Form */}
      {isAddingExperience && (
        <GlassCard className="mb-6 animate-fade-in">
          <Form {...experienceForm}>
            <form onSubmit={experienceForm.handleSubmit(onExperienceSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormLabel className="m-0">I currently work here</FormLabel>
                    </FormItem>
                  )}
                />
                
                {!experienceForm.watch("current") && (
                  <FormField
                    control={experienceForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
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
                        placeholder="Briefly describe your responsibilities and achievements..." 
                        className="h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingExperience ? "Update" : "Add"} Experience
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelExperience}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </GlassCard>
      )}

      {/* Experience List */}
      {employee.experiences && employee.experiences.length > 0 ? (
        <div className="space-y-4">
          {employee.experiences.map((experience) => (
            <GlassCard key={experience.id} className="animate-fade-in">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{experience.role}</h3>
                  <p className="text-gray-300">{experience.company}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(experience.startDate).toLocaleDateString()} - {" "}
                    {experience.current ? "Present" : new Date(experience.endDate as string).toLocaleDateString()}
                  </p>
                  {experience.description && (
                    <p className="mt-2 text-gray-300">{experience.description}</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleEditExperience(experience)}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    onClick={() => handleDeleteExperience(experience.id)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-8">
          <p className="text-gray-400 mb-4">You haven't added any work experience yet.</p>
          {!isAddingExperience && (
            <Button 
              onClick={() => setIsAddingExperience(true)} 
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Your First Experience
            </Button>
          )}
        </GlassCard>
      )}
    </DashboardLayout>
  );
}
