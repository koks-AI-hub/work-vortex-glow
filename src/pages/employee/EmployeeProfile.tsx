
import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/context/AuthContext";
import { Employee } from "@/types/auth";
import { ProfileForm, ProfileFormValues } from "@/components/employee/ProfileForm";
import { ProfileMedia } from "@/components/employee/ProfileMedia";
import { ExperienceSection } from "@/components/employee/ExperienceSection";
import { ExperienceFormValues } from "@/components/employee/ExperienceForm";

export default function EmployeeProfile() {
  const { user, updateUser, uploadProfileImage, uploadResume, addExperience, updateExperience, deleteExperience } = useAuth();
  const employee = user?.role === 'employee' ? user as Employee : null;

  const handleProfileUpdate = async (data: ProfileFormValues) => {
    await updateUser(data);
  };

  const handleProfileImageChange = async (file: File) => {
    await uploadProfileImage(file);
  };
  
  const handleResumeUpload = async (file: File) => {
    await uploadResume(file);
  };

  const handleAddExperience = async (data: ExperienceFormValues) => {
    await addExperience({
      role: data.role,
      company: data.company,
      startDate: data.startDate,
      endDate: data.endDate || null,
      current: data.current,
      description: data.description || null,
    });
  };

  const handleUpdateExperience = async (id: string, data: ExperienceFormValues) => {
    await updateExperience({
      id,
      role: data.role,
      company: data.company,
      startDate: data.startDate,
      endDate: data.endDate || null,
      current: data.current,
      description: data.description || null,
    });
  };

  const handleDeleteExperience = async (id: string) => {
    await deleteExperience(id);
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
          />

          <div className="flex-grow">
            <ProfileForm 
              user={user}
              onSubmit={handleProfileUpdate}
            />
          </div>
        </div>
      </GlassCard>

      {/* Experience Section */}
      <ExperienceSection
        experiences={employee.experiences}
        onAddExperience={handleAddExperience}
        onUpdateExperience={handleUpdateExperience}
        onDeleteExperience={handleDeleteExperience}
      />
    </DashboardLayout>
  );
}
