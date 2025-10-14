import { Education } from "@shared/schema";
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

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

function SortableEducationItem({
  edu,
  onUpdate,
  onDelete,
}: {
  edu: Education;
  onUpdate: (edu: Education) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: edu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleChange = (field: keyof Education, value: string) => {
    onUpdate({ ...edu, [field]: value });
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-2 text-muted-foreground hover-elevate p-1 rounded"
          data-testid={`drag-handle-${edu.id}`}
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`degree-${edu.id}`} className="text-sm font-medium">
                Degree
              </Label>
              <Input
                id={`degree-${edu.id}`}
                data-testid={`input-degree-${edu.id}`}
                placeholder="Bachelor of Science"
                value={edu.degree}
                onChange={(e) => handleChange("degree", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor={`field-${edu.id}`} className="text-sm font-medium">
                Field of Study
              </Label>
              <Input
                id={`field-${edu.id}`}
                data-testid={`input-field-${edu.id}`}
                placeholder="Computer Science"
                value={edu.field}
                onChange={(e) => handleChange("field", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`school-${edu.id}`} className="text-sm font-medium">
              School
            </Label>
            <Input
              id={`school-${edu.id}`}
              data-testid={`input-school-${edu.id}`}
              placeholder="University Name"
              value={edu.school}
              onChange={(e) => handleChange("school", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`edu-location-${edu.id}`} className="text-sm font-medium">
                Location
              </Label>
              <Input
                id={`edu-location-${edu.id}`}
                data-testid={`input-edu-location-${edu.id}`}
                placeholder="Boston, MA"
                value={edu.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor={`edu-startDate-${edu.id}`} className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id={`edu-startDate-${edu.id}`}
                data-testid={`input-edu-startdate-${edu.id}`}
                placeholder="Sep 2016"
                value={edu.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor={`edu-endDate-${edu.id}`} className="text-sm font-medium">
                End Date
              </Label>
              <Input
                id={`edu-endDate-${edu.id}`}
                data-testid={`input-edu-enddate-${edu.id}`}
                placeholder="May 2020"
                value={edu.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`edu-description-${edu.id}`} className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id={`edu-description-${edu.id}`}
              data-testid={`textarea-edu-description-${edu.id}`}
              placeholder="GPA, achievements, relevant coursework..."
              value={edu.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="mt-1.5 min-h-[80px]"
            />
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          data-testid={`button-delete-edu-${edu.id}`}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

export default function EducationForm({ education, onChange }: EducationFormProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = education.findIndex((edu) => edu.id === active.id);
      const newIndex = education.findIndex((edu) => edu.id === over.id);
      onChange(arrayMove(education, oldIndex, newIndex));
    }
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      school: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    onChange([...education, newEdu]);
  };

  const updateEducation = (id: string, updated: Education) => {
    onChange(education.map((edu) => (edu.id === id ? updated : edu)));
  };

  const deleteEducation = (id: string) => {
    onChange(education.filter((edu) => edu.id !== id));
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={education.map((edu) => edu.id)} strategy={verticalListSortingStrategy}>
          {education.map((edu) => (
            <SortableEducationItem
              key={edu.id}
              edu={edu}
              onUpdate={(updated) => updateEducation(edu.id, updated)}
              onDelete={() => deleteEducation(edu.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        variant="outline"
        onClick={addEducation}
        data-testid="button-add-education"
        className="w-full border-dashed"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
}
