import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/context/AuthContext";
import { Employee } from "@/types/auth";
import { ProfileForm, ProfileFormValues } from "@/components/employee/ProfileForm";
import { ProfileMedia } from "@/components/employee/ProfileMedia";
import { ExperienceList } from "@/components/employee/ExperienceList";
import { useToast } from "@/components/ui/use-toast";

export default function EmployeeProfile() {
  const { toast } = useToast();
  const { user, updateUser, uploadProfileImage, uploadResume } = useAuth();
  const employee = user?.role === 'employee' ? user as Employee : null;
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileUpdate = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      await updateUser(data);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageChange = async (file: File) => {
    try {
      setIsLoading(true);
      await uploadProfileImage(file);
      toast({
        title: "Profile Image Updated",
        description: "Your profile image has been updated successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload profile image. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResumeUpload = async (file: File) => {
    try {
      setIsLoading(true);
      await uploadResume(file);
      toast({
        title: "Resume Updated",
        description: "Your resume has been uploaded successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload resume. Please try again."
      });
    } finally {
      setIsLoading(false);
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
          <ProfileMedia
            employee={employee}
            onProfileImageChange={handleProfileImageChange}
            onResumeUpload={handleResumeUpload}
            isLoading={isLoading}
          />

          <div className="flex-grow">
            <ProfileForm 
              user={user}
              onSubmit={handleProfileUpdate}
              isLoading={isLoading}
            />
          </div>
        </div>
      </GlassCard>

      {/* Experience Section - Read Only */}
      <GlassCard className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Experience</h2>
        <ExperienceList
          experiences={employee.experiences || []}
          readOnly={true}
        />
      </GlassCard>
    </DashboardLayout>
  );
}
