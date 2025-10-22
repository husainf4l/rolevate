import { WorkExperience } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}

function SortableWorkItem({
  experience,
  onUpdate,
  onDelete,
}: {
  experience: WorkExperience;
  onUpdate: (exp: WorkExperience) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: experience.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleChange = (field: keyof WorkExperience, value: string) => {
    onUpdate({ ...experience, [field]: value });
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-2 text-muted-foreground hover-elevate p-1 rounded"
          data-testid={`drag-handle-${experience.id}`}
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`position-${experience.id}`} className="text-sm font-medium">
                Position
              </Label>
              <Input
                id={`position-${experience.id}`}
                data-testid={`input-position-${experience.id}`}
                placeholder="Software Engineer"
                value={experience.position}
                onChange={(e) => handleChange("position", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor={`company-${experience.id}`} className="text-sm font-medium">
                Company
              </Label>
              <Input
                id={`company-${experience.id}`}
                data-testid={`input-company-${experience.id}`}
                placeholder="Acme Inc."
                value={experience.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`location-${experience.id}`} className="text-sm font-medium">
                Location
              </Label>
              <Input
                id={`location-${experience.id}`}
                data-testid={`input-location-${experience.id}`}
                placeholder="San Francisco, CA"
                value={experience.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor={`startDate-${experience.id}`} className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id={`startDate-${experience.id}`}
                data-testid={`input-startdate-${experience.id}`}
                placeholder="Jan 2020"
                value={experience.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor={`endDate-${experience.id}`} className="text-sm font-medium">
                End Date
              </Label>
              <Input
                id={`endDate-${experience.id}`}
                data-testid={`input-enddate-${experience.id}`}
                placeholder="Present"
                value={experience.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`description-${experience.id}`} className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id={`description-${experience.id}`}
              data-testid={`textarea-description-${experience.id}`}
              placeholder="Describe your responsibilities and achievements..."
              value={experience.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="mt-1.5 min-h-[100px]"
            />
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          data-testid={`button-delete-${experience.id}`}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

export default function WorkExperienceForm({ experiences, onChange }: WorkExperienceFormProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = experiences.findIndex((exp) => exp.id === active.id);
      const newIndex = experiences.findIndex((exp) => exp.id === over.id);
      onChange(arrayMove(experiences, oldIndex, newIndex));
    }
  };

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `work-${Date.now()}`,
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    onChange([...experiences, newExp]);
  };

  const updateExperience = (id: string, updated: WorkExperience) => {
    onChange(experiences.map((exp) => (exp.id === id ? updated : exp)));
  };

  const deleteExperience = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={experiences.map((exp) => exp.id)} strategy={verticalListSortingStrategy}>
          {experiences.map((exp) => (
            <SortableWorkItem
              key={exp.id}
              experience={exp}
              onUpdate={(updated) => updateExperience(exp.id, updated)}
              onDelete={() => deleteExperience(exp.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        variant="outline"
        onClick={addExperience}
        data-testid="button-add-experience"
        className="w-full border-dashed"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Work Experience
      </Button>
    </div>
  );
}
