import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SummaryFormProps {
  summary: string;
  onChange: (summary: string) => void;
}

export default function SummaryForm({ summary, onChange }: SummaryFormProps) {
  return (
    <div>
      <Label htmlFor="summary" className="text-sm font-medium">
        Professional Summary
      </Label>
      <Textarea
        id="summary"
        data-testid="textarea-summary"
        placeholder="Write a brief summary of your professional background and career objectives..."
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 min-h-[120px]"
      />
      <p className="text-xs text-muted-foreground mt-1.5">
        {summary.length} characters
      </p>
    </div>
  );
}
