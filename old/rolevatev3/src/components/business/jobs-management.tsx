"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Search, Filter, Eye, Edit, Trash2, MapPin, DollarSign, Users, Calendar } from 'lucide-react';
import { useAuthContext } from '@/providers/auth-provider';

interface JobPost {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  location?: string;
  locationAr?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  jobType: string;
  experienceLevel: string;
  industry?: string;
  industryAr?: string;
  skills: string[];
  status: string;
  views: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

interface JobsManagementProps {
  locale: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function JobsManagement({ locale /*, searchParams*/ }: JobsManagementProps) {
  const { user, isAuthenticated } = useAuthContext();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('ALL');
  const [experienceFilter, setExperienceFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state for creating jobs
  const [newJob, setNewJob] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    location: '',
    locationAr: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    jobType: 'FULL_TIME',
    experienceLevel: 'ENTRY_LEVEL',
    industry: '',
    industryAr: '',
    skills: [] as string[],
    benefits: '',
    benefitsAr: '',
    applicationDeadline: ''
  });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (jobTypeFilter && jobTypeFilter !== 'ALL') params.append('jobType', jobTypeFilter);
      if (experienceFilter && experienceFilter !== 'ALL') params.append('experienceLevel', experienceFilter);
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);

      params.append('page', '1');
      params.append('limit', '20');

      const response = await fetch(`http://localhost:4005/jobs?${params.toString()}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, jobTypeFilter, experienceFilter, statusFilter]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchJobs();
    }
  }, [isAuthenticated, user, fetchJobs]);

  const handleCreateJob = async () => {
    try {
      const jobData = {
        ...newJob,
        salaryMin: newJob.salaryMin ? parseFloat(newJob.salaryMin) : undefined,
        salaryMax: newJob.salaryMax ? parseFloat(newJob.salaryMax) : undefined,
        skills: newJob.skills.filter(skill => skill.trim() !== '')
      };

      const response = await fetch('http://localhost:4005/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setNewJob({
          title: '',
          titleAr: '',
          description: '',
          descriptionAr: '',
          location: '',
          locationAr: '',
          salaryMin: '',
          salaryMax: '',
          salaryCurrency: 'USD',
          jobType: 'FULL_TIME',
          experienceLevel: 'ENTRY_LEVEL',
          industry: '',
          industryAr: '',
          skills: [],
          benefits: '',
          benefitsAr: '',
          applicationDeadline: ''
        });
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذه الوظيفة؟' : 'Are you sure you want to delete this job?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4005/jobs/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      case 'PAUSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobTypeLabel = (jobType: string) => {
    const labels: { [key: string]: { en: string; ar: string } } = {
      FULL_TIME: { en: 'Full Time', ar: 'دوام كامل' },
      PART_TIME: { en: 'Part Time', ar: 'دوام جزئي' },
      CONTRACT: { en: 'Contract', ar: 'عقد' },
      FREELANCE: { en: 'Freelance', ar: 'مستقل' },
      INTERNSHIP: { en: 'Internship', ar: 'تدريب' }
    };
    return labels[jobType]?.[locale === 'ar' ? 'ar' : 'en'] || jobType;
  };

  const getExperienceLabel = (level: string) => {
    const labels: { [key: string]: { en: string; ar: string } } = {
      ENTRY_LEVEL: { en: 'Entry Level', ar: 'مبتدئ' },
      JUNIOR: { en: 'Junior', ar: 'مبتدئ' },
      MID_LEVEL: { en: 'Mid Level', ar: 'متوسط' },
      SENIOR: { en: 'Senior', ar: 'خبير' },
      EXECUTIVE: { en: 'Executive', ar: 'تنفيذي' }
    };
    return labels[level]?.[locale === 'ar' ? 'ar' : 'en'] || level;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          {locale === 'ar' ? 'يرجى تسجيل الدخول لعرض الوظائف' : 'Please login to view jobs'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'ar' ? 'إدارة الوظائف' : 'Jobs Management'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'إدارة ونشر الوظائف في منصتك' : 'Manage and publish jobs on your platform'}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'إضافة وظيفة جديدة' : 'Add New Job'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {locale === 'ar' ? 'إضافة وظيفة جديدة' : 'Add New Job'}
              </DialogTitle>
              <DialogDescription>
                {locale === 'ar' ? 'أدخل تفاصيل الوظيفة الجديدة' : 'Enter the details for the new job posting'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {locale === 'ar' ? 'عنوان الوظيفة (إنجليزي)' : 'Job Title (English)'} *
                </Label>
                <Input
                  id="title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder={locale === 'ar' ? 'مطور برمجيات' : 'Software Developer'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titleAr">
                  {locale === 'ar' ? 'عنوان الوظيفة (عربي)' : 'Job Title (Arabic)'}
                </Label>
                <Input
                  id="titleAr"
                  value={newJob.titleAr}
                  onChange={(e) => setNewJob({ ...newJob, titleAr: e.target.value })}
                  placeholder={locale === 'ar' ? 'مطور برمجيات' : 'مطور برمجيات'}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">
                  {locale === 'ar' ? 'وصف الوظيفة (إنجليزي)' : 'Job Description (English)'} *
                </Label>
                <Textarea
                  id="description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder={locale === 'ar' ? 'وصف تفصيلي للوظيفة...' : 'Detailed job description...'}
                  rows={4}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descriptionAr">
                  {locale === 'ar' ? 'وصف الوظيفة (عربي)' : 'Job Description (Arabic)'}
                </Label>
                <Textarea
                  id="descriptionAr"
                  value={newJob.descriptionAr}
                  onChange={(e) => setNewJob({ ...newJob, descriptionAr: e.target.value })}
                  placeholder={locale === 'ar' ? 'وصف تفصيلي للوظيفة...' : 'وصف تفصيلي للوظيفة...'}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  {locale === 'ar' ? 'الموقع (إنجليزي)' : 'Location (English)'}
                </Label>
                <Input
                  id="location"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  placeholder={locale === 'ar' ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationAr">
                  {locale === 'ar' ? 'الموقع (عربي)' : 'Location (Arabic)'}
                </Label>
                <Input
                  id="locationAr"
                  value={newJob.locationAr}
                  onChange={(e) => setNewJob({ ...newJob, locationAr: e.target.value })}
                  placeholder={locale === 'ar' ? 'الرياض، السعودية' : 'الرياض، السعودية'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMin">
                  {locale === 'ar' ? 'الراتب الأدنى' : 'Minimum Salary'}
                </Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={newJob.salaryMin}
                  onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
                  placeholder="50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax">
                  {locale === 'ar' ? 'الراتب الأعلى' : 'Maximum Salary'}
                </Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={newJob.salaryMax}
                  onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                  placeholder="80000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryCurrency">
                  {locale === 'ar' ? 'عملة الراتب' : 'Salary Currency'}
                </Label>
                <Select value={newJob.salaryCurrency} onValueChange={(value) => setNewJob({ ...newJob, salaryCurrency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType">
                  {locale === 'ar' ? 'نوع الوظيفة' : 'Job Type'}
                </Label>
                <Select value={newJob.jobType} onValueChange={(value) => setNewJob({ ...newJob, jobType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">{locale === 'ar' ? 'دوام كامل' : 'Full Time'}</SelectItem>
                    <SelectItem value="PART_TIME">{locale === 'ar' ? 'دوام جزئي' : 'Part Time'}</SelectItem>
                    <SelectItem value="CONTRACT">{locale === 'ar' ? 'عقد' : 'Contract'}</SelectItem>
                    <SelectItem value="FREELANCE">{locale === 'ar' ? 'مستقل' : 'Freelance'}</SelectItem>
                    <SelectItem value="INTERNSHIP">{locale === 'ar' ? 'تدريب' : 'Internship'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">
                  {locale === 'ar' ? 'مستوى الخبرة' : 'Experience Level'}
                </Label>
                <Select value={newJob.experienceLevel} onValueChange={(value) => setNewJob({ ...newJob, experienceLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRY_LEVEL">{locale === 'ar' ? 'مبتدئ' : 'Entry Level'}</SelectItem>
                    <SelectItem value="JUNIOR">{locale === 'ar' ? 'مبتدئ' : 'Junior'}</SelectItem>
                    <SelectItem value="MID_LEVEL">{locale === 'ar' ? 'متوسط' : 'Mid Level'}</SelectItem>
                    <SelectItem value="SENIOR">{locale === 'ar' ? 'خبير' : 'Senior'}</SelectItem>
                    <SelectItem value="EXECUTIVE">{locale === 'ar' ? 'تنفيذي' : 'Executive'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">
                  {locale === 'ar' ? 'المجال (إنجليزي)' : 'Industry (English)'}
                </Label>
                <Input
                  id="industry"
                  value={newJob.industry}
                  onChange={(e) => setNewJob({ ...newJob, industry: e.target.value })}
                  placeholder={locale === 'ar' ? 'تكنولوجيا المعلومات' : 'Information Technology'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industryAr">
                  {locale === 'ar' ? 'المجال (عربي)' : 'Industry (Arabic)'}
                </Label>
                <Input
                  id="industryAr"
                  value={newJob.industryAr}
                  onChange={(e) => setNewJob({ ...newJob, industryAr: e.target.value })}
                  placeholder={locale === 'ar' ? 'تكنولوجيا المعلومات' : 'تكنولوجيا المعلومات'}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="skills">
                  {locale === 'ar' ? 'المهارات (مفصولة بفواصل)' : 'Skills (comma-separated)'}
                </Label>
                <Input
                  id="skills"
                  value={newJob.skills.join(', ')}
                  onChange={(e) => setNewJob({ ...newJob, skills: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder={locale === 'ar' ? 'JavaScript, React, Node.js' : 'JavaScript, React, Node.js'}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="applicationDeadline">
                  {locale === 'ar' ? 'موعد انتهاء التقديم' : 'Application Deadline'}
                </Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={newJob.applicationDeadline}
                  onChange={(e) => setNewJob({ ...newJob, applicationDeadline: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleCreateJob}>
                {locale === 'ar' ? 'إضافة الوظيفة' : 'Add Job'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {locale === 'ar' ? 'تصفية الوظائف' : 'Filter Jobs'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={locale === 'ar' ? 'البحث في الوظائف...' : 'Search jobs...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={locale === 'ar' ? 'نوع الوظيفة' : 'Job Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{locale === 'ar' ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="FULL_TIME">{locale === 'ar' ? 'دوام كامل' : 'Full Time'}</SelectItem>
                <SelectItem value="PART_TIME">{locale === 'ar' ? 'دوام جزئي' : 'Part Time'}</SelectItem>
                <SelectItem value="CONTRACT">{locale === 'ar' ? 'عقد' : 'Contract'}</SelectItem>
                <SelectItem value="FREELANCE">{locale === 'ar' ? 'مستقل' : 'Freelance'}</SelectItem>
                <SelectItem value="INTERNSHIP">{locale === 'ar' ? 'تدريب' : 'Internship'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder={locale === 'ar' ? 'مستوى الخبرة' : 'Experience Level'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{locale === 'ar' ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="ENTRY_LEVEL">{locale === 'ar' ? 'مبتدئ' : 'Entry Level'}</SelectItem>
                <SelectItem value="JUNIOR">{locale === 'ar' ? 'مبتدئ' : 'Junior'}</SelectItem>
                <SelectItem value="MID_LEVEL">{locale === 'ar' ? 'متوسط' : 'Mid Level'}</SelectItem>
                <SelectItem value="SENIOR">{locale === 'ar' ? 'خبير' : 'Senior'}</SelectItem>
                <SelectItem value="EXECUTIVE">{locale === 'ar' ? 'تنفيذي' : 'Executive'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={locale === 'ar' ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{locale === 'ar' ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="ACTIVE">{locale === 'ar' ? 'نشط' : 'Active'}</SelectItem>
                <SelectItem value="DRAFT">{locale === 'ar' ? 'مسودة' : 'Draft'}</SelectItem>
                <SelectItem value="PAUSED">{locale === 'ar' ? 'متوقف' : 'Paused'}</SelectItem>
                <SelectItem value="CLOSED">{locale === 'ar' ? 'مغلق' : 'Closed'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">
              {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'ar' ? 'لا توجد وظائف' : 'No Jobs Found'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {locale === 'ar' ? 'ابدأ بإضافة وظيفة جديدة لجذب المواهب' : 'Start by adding a new job to attract talent'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {locale === 'ar' ? 'إضافة وظيفة جديدة' : 'Add New Job'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {locale === 'ar' && job.titleAr ? job.titleAr : job.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {locale === 'ar' && job.locationAr ? job.locationAr : job.location}
                            </div>
                          )}
                          {(job.salaryMin || job.salaryMax) && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salaryMin && job.salaryMax
                                ? `${job.salaryMin} - ${job.salaryMax} ${job.salaryCurrency}`
                                : job.salaryMin
                                  ? `${locale === 'ar' ? 'من' : 'From'} ${job.salaryMin} ${job.salaryCurrency}`
                                  : `${locale === 'ar' ? 'حتى' : 'Up to'} ${job.salaryMax} ${job.salaryCurrency}`
                              }
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status === 'ACTIVE' ? (locale === 'ar' ? 'نشط' : 'Active') :
                         job.status === 'DRAFT' ? (locale === 'ar' ? 'مسودة' : 'Draft') :
                         job.status === 'PAUSED' ? (locale === 'ar' ? 'متوقف' : 'Paused') :
                         job.status === 'CLOSED' ? (locale === 'ar' ? 'مغلق' : 'Closed') : job.status}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {locale === 'ar' && job.descriptionAr ? job.descriptionAr : job.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">
                        {getJobTypeLabel(job.jobType)}
                      </Badge>
                      <Badge variant="secondary">
                        {getExperienceLabel(job.experienceLevel)}
                      </Badge>
                      {job.industry && (
                        <Badge variant="outline">
                          {locale === 'ar' && job.industryAr ? job.industryAr : job.industry}
                        </Badge>
                      )}
                    </div>

                    {job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 3} {locale === 'ar' ? 'أخرى' : 'more'}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {job.views} {locale === 'ar' ? 'مشاهدة' : 'views'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.applicationCount} {locale === 'ar' ? 'متقدم' : 'applications'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      {locale === 'ar' ? 'عرض' : 'View'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      {locale === 'ar' ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {locale === 'ar' ? 'حذف' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}