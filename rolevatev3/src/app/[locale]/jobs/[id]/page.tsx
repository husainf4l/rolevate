import { Navbar } from '@/components/layout';
import Footer from '@/components/common/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Clock,
  Users,
  Building2,
  Star,
  ArrowLeft,
  Share2,
  Bookmark,
  DollarSign,
  Calendar,
  Briefcase,
  Globe,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface JobDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{
    code?: string;
    q?: string;
    location?: string;
    jobType?: string;
    salary?: string;
    experience?: string;
    company?: string;
  }>;
}

// Mock job data - same as jobs page
const jobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    titleAr: 'مطور واجهة أمامية أول',
    company: 'TechCorp Solutions',
    companyAr: 'تك كورب سوليوشنز',
    location: 'Dubai, UAE',
    locationAr: 'دبي، الإمارات العربية المتحدة',
    type: 'Full-time',
    typeAr: 'دوام كامل',
    salary: '$8,000 - $12,000',
    posted: '2 days ago',
    postedAr: 'منذ يومين',
    applicants: 24,
    featured: true,
    urgent: false,
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Git'],
    description: 'We are looking for a Senior Frontend Developer to join our dynamic team and help build cutting-edge web applications. You will work on challenging projects using modern technologies and collaborate with a talented team of developers.',
    descriptionAr: 'نبحث عن مطور واجهة أمامية أول للانضمام إلى فريقنا الديناميكي ومساعدتنا في بناء تطبيقات الويب المتطورة. ستعمل على مشاريع مثيرة باستخدام التقنيات الحديثة وتتعاون مع فريق موهوب من المطورين.',
    requirements: [
      '5+ years of experience in frontend development',
      'Strong proficiency in React and TypeScript',
      'Experience with modern CSS frameworks (Tailwind, Styled Components)',
      'Knowledge of state management (Redux, Zustand)',
      'Understanding of web performance optimization',
      'Experience with testing frameworks (Jest, React Testing Library)',
      'Familiarity with CI/CD pipelines'
    ],
    requirementsAr: [
      '5+ سنوات من الخبرة في تطوير الواجهة الأمامية',
      'إتقان قوي في React و TypeScript',
      'خبرة مع أطر CSS الحديثة (Tailwind، Styled Components)',
      'معرفة بإدارة الحالة (Redux، Zustand)',
      'فهم تحسين أداء الويب',
      'خبرة مع أطر الاختبار (Jest، React Testing Library)',
      'إلمام بأنابيب CI/CD'
    ],
    benefits: [
      'Competitive salary and benefits package',
      'Flexible working hours',
      'Remote work options',
      'Professional development budget',
      'Health insurance coverage',
      'Annual company retreats',
      'Modern office facilities'
    ],
    benefitsAr: [
      'راتب تنافسي وحزمة مزايا',
      'ساعات عمل مرنة',
      'خيارات العمل عن بعد',
      'ميزانية التطوير المهني',
      'تغطية التأمين الصحي',
      'رحلات شركة سنوية',
      'مرافق مكتبية حديثة'
    ],
    companyDescription: 'TechCorp Solutions is a leading technology company specializing in web and mobile application development. We work with clients across various industries to deliver innovative digital solutions.',
    companyDescriptionAr: 'تك كورب سوليوشنز هي شركة تقنية رائدة متخصصة في تطوير تطبيقات الويب والموبايل. نحن نعمل مع عملاء في مختلف الصناعات لتقديم حلول رقمية مبتكرة.'
  },
  {
    id: 2,
    title: 'UX/UI Designer',
    titleAr: 'مصمم تجربة المستخدم والواجهة',
    company: 'Design Studio',
    companyAr: 'استوديو التصميم',
    location: 'Riyadh, Saudi Arabia',
    locationAr: 'الرياض، المملكة العربية السعودية',
    type: 'Full-time',
    typeAr: 'دوام كامل',
    salary: '$6,000 - $9,000',
    posted: '1 week ago',
    postedAr: 'منذ أسبوع',
    applicants: 18,
    featured: false,
    urgent: true,
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    description: 'Join our creative team as a UX/UI Designer and help shape the future of digital experiences. You will work on diverse projects for clients across different industries.',
    descriptionAr: 'انضم إلى فريقنا الإبداعي كمصمم تجربة مستخدم وواجهة ومساعدتنا في تشكيل مستقبل التجارب الرقمية. ستعمل على مشاريع متنوعة لعملاء في مختلف الصناعات.',
    requirements: [
      '3+ years of experience in UX/UI design',
      'Proficiency in design tools (Figma, Adobe XD, Sketch)',
      'Strong portfolio showcasing design projects',
      'Understanding of user-centered design principles',
      'Experience with prototyping and user testing',
      'Knowledge of design systems and accessibility',
      'Communication and presentation skills'
    ],
    requirementsAr: [
      '3+ سنوات من الخبرة في تصميم UX/UI',
      'إتقان أدوات التصميم (Figma، Adobe XD، Sketch)',
      'محفظة قوية تعرض مشاريع التصميم',
      'فهم مبادئ التصميم المرتكز على المستخدم',
      'خبرة في النماذج الأولية واختبار المستخدمين',
      'معرفة بأنظمة التصميم والوصولية',
      'مهارات التواصل والعرض'
    ],
    benefits: [
      'Creative and collaborative work environment',
      'Latest design tools and software',
      'Professional development opportunities',
      'Flexible working arrangements',
      'Health and wellness benefits',
      'Annual creative retreats',
      'Portfolio development support'
    ],
    benefitsAr: [
      'بيئة عمل إبداعية وتعاونية',
      'أحدث أدوات وبرامج التصميم',
      'فرص التطوير المهني',
      'ترتيبات عمل مرنة',
      'مزايا الصحة والعافية',
      'رحلات إبداعية سنوية',
      'دعم تطوير المحفظة'
    ],
    companyDescription: 'Design Studio is a full-service design agency that creates exceptional digital experiences for brands worldwide. We combine creativity with strategic thinking to deliver outstanding results.',
    companyDescriptionAr: 'استوديو التصميم هو وكالة تصميم شاملة تخلق تجارب رقمية استثنائية للعلامات التجارية حول العالم. نحن نجمع بين الإبداع والتفكير الاستراتيجي لتقديم نتائج متميزة.'
  },
  {
    id: 3,
    title: 'Backend Developer',
    titleAr: 'مطور خلفية',
    company: 'StartupXYZ',
    companyAr: 'ستارت أب XYZ',
    location: 'Remote',
    locationAr: 'عن بعد',
    type: 'Full-time',
    typeAr: 'دوام كامل',
    salary: '$7,000 - $10,000',
    posted: '3 days ago',
    postedAr: 'منذ 3 أيام',
    applicants: 31,
    featured: false,
    urgent: false,
    skills: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'AWS'],
    description: 'We are seeking a talented Backend Developer to build scalable web applications. You will work on our core platform and help us scale to serve millions of users.',
    descriptionAr: 'نبحث عن مطور خلفية موهوب لبناء تطبيقات الويب القابلة للتوسع. ستعمل على منصتنا الأساسية وتساعدنا في التوسع لخدمة ملايين المستخدمين.',
    requirements: [
      '4+ years of backend development experience',
      'Strong knowledge of Node.js and Python',
      'Experience with databases (PostgreSQL, MongoDB)',
      'Familiarity with cloud platforms (AWS, GCP)',
      'Understanding of microservices architecture',
      'Experience with API design and development',
      'Knowledge of security best practices'
    ],
    requirementsAr: [
      '4+ سنوات من خبرة تطوير الخلفية',
      'معرفة قوية بـ Node.js و Python',
      'خبرة مع قواعد البيانات (PostgreSQL، MongoDB)',
      'إلمام بمنصات السحابة (AWS، GCP)',
      'فهم بنية الخدمات المصغرة',
      'خبرة في تصميم وتطوير API',
      'معرفة بأفضل ممارسات الأمان'
    ],
    benefits: [
      'Equity participation in a growing startup',
      'Remote-first company culture',
      'Latest technology stack',
      'Learning and development budget',
      'Comprehensive health benefits',
      'Flexible vacation policy',
      'Team building events'
    ],
    benefitsAr: [
      'المشاركة في حقوق الملكية في شركة ناشئة متنامية',
      'ثقافة شركة تركز على العمل عن بعد',
      'أحدث مجموعة تقنية',
      'ميزانية التعلم والتطوير',
      'مزايا صحية شاملة',
      'سياسة إجازة مرنة',
      'فعاليات بناء الفريق'
    ],
    companyDescription: 'StartupXYZ is a fast-growing technology startup revolutionizing the way people connect and collaborate online. We are backed by top-tier investors and are on a mission to build the future of digital collaboration.',
    companyDescriptionAr: 'ستارت أب XYZ هي شركة تقنية ناشئة سريعة النمو تغير طريقة اتصال وتعاون الناس عبر الإنترنت. نحن مدعومون من قبل مستثمرين من الدرجة الأولى ونحن في مهمة لبناء مستقبل التعاون الرقمي.'
  }
];

export default async function JobDetailPage({
  params,
  searchParams
}: JobDetailPageProps) {
  const { locale, id } = await params;
  const { code, q, location, jobType, salary, experience, company } = await searchParams;
  const jobId = parseInt(id);
  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    notFound();
  }

  // Use the search parameters for filtering or display logic
  console.log('Search params:', { code, q, location, jobType, salary, experience, company });

  // Example: Filter jobs based on search parameters (for future use)
  // const filteredJobs = jobs.filter(job => {
  //   if (q && !job.title.toLowerCase().includes(q.toLowerCase())) return false;
  //   if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
  //   if (jobType && job.type !== jobType) return false;
  //   if (company && !job.company.toLowerCase().includes(company.toLowerCase())) return false;
  //   return true;
  // });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-32">
        {/* Back Navigation */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" asChild className="mb-0">
              <Link href={`/${locale}/jobs`}>
                <ArrowLeft className={`w-4 h-4 mr-2 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                {locale === 'ar' ? 'العودة إلى الوظائف' : 'Back to Jobs'}
              </Link>
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Job Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold text-foreground">
                      {locale === 'ar' ? job.titleAr : job.title}
                    </h1>
                    {job.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        <Star className="w-4 h-4 mr-1" />
                        {locale === 'ar' ? 'مميز' : 'Featured'}
                      </Badge>
                    )}
                    {job.urgent && (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        {locale === 'ar' ? 'عاجل' : 'Urgent'}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      <span className="font-medium">{locale === 'ar' ? job.companyAr : job.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{locale === 'ar' ? job.locationAr : job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      <span>{locale === 'ar' ? job.typeAr : job.type}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-primary">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{locale === 'ar' ? job.postedAr : job.posted}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{job.applicants} {locale === 'ar' ? 'متقدم' : 'applicants'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4 mr-2" />
                    {locale === 'ar' ? 'حفظ' : 'Save'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    {locale === 'ar' ? 'مشاركة' : 'Share'}
                  </Button>
                  <Button size="lg">
                    {locale === 'ar' ? 'تقدم الآن' : 'Apply Now'}
                  </Button>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Job Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {locale === 'ar' ? 'وصف الوظيفة' : 'Job Description'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {locale === 'ar' ? job.descriptionAr : job.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {locale === 'ar' ? 'المتطلبات' : 'Requirements'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(locale === 'ar' ? job.requirementsAr : job.requirements).map((requirement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Benefits */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {locale === 'ar' ? 'المزايا' : 'Benefits'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(locale === 'ar' ? job.benefitsAr : job.benefits).map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Company Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {locale === 'ar' ? 'حول الشركة' : 'About Company'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold text-foreground mb-2">
                      {locale === 'ar' ? job.companyAr : job.company}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {locale === 'ar' ? job.companyDescriptionAr : job.companyDescription}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Globe className="w-4 h-4 mr-2" />
                      {locale === 'ar' ? 'زيارة الموقع' : 'Visit Website'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Job Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {locale === 'ar' ? 'ملخص الوظيفة' : 'Job Summary'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'النوع' : 'Type'}
                      </span>
                      <Badge variant="outline">
                        {locale === 'ar' ? job.typeAr : job.type}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'الموقع' : 'Location'}
                      </span>
                      <span className="text-sm font-medium">
                        {locale === 'ar' ? job.locationAr : job.location}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'الراتب' : 'Salary'}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {job.salary}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'نشرت' : 'Posted'}
                      </span>
                      <span className="text-sm">
                        {locale === 'ar' ? job.postedAr : job.posted}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Apply CTA */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="font-semibold text-foreground mb-2">
                        {locale === 'ar' ? 'مهتم بهذه الوظيفة؟' : 'Interested in this job?'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {locale === 'ar'
                          ? 'تقدم الآن وكن جزءاً من فريقنا'
                          : 'Apply now and become part of our team'
                        }
                      </p>
                      <Button className="w-full">
                        {locale === 'ar' ? 'تقدم الآن' : 'Apply Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer locale={locale} />
    </>
  );
}