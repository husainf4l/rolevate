import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SkillsFormProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!skills.includes(inputValue.trim())) {
        onChange([...skills, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="skills-input" className="text-sm font-medium">
          Skills
        </Label>
        <Input
          id="skills-input"
          data-testid="input-skills"
          placeholder="Type a skill and press Enter"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mt-1.5"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Press Enter to add each skill
        </p>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="gap-1 pl-3 pr-2 py-1.5"
              data-testid={`badge-skill-${index}`}
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                data-testid={`button-remove-skill-${index}`}
                className="hover-elevate rounded-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
