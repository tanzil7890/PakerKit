import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveButtonProps {
  isSaving: boolean;
  isNewTemplate: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}

const SaveButton = ({ isSaving, isNewTemplate, hasUnsavedChanges, onSave }: SaveButtonProps) => {
  const getButtonText = () => {
    if (isSaving) return "Saving...";
    if (isNewTemplate) return "Save";
    if (hasUnsavedChanges) return "Save Changes";
    return "Saved";
  };

  return (
    <Button
      onClick={onSave}
      disabled={isSaving || (!hasUnsavedChanges && !isNewTemplate)}
      className="min-w-[120px] transition-all"
      variant={hasUnsavedChanges ? "default" : "outline"}
    >
      <Save className={`mr-2 h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
      {getButtonText()}
    </Button>
  );
};

export default SaveButton; 