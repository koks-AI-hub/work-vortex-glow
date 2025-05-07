import { Experience } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Pencil, Trash2Icon, Loader2 } from "lucide-react";

interface ExperienceListProps {
  experiences: Experience[];
  onAddClick?: () => void;
  onEditClick?: (experience: Experience) => void;
  onDeleteClick?: (id: string) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function ExperienceList({
  experiences,
  onAddClick,
  onEditClick,
  onDeleteClick,
  isLoading = false,
  readOnly = false
}: ExperienceListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (experiences.length === 0) {
    return (
      <GlassCard className="text-center py-10">
        <p className="text-gray-400 mb-4">No experience information available.</p>
        {!readOnly && onAddClick && (
          <Button onClick={onAddClick} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Add Experience"
            )}
          </Button>
        )}
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {experiences.map((experience) => (
        <GlassCard key={experience.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-white">{experience.role}</h3>
              <p className="text-gray-400">{experience.company}</p>
              <p className="text-sm text-gray-500">
                {formatDate(experience.startDate)} - {experience.current ? "Present" : formatDate(experience.endDate as string)}
              </p>
              {experience.description && (
                <p className="mt-2 text-gray-300">{experience.description}</p>
              )}
            </div>
            {!readOnly && (
              <div className="flex gap-2">
                {onEditClick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditClick(experience)}
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDeleteClick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteClick(experience.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2Icon className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
