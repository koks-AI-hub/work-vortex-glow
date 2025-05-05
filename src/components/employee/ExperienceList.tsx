
import { EditIcon, Trash2Icon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Experience } from "@/types/auth";

interface ExperienceListProps {
  experiences: Experience[];
  onAddClick: () => void;
  onEditClick: (experience: Experience) => void;
  onDeleteClick: (id: string) => void;
}

export function ExperienceList({ 
  experiences, 
  onAddClick,
  onEditClick, 
  onDeleteClick 
}: ExperienceListProps) {
  if (experiences.length === 0) {
    return (
      <GlassCard className="text-center py-8">
        <p className="text-gray-400 mb-4">You haven't added any work experience yet.</p>
        <Button 
          onClick={onAddClick} 
          className="flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Your First Experience
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {experiences.map((experience) => (
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
                onClick={() => onEditClick(experience)}
              >
                <EditIcon className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={() => onDeleteClick(experience.id)}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
