'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateJobPostDto, SalaryType } from '@/types/job';
import { getSalaryTypes, getCurrencies } from '@/lib/job-options';

interface CompensationStepProps {
  formData: CreateJobPostDto;
  onChange: (field: keyof CreateJobPostDto, value: string | number | SalaryType | boolean) => void;
  locale: string;
}

export default function CompensationStep({ formData, onChange, locale }: CompensationStepProps) {
  const salaryTypes = getSalaryTypes(locale);
  const currencies = getCurrencies(locale);

  return (
    <div className="space-y-6">
      {/* Salary Range and Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salaryMin">
            {locale === 'ar' ? 'الراتب الأدنى' : 'Minimum Salary'} *
          </Label>
          <Input
            id="salaryMin"
            type="number"
            value={formData.salaryMin}
            onChange={(e) => onChange('salaryMin', e.target.value)}
            placeholder={locale === 'ar' ? 'مثال: 8000' : 'e.g. 8000'}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryMax">
            {locale === 'ar' ? 'الراتب الأعلى' : 'Maximum Salary'} *
          </Label>
          <Input
            id="salaryMax"
            type="number"
            value={formData.salaryMax}
            onChange={(e) => onChange('salaryMax', e.target.value)}
            placeholder={locale === 'ar' ? 'مثال: 12000' : 'e.g. 12000'}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryType">
            {locale === 'ar' ? 'نوع الراتب' : 'Salary Type'}
          </Label>
          <Select
            value={formData.salaryType}
            onValueChange={(value: SalaryType) => onChange('salaryType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={locale === 'ar' ? 'اختر نوع الراتب' : 'Select salary type'} />
            </SelectTrigger>
            <SelectContent>
              {salaryTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <Label htmlFor="currency">
          {locale === 'ar' ? 'العملة' : 'Currency'} *
        </Label>
        <Select
          value={formData.currency}
          onValueChange={(value: string) => onChange('currency', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={locale === 'ar' ? 'اختر العملة' : 'Select currency'} />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}