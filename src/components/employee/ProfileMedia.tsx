import { Employee } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface ProfileMediaProps {
  employee: Employee;
  onProfileImageChange: (file: File) => Promise<void>;
  onResumeUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileMedia({ employee, onProfileImageChange, onResumeUpload, isLoading = false }: ProfileMediaProps) {
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onProfileImageChange(file);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onResumeUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <div className="h-32 w-32 rounded-full bg-vortex-700/50 flex items-center justify-center overflow-hidden">
          {employee.profile_picture ? (
            <img 
              src={employee.profile_picture} 
              alt={employee.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 text-white">
              <Upload className="h-full w-full" />
            </div>
          )}
        </div>
        <label 
          htmlFor="profile-image" 
          className="absolute bottom-0 right-0 bg-vortex-500 rounded-full p-2 cursor-pointer hover:bg-vortex-600 transition-colors"
        >
          <input
            type="file"
            id="profile-image"
            accept="image/*"
            className="hidden"
            onChange={handleProfileImageChange}
            disabled={isLoading}
          />
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Upload className="h-4 w-4 text-white" />
          )}
        </label>
      </div>

      <div className="flex flex-col items-center gap-2">
        <label 
          htmlFor="resume" 
          className="flex items-center gap-2 px-4 py-2 bg-vortex-500 rounded-lg cursor-pointer hover:bg-vortex-600 transition-colors"
        >
          <input
            type="file"
            id="resume"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleResumeUpload}
            disabled={isLoading}
          />
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Upload className="h-4 w-4 text-white" />
          )}
          <span className="text-white">
            {employee.resume_url ? "Update Resume" : "Upload Resume"}
          </span>
        </label>
        {employee.resume_url && (
          <a 
            href={employee.resume_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-vortex-400 hover:text-vortex-300"
          >
            View Current Resume
          </a>
        )}
      </div>
    </div>
  );
}
