'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { CreateJobPostDto } from '@/types/job';

interface RequirementsSkillsStepProps {
  formData: CreateJobPostDto;
  onChange: (field: keyof CreateJobPostDto, value: string | string[] | number) => void;
  locale: string;
}

export default function RequirementsSkillsStep({ formData, onChange, locale }: RequirementsSkillsStepProps) {
  const [currentSkill, setCurrentSkill] = useState('');

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      onChange('skills', [...formData.skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange('skills', formData.skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-6">
      {/* Requirements */}
      <div className="space-y-2">
        <Label htmlFor="requirements">
          {locale === 'ar' ? 'متطلبات الوظيفة' : 'Job Requirements'} *
        </Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => onChange('requirements', e.target.value)}
          placeholder={locale === 'ar'
            ? 'أي متطلبات أو مؤهلات إضافية...'
            : 'Any additional requirements or qualifications...'
          }
          rows={4}
          required
        />

        {locale === 'ar' && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="requirementsAr">
              {locale === 'ar' ? 'متطلبات الوظيفة (عربي)' : 'Job Requirements (Arabic)'}
            </Label>
            <Textarea
              id="requirementsAr"
              value={formData.requirementsAr || ''}
              onChange={(e) => onChange('requirementsAr', e.target.value)}
              placeholder={locale === 'ar'
                ? 'أي متطلبات أو مؤهلات إضافية باللغة العربية...'
                : 'Any additional requirements or qualifications in Arabic...'
              }
              rows={4}
              dir="rtl"
            />
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label>
          {locale === 'ar' ? 'المهارات المطلوبة' : 'Required Skills'} *
        </Label>
        <div className="flex gap-2">
          <Input
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            placeholder={locale === 'ar' ? 'أضف مهارة...' : 'Add skill...'}
            onKeyPress={handleKeyPress}
          />
          <Button type="button" onClick={addSkill} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}