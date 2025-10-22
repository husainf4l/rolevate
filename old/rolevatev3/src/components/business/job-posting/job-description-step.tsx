'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CreateJobPostDto } from '@/types/job';
import { Sparkles } from 'lucide-react';

interface JobDescriptionStepProps {
  formData: CreateJobPostDto;
  onChange: (field: keyof CreateJobPostDto, value: string) => void;
  locale: string;
  onGenerateDescription?: () => void;
  isGenerating?: boolean;
}

export default function JobDescriptionStep({
  formData,
  onChange,
  locale,
  onGenerateDescription,
  isGenerating = false
}: JobDescriptionStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="description" className="text-lg font-medium">
              {locale === 'ar' ? 'وصف الوظيفة' : 'Job Description'} *
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {locale === 'ar'
                ? 'وصف تفصيلي للوظيفة والمسؤوليات والمتطلبات'
                : 'Detailed description of the job, responsibilities, and requirements'
              }
            </p>
          </div>

          {onGenerateDescription && (
            <Button
              type="button"
              variant="outline"
              onClick={onGenerateDescription}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating
                ? (locale === 'ar' ? 'جاري التوليد...' : 'Generating...')
                : (locale === 'ar' ? 'توليد بالذكاء الاصطناعي' : 'Generate with AI')
              }
            </Button>
          )}
        </div>

        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder={locale === 'ar'
            ? 'اكتب وصفاً مفصلاً للوظيفة أو استخدم الذكاء الاصطناعي لتوليده...'
            : 'Write a detailed job description or use AI to generate one...'
          }
          rows={12}
          required
          className="min-h-[300px] resize-y"
        />

        {locale === 'ar' && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="descriptionAr" className="text-base font-medium">
              {locale === 'ar' ? 'وصف الوظيفة (عربي)' : 'Job Description (Arabic)'}
            </Label>
            <Textarea
              id="descriptionAr"
              value={formData.descriptionAr || ''}
              onChange={(e) => onChange('descriptionAr', e.target.value)}
              placeholder={locale === 'ar'
                ? 'اكتب وصفاً مفصلاً للوظيفة باللغة العربية...'
                : 'Write a detailed job description in Arabic...'
              }
              rows={12}
              className="min-h-[300px] resize-y"
              dir="rtl"
            />
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">
            {locale === 'ar' ? 'نصائح لكتابة وصف جيد:' : 'Tips for a good description:'}
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>{locale === 'ar' ? 'صف المسؤوليات الرئيسية' : 'Describe main responsibilities'}</li>
            <li>{locale === 'ar' ? 'اذكر المهارات المطلوبة' : 'Mention required skills'}</li>
            <li>{locale === 'ar' ? 'حدد متطلبات الخبرة' : 'Specify experience requirements'}</li>
            <li>{locale === 'ar' ? 'اذكر فرص النمو والتطوير' : 'Mention growth opportunities'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}