import {
  JobType,
  ExperienceLevel,
  EducationLevel,
  WorkLocation,
  JobCategory,
  SalaryType,
  Currency,
  JobPriority
} from '@/types/job';

export interface Option {
  value: string;
  label: string;
}

export const getJobTypes = (locale: string): Option[] => [
  { value: JobType.FULL_TIME, label: locale === 'ar' ? 'دوام كامل' : 'Full-time' },
  { value: JobType.PART_TIME, label: locale === 'ar' ? 'دوام جزئي' : 'Part-time' },
  { value: JobType.CONTRACT, label: locale === 'ar' ? 'عقد' : 'Contract' },
  { value: JobType.FREELANCE, label: locale === 'ar' ? 'عمل حر' : 'Freelance' },
  { value: JobType.INTERNSHIP, label: locale === 'ar' ? 'تدريب' : 'Internship' },
  { value: JobType.TEMPORARY, label: locale === 'ar' ? 'مؤقت' : 'Temporary' },
  { value: JobType.SEASONAL, label: locale === 'ar' ? 'موسمي' : 'Seasonal' },
  { value: JobType.REMOTE, label: locale === 'ar' ? 'عن بعد' : 'Remote' },
  { value: JobType.HYBRID, label: locale === 'ar' ? 'هجين' : 'Hybrid' },
];

export const getExperienceLevels = (locale: string): Option[] => [
  { value: ExperienceLevel.ENTRY_LEVEL, label: locale === 'ar' ? 'مبتدئ' : 'Entry Level' },
  { value: ExperienceLevel.JUNIOR, label: locale === 'ar' ? 'مبتدئ' : 'Junior' },
  { value: ExperienceLevel.MID_LEVEL, label: locale === 'ar' ? 'متوسط المستوى' : 'Mid Level' },
  { value: ExperienceLevel.SENIOR, label: locale === 'ar' ? 'خبير' : 'Senior' },
  { value: ExperienceLevel.EXECUTIVE, label: locale === 'ar' ? 'تنفيذي' : 'Executive' },
  { value: ExperienceLevel.LEAD, label: locale === 'ar' ? 'قائد' : 'Lead' },
  { value: ExperienceLevel.DIRECTOR, label: locale === 'ar' ? 'مدير' : 'Director' },
  { value: ExperienceLevel.VP, label: locale === 'ar' ? 'نائب رئيس' : 'VP' },
  { value: ExperienceLevel.C_LEVEL, label: locale === 'ar' ? 'مستوى C' : 'C-Level' },
];

export const getEducationLevels = (locale: string): Option[] => [
  { value: EducationLevel.HIGH_SCHOOL, label: locale === 'ar' ? 'ثانوية عامة' : 'High School' },
  { value: EducationLevel.ASSOCIATE_DEGREE, label: locale === 'ar' ? 'دبلوم مشارك' : 'Associate Degree' },
  { value: EducationLevel.BACHELOR_DEGREE, label: locale === 'ar' ? 'بكالوريوس' : 'Bachelor Degree' },
  { value: EducationLevel.MASTER_DEGREE, label: locale === 'ar' ? 'ماجستير' : 'Master Degree' },
  { value: EducationLevel.PHD, label: locale === 'ar' ? 'دكتوراه' : 'PhD' },
  { value: EducationLevel.PROFESSIONAL_CERTIFICATION, label: locale === 'ar' ? 'شهادة مهنية' : 'Professional Certification' },
  { value: EducationLevel.NO_FORMAL_EDUCATION, label: locale === 'ar' ? 'لا يتطلب تعليم رسمي' : 'No Formal Education' },
];

export const getWorkLocations = (locale: string): Option[] => [
  { value: WorkLocation.ON_SITE, label: locale === 'ar' ? 'في الموقع' : 'On-site' },
  { value: WorkLocation.REMOTE, label: locale === 'ar' ? 'عن بعد' : 'Remote' },
  { value: WorkLocation.HYBRID, label: locale === 'ar' ? 'هجين' : 'Hybrid' },
];

export const getJobCategories = (locale: string): Option[] => [
  { value: JobCategory.TECHNOLOGY, label: locale === 'ar' ? 'تكنولوجيا' : 'Technology' },
  { value: JobCategory.FINANCE, label: locale === 'ar' ? 'مالية' : 'Finance' },
  { value: JobCategory.HEALTHCARE, label: locale === 'ar' ? 'رعاية صحية' : 'Healthcare' },
  { value: JobCategory.MARKETING, label: locale === 'ar' ? 'تسويق' : 'Marketing' },
  { value: JobCategory.SALES, label: locale === 'ar' ? 'مبيعات' : 'Sales' },
  { value: JobCategory.HUMAN_RESOURCES, label: locale === 'ar' ? 'موارد بشرية' : 'Human Resources' },
  { value: JobCategory.OPERATIONS, label: locale === 'ar' ? 'عمليات' : 'Operations' },
  { value: JobCategory.CUSTOMER_SERVICE, label: locale === 'ar' ? 'خدمة العملاء' : 'Customer Service' },
  { value: JobCategory.DESIGN, label: locale === 'ar' ? 'تصميم' : 'Design' },
  { value: JobCategory.ENGINEERING, label: locale === 'ar' ? 'هندسة' : 'Engineering' },
  { value: JobCategory.EDUCATION, label: locale === 'ar' ? 'تعليم' : 'Education' },
  { value: JobCategory.LEGAL, label: locale === 'ar' ? 'قانوني' : 'Legal' },
  { value: JobCategory.CONSULTING, label: locale === 'ar' ? 'استشارات' : 'Consulting' },
  { value: JobCategory.MANUFACTURING, label: locale === 'ar' ? 'تصنيع' : 'Manufacturing' },
  { value: JobCategory.RETAIL, label: locale === 'ar' ? 'تجزئة' : 'Retail' },
  { value: JobCategory.HOSPITALITY, label: locale === 'ar' ? 'ضيافة' : 'Hospitality' },
  { value: JobCategory.CONSTRUCTION, label: locale === 'ar' ? 'بناء' : 'Construction' },
  { value: JobCategory.TRANSPORTATION, label: locale === 'ar' ? 'نقل' : 'Transportation' },
  { value: JobCategory.MEDIA, label: locale === 'ar' ? 'إعلام' : 'Media' },
  { value: JobCategory.NON_PROFIT, label: locale === 'ar' ? 'غير ربحي' : 'Non-profit' },
];

export const getSalaryTypes = (locale: string): Option[] => [
  { value: SalaryType.HOURLY, label: locale === 'ar' ? 'بالساعة' : 'Hourly' },
  { value: SalaryType.DAILY, label: locale === 'ar' ? 'يومي' : 'Daily' },
  { value: SalaryType.WEEKLY, label: locale === 'ar' ? 'أسبوعي' : 'Weekly' },
  { value: SalaryType.MONTHLY, label: locale === 'ar' ? 'شهري' : 'Monthly' },
  { value: SalaryType.YEARLY, label: locale === 'ar' ? 'سنوي' : 'Yearly' },
  { value: SalaryType.PROJECT_BASED, label: locale === 'ar' ? 'بناءً على المشروع' : 'Project-based' },
];

export const getCurrencies = (locale: string): Option[] => [
  { value: Currency.AED, label: locale === 'ar' ? 'درهم إماراتي' : 'AED' },
  { value: Currency.USD, label: locale === 'ar' ? 'دولار أمريكي' : 'USD' },
  { value: Currency.EUR, label: locale === 'ar' ? 'يورو' : 'EUR' },
  { value: Currency.SAR, label: locale === 'ar' ? 'ريال سعودي' : 'SAR' },
  { value: Currency.KWD, label: locale === 'ar' ? 'دينار كويتي' : 'KWD' },
  { value: Currency.BHD, label: locale === 'ar' ? 'دينار بحريني' : 'BHD' },
  { value: Currency.QAR, label: locale === 'ar' ? 'ريال قطري' : 'QAR' },
  { value: Currency.OMR, label: locale === 'ar' ? 'ريال عماني' : 'OMR' },
  { value: Currency.JOD, label: locale === 'ar' ? 'دينار أردني' : 'JOD' },
  { value: Currency.EGP, label: locale === 'ar' ? 'جنيه مصري' : 'EGP' },
  { value: Currency.LBP, label: locale === 'ar' ? 'ليرة لبنانية' : 'LBP' },
];

export const getJobPriorities = (locale: string): Option[] => [
  { value: JobPriority.LOW, label: locale === 'ar' ? 'منخفض' : 'Low' },
  { value: JobPriority.NORMAL, label: locale === 'ar' ? 'عادي' : 'Normal' },
  { value: JobPriority.HIGH, label: locale === 'ar' ? 'عالي' : 'High' },
  { value: JobPriority.URGENT, label: locale === 'ar' ? 'عاجل' : 'Urgent' },
];

export const getDepartments = (locale: string): Option[] => [
  { value: 'engineering', label: locale === 'ar' ? 'الهندسة' : 'Engineering' },
  { value: 'product', label: locale === 'ar' ? 'المنتج' : 'Product' },
  { value: 'design', label: locale === 'ar' ? 'التصميم' : 'Design' },
  { value: 'marketing', label: locale === 'ar' ? 'التسويق' : 'Marketing' },
  { value: 'sales', label: locale === 'ar' ? 'المبيعات' : 'Sales' },
  { value: 'human_resources', label: locale === 'ar' ? 'الموارد البشرية' : 'Human Resources' },
  { value: 'finance', label: locale === 'ar' ? 'المالية' : 'Finance' },
  { value: 'operations', label: locale === 'ar' ? 'العمليات' : 'Operations' },
  { value: 'customer_service', label: locale === 'ar' ? 'خدمة العملاء' : 'Customer Service' },
  { value: 'legal', label: locale === 'ar' ? 'الشؤون القانونية' : 'Legal' },
  { value: 'it', label: locale === 'ar' ? 'تقنية المعلومات' : 'IT' },
  { value: 'research', label: locale === 'ar' ? 'البحث والتطوير' : 'Research & Development' },
  { value: 'quality_assurance', label: locale === 'ar' ? 'ضمان الجودة' : 'Quality Assurance' },
  { value: 'administration', label: locale === 'ar' ? 'الإدارة' : 'Administration' },
  { value: 'procurement', label: locale === 'ar' ? 'المشتريات' : 'Procurement' },
  { value: 'logistics', label: locale === 'ar' ? 'اللوجستيات' : 'Logistics' },
  { value: 'other', label: locale === 'ar' ? 'أخرى' : 'Other' },
];