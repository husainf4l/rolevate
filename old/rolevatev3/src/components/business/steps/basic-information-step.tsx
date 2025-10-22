'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { JobFormData, FormErrors } from '@/types/job';

interface BasicInformationStepProps {
  data: JobFormData;
  errors: FormErrors;
  onChange: (field: string, value: any) => void;
  onGenerateAI: () => void;
  aiGenerating: boolean;
  locale: string;
}

export default function BasicInformationStep({
  data,
  errors,
  onChange,
  onGenerateAI,
  aiGenerating,
  locale,
}: BasicInformationStepProps) {
  const t = useTranslations('business.jobs.create.steps.basic');

  const jobTypes = [
    { value: 'FULL_TIME', label: t('jobTypes.fullTime') },
    { value: 'PART_TIME', label: t('jobTypes.partTime') },
    { value: 'CONTRACT', label: t('jobTypes.contract') },
    { value: 'FREELANCE', label: t('jobTypes.freelance') },
    { value: 'INTERNSHIP', label: t('jobTypes.internship') },
  ];

  const jobLevels = [
    { value: 'ENTRY_LEVEL', label: t('jobLevels.entry') },
    { value: 'JUNIOR', label: t('jobLevels.junior') },
    { value: 'MID_LEVEL', label: t('jobLevels.mid') },
    { value: 'SENIOR', label: t('jobLevels.senior') },
    { value: 'EXECUTIVE', label: t('jobLevels.executive') },
  ];

  const workTypes = [
    { value: 'ON_SITE', label: t('workTypes.onSite') },
    { value: 'REMOTE', label: t('workTypes.remote') },
    { value: 'HYBRID', label: t('workTypes.hybrid') },
  ];

  const industries = [
    { value: 'TECHNOLOGY', label: t('industries.technology') },
    { value: 'HEALTHCARE', label: t('industries.healthcare') },
    { value: 'FINANCE', label: t('industries.finance') },
    { value: 'EDUCATION', label: t('industries.education') },
    { value: 'RETAIL', label: t('industries.retail') },
    { value: 'MANUFACTURING', label: t('industries.manufacturing') },
    { value: 'CONSULTING', label: t('industries.consulting') },
    { value: 'OTHER', label: t('industries.other') },
  ];

  const locations = [
    'Dubai, UAE',
    'Abu Dhabi, UAE',
    'Sharjah, UAE',
    'Riyadh, Saudi Arabia',
    'Jeddah, Saudi Arabia',
    'Doha, Qatar',
    'Kuwait City, Kuwait',
    'Manama, Bahrain',
    'Muscat, Oman',
    'Amman, Jordan',
  ];

  const canGenerateAI = data.title && data.department && data.industry;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t('title')}</h2>
        <p className="text-muted-foreground mb-6">{t('description')}</p>
      </div>

      {/* AI Generation Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t('aiGeneration.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t('aiGeneration.description')}
          </p>
          <Button 
            onClick={onGenerateAI}
            disabled={!canGenerateAI || aiGenerating}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {aiGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('aiGeneration.generating')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t('aiGeneration.generate')}
              </>
            )}
          </Button>
          {!canGenerateAI && (
            <p className="text-xs text-muted-foreground mt-2">
              {t('aiGeneration.requirement')}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="title">{t('fields.title')} *</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder={t('fields.titlePlaceholder')}
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department">{t('fields.department')} *</Label>
          <Input
            id="department"
            value={data.department}
            onChange={(e) => onChange('department', e.target.value)}
            placeholder={t('fields.departmentPlaceholder')}
            className={errors.department ? 'border-red-500' : ''}
          />
          {errors.department && (
            <p className="text-sm text-red-500">{errors.department}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">{t('fields.location')} *</Label>
          <Select value={data.location} onValueChange={(value) => onChange('location', value)}>
            <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
              <SelectValue placeholder={t('fields.locationPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location}</p>
          )}
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry">{t('fields.industry')}</Label>
          <Select value={data.industry} onValueChange={(value) => onChange('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('fields.industryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Type */}
        <div className="space-y-2">
          <Label htmlFor="type">{t('fields.jobType')}</Label>
          <Select value={data.type} onValueChange={(value) => onChange('type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {jobTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Level */}
        <div className="space-y-2">
          <Label htmlFor="jobLevel">{t('fields.jobLevel')}</Label>
          <Select value={data.jobLevel} onValueChange={(value) => onChange('jobLevel', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {jobLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Work Type */}
        <div className="space-y-2">
          <Label htmlFor="workType">{t('fields.workType')}</Label>
          <Select value={data.workType} onValueChange={(value) => onChange('workType', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Salary */}
        <div className="space-y-2">
          <Label htmlFor="salary">{t('fields.salary')}</Label>
          <Input
            id="salary"
            value={data.salary}
            onChange={(e) => onChange('salary', e.target.value)}
            placeholder={t('fields.salaryPlaceholder')}
          />
        </div>

        {/* Application Deadline */}
        <div className="space-y-2">
          <Label htmlFor="deadline">{t('fields.deadline')}</Label>
          <Input
            id="deadline"
            type="date"
            value={data.deadline}
            onChange={(e) => onChange('deadline', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );
}