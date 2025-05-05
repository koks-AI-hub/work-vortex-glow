
import { useState } from "react";
import { UserRound, UploadIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types/auth";

interface ProfileMediaProps {
  employee: Employee;
  onProfileImageChange: (file: File) => Promise<void>;
  onResumeUpload: (file: File) => Promise<void>;
}

export function ProfileMedia({ 
  employee, 
  onProfileImageChange, 
  onResumeUpload 
}: ProfileMediaProps) {
  const [uploading, setUploading] = useState<"profile" | "resume" | null>(null);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setUploading("profile");
    try {
      await onProfileImageChange(file);
    } finally {
      setUploading(null);
    }
  };
  
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setUploading("resume");
    try {
      await onResumeUpload(file);
    } finally {
      setUploading(null);
    }
  };

  return (
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
  );
}
