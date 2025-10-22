'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateJobPostDto, JobPriority } from '@/types/job';
import { getJobPriorities } from '@/lib/job-options';

interface AdditionalSettingsStepProps {
  formData: CreateJobPostDto;
  onChange: (field: keyof CreateJobPostDto, value: string | number | JobPriority | boolean) => void;
  locale: string;
}

export default function AdditionalSettingsStep({ formData, onChange, locale }: AdditionalSettingsStepProps) {
  const priorities = getJobPriorities(locale);

  return (
    <div className="space-y-6">
      {/* Application Deadline */}
      <div className="space-y-2">
        <Label htmlFor="applicationDeadline">
          {locale === 'ar' ? 'موعد انتهاء التقديم' : 'Application Deadline'}
        </Label>
        <Input
          id="applicationDeadline"
          type="date"
          value={formData.applicationDeadline}
          onChange={(e) => onChange('applicationDeadline', e.target.value)}
        />
      </div>

      {/* Contact Email */}
      <div className="space-y-2">
        <Label htmlFor="contactEmail">
          {locale === 'ar' ? 'البريد الإلكتروني للتواصل' : 'Contact Email'}
        </Label>
        <Input
          id="contactEmail"
          type="email"
          value={formData.contactEmail}
          onChange={(e) => onChange('contactEmail', e.target.value)}
          placeholder={locale === 'ar' ? 'example@company.com' : 'example@company.com'}
        />
      </div>

      {/* Application URL */}
      <div className="space-y-2">
        <Label htmlFor="applicationUrl">
          {locale === 'ar' ? 'رابط التقديم' : 'Application URL'}
        </Label>
        <Input
          id="applicationUrl"
          type="url"
          value={formData.applicationUrl}
          onChange={(e) => onChange('applicationUrl', e.target.value)}
          placeholder={locale === 'ar' ? 'https://company.com/careers/apply' : 'https://company.com/careers/apply'}
        />
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priority">
          {locale === 'ar' ? 'أولوية الوظيفة' : 'Job Priority'}
        </Label>
        <Select
          value={formData.priority}
          onValueChange={(value: JobPriority) => onChange('priority', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={locale === 'ar' ? 'اختر الأولوية' : 'Select priority'} />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}