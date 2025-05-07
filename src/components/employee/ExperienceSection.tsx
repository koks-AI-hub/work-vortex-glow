import { useState } from "react";
import { PlusIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Experience } from "@/types/auth";
import { ExperienceForm, ExperienceFormValues } from "./ExperienceForm";
import { ExperienceList } from "./ExperienceList";

interface ExperienceSectionProps {
  experiences: Experience[];
  onAddExperience: (data: ExperienceFormValues) => Promise<void>;
  onUpdateExperience: (id: string, data: ExperienceFormValues) => Promise<void>;
  onDeleteExperience: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function ExperienceSection({
  experiences,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  isLoading = false
}: ExperienceSectionProps) {
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  const handleAddClick = () => {
    setIsAddingExperience(true);
    setEditingExperience(null);
  };

  const handleEditClick = (experience: Experience) => {
    setEditingExperience(experience);
    setIsAddingExperience(true);
  };

  const handleCancelClick = () => {
    setIsAddingExperience(false);
    setEditingExperience(null);
  };

  const handleSubmit = async (data: ExperienceFormValues) => {
    try {
      if (editingExperience) {
        await onUpdateExperience(editingExperience.id, data);
      } else {
        await onAddExperience(data);
      }
      
      setIsAddingExperience(false);
      setEditingExperience(null);
    } catch (error) {
      // Error is handled by the parent component
      console.error("Error submitting experience:", error);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Experience</h2>
        {!isAddingExperience && (
          <Button 
            onClick={handleAddClick} 
            className="flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Experience
              </>
            )}
          </Button>
        )}
      </div>

      {isAddingExperience && (
        <GlassCard className="mb-6 animate-fade-in">
          <ExperienceForm 
            experience={editingExperience} 
            onSubmit={handleSubmit}
            onCancel={handleCancelClick}
            isLoading={isLoading}
          />
        </GlassCard>
      )}

      <ExperienceList
        experiences={experiences}
        onAddClick={handleAddClick}
        onEditClick={handleEditClick}
        onDeleteClick={onDeleteExperience}
        isLoading={isLoading}
      />
    </>
  );
}
