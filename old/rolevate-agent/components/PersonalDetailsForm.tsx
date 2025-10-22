import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CVData } from "@shared/schema";

interface PersonalDetailsFormProps {
  data: CVData["personalDetails"];
  onChange: (data: CVData["personalDetails"]) => void;
}

export default function PersonalDetailsForm({ data, onChange }: PersonalDetailsFormProps) {
  const handleChange = (field: keyof CVData["personalDetails"], value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name
        </Label>
        <Input
          id="fullName"
          data-testid="input-fullname"
          placeholder="John Doe"
          value={data.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            data-testid="input-email"
            type="email"
            placeholder="john@example.com"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone
          </Label>
          <Input
            id="phone"
            data-testid="input-phone"
            placeholder="+1 (555) 123-4567"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location" className="text-sm font-medium">
          Location
        </Label>
        <Input
          id="location"
          data-testid="input-location"
          placeholder="New York, NY"
          value={data.location}
          onChange={(e) => handleChange("location", e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="linkedin" className="text-sm font-medium">
            LinkedIn
          </Label>
          <Input
            id="linkedin"
            data-testid="input-linkedin"
            placeholder="linkedin.com/in/johndoe"
            value={data.linkedin}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="website" className="text-sm font-medium">
            Website
          </Label>
          <Input
            id="website"
            data-testid="input-website"
            placeholder="johndoe.com"
            value={data.website}
            onChange={(e) => handleChange("website", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}
