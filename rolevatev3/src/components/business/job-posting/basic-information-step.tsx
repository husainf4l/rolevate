'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateJobPostDto, CreateAddressDto } from '@/types/job';
import { getLocalizedCountries, getLocalizedCities } from '@/lib/job-data';
import { getJobCategories, getDepartments } from '@/lib/job-options';

interface BasicInformationStepProps {
  formData: CreateJobPostDto;
  onChange: (field: keyof CreateJobPostDto, value: string | CreateAddressDto | undefined) => void;
  locale: string;
}

export default function BasicInformationStep({ formData, onChange, locale }: BasicInformationStepProps) {
  const countries = getLocalizedCountries(locale);
  const cities = formData.address?.country ? getLocalizedCities(formData.address.country, locale) : [];
  const jobCategories = getJobCategories(locale);
  const departments = getDepartments(locale);

  const handleAddressChange = (field: string, value: string) => {
    onChange('address', {
      ...formData.address,
      [field]: value,
      ...(field === 'country' ? { city: '' } : {}), // Reset city when country changes
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            {locale === 'ar' ? 'عنوان الوظيفة' : 'Job Title'} *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder={locale === 'ar' ? 'مثال: مطور ويب أول' : 'e.g. Senior Web Developer'}
            required
          />
        </div>

        {locale === 'ar' && (
          <div className="space-y-2">
            <Label htmlFor="titleAr">
              {locale === 'ar' ? 'عنوان الوظيفة (عربي)' : 'Job Title (Arabic)'}
            </Label>
            <Input
              id="titleAr"
              value={formData.titleAr || ''}
              onChange={(e) => onChange('titleAr', e.target.value)}
              placeholder={locale === 'ar' ? 'مثال: مطور ويب أول' : 'e.g. Senior Web Developer'}
              dir="rtl"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="category">
            {locale === 'ar' ? 'فئة الوظيفة' : 'Job Category'} *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => onChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={locale === 'ar' ? 'اختر فئة الوظيفة' : 'Select job category'} />
            </SelectTrigger>
            <SelectContent>
              {jobCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">
            {locale === 'ar' ? 'القسم' : 'Department'}
          </Label>
          <Select
            value={formData.department || ''}
            onValueChange={(value) => onChange('department', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={locale === 'ar' ? 'اختر القسم' : 'Select department'} />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department.value} value={department.value}>
                  {department.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location and Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {locale === 'ar' ? 'الموقع والعنوان' : 'Location & Address'}
        </h3>

        {/* Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address.street">
              {locale === 'ar' ? 'الشارع' : 'Street'}
            </Label>
            <Input
              id="address.street"
              value={formData.address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder={locale === 'ar' ? 'اسم الشارع' : 'Street address'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.country">
              {locale === 'ar' ? 'البلد' : 'Country'}
            </Label>
            <Select
              value={formData.address?.country || ''}
              onValueChange={(value) => handleAddressChange('country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={locale === 'ar' ? 'اختر البلد' : 'Select country'} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address.city">
              {locale === 'ar' ? 'المدينة' : 'City'}
            </Label>
            <Select
              value={formData.address?.city || ''}
              onValueChange={(value) => handleAddressChange('city', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={locale === 'ar' ? 'اختر المدينة' : 'Select city'} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}