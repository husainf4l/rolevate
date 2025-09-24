'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateJobPostDto, JobType, ExperienceLevel, EducationLevel, WorkLocation, JobCategory } from '@/types/job';
import {
  getJobTypes,
  getExperienceLevels,
  getEducationLevels,
  getWorkLocations
} from '@/lib/job-options';

interface JobDetailsStepProps {
  formData: CreateJobPostDto;
  onChange: (field: keyof CreateJobPostDto, value: string | number | JobType | ExperienceLevel | EducationLevel | WorkLocation) => void;
  locale: string;
}

export default function JobDetailsStep({ formData, onChange, locale }: JobDetailsStepProps) {
  const jobTypes = getJobTypes(locale);
  const experienceLevels = getExperienceLevels(locale);
  const educationLevels = getEducationLevels(locale);
  const workLocations = getWorkLocations(locale);

  return (
    <div className="space-y-6">
      {/* Job Type */}
      <div className="space-y-3">
        <Label htmlFor="jobType" className="text-base font-medium">
          {locale === 'ar' ? 'نوع الوظيفة' : 'Job Type'} *
        </Label>
        <Select
          value={formData.jobType}
          onValueChange={(value: JobType) => onChange('jobType', value)}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder={locale === 'ar' ? 'اختر نوع الوظيفة' : 'Select job type'} />
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

      {/* Work Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="workLocation" className="text-base font-medium">
            {locale === 'ar' ? 'مكان العمل' : 'Work Location'} *
          </Label>
          <Select
            value={formData.workLocation}
            onValueChange={(value: WorkLocation) => onChange('workLocation', value)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder={locale === 'ar' ? 'اختر مكان العمل' : 'Select work location'} />
            </SelectTrigger>
            <SelectContent>
              {workLocations.map((location) => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Experience Level and Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="experienceLevel" className="text-base font-medium">
            {locale === 'ar' ? 'مستوى الخبرة' : 'Experience Level'} *
          </Label>
          <Select
            value={formData.experienceLevel}
            onValueChange={(value: ExperienceLevel) => onChange('experienceLevel', value)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder={locale === 'ar' ? 'اختر مستوى الخبرة' : 'Select experience level'} />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="educationLevel" className="text-base font-medium">
            {locale === 'ar' ? 'المستوى التعليمي المطلوب' : 'Required Education Level'}
          </Label>
          <Select
            value={formData.educationLevel}
            onValueChange={(value: EducationLevel) => onChange('educationLevel', value)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder={locale === 'ar' ? 'اختر المستوى التعليمي' : 'Select education level'} />
            </SelectTrigger>
            <SelectContent>
              {educationLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}