import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  Users, 
  Building2, 
  Star,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface LatestJobsProps {
  locale: string;
}

// Mock data for latest jobs
const latestJobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'Dubai, UAE',
    type: 'Full-time',
    salary: '$8,000 - $12,000',
    posted: '2 days ago',
    applicants: 24,
    featured: true
  },
  {
    id: 2,
    title: 'UX/UI Designer',
    company: 'Design Studio',
    location: 'Riyadh, Saudi Arabia',
    type: 'Full-time',
    salary: '$6,000 - $9,000',
    posted: '1 week ago',
    applicants: 18,
    featured: false
  },
  {
    id: 3,
    title: 'Backend Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    type: 'Full-time',
    salary: '$7,000 - $10,000',
    posted: '3 days ago',
    applicants: 31,
    featured: false
  },
  {
    id: 4,
    title: 'Product Manager',
    company: 'Innovation Labs',
    location: 'Abu Dhabi, UAE',
    type: 'Full-time',
    salary: '$10,000 - $15,000',
    posted: '5 days ago',
    applicants: 12,
    featured: true
  },
  {
    id: 5,
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    location: 'Kuwait City, Kuwait',
    type: 'Full-time',
    salary: '$9,000 - $13,000',
    posted: '4 days ago',
    applicants: 19,
    featured: false
  },
  {
    id: 6,
    title: 'Data Scientist',
    company: 'AI Research Lab',
    location: 'Doha, Qatar',
    type: 'Full-time',
    salary: '$11,000 - $16,000',
    posted: '6 days ago',
    applicants: 27,
    featured: true
  }
];

export default function LatestJobs({ locale }: LatestJobsProps) {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {locale === 'ar' ? 'أحدث الوظائف' : 'Latest Jobs'}
          </h2>
          <p className="text-muted-foreground">
            {locale === 'ar' 
              ? 'اكتشف الفرص الوظيفية المتاحة'
              : 'Discover available job opportunities'
            }
          </p>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {latestJobs.slice(0, 6).map((job) => (
            <Card key={job.id} className="group hover:shadow-md transition-all duration-200 border-border/30 hover:border-primary/30">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      {job.featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs px-2 py-0.5">
                          <Star className="w-3 h-3 mr-1" />
                          {locale === 'ar' ? 'مميز' : 'Featured'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{job.company}</span>
                    </div>
                  </div>
                </div>

                {/* Location and Salary */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{job.salary}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{job.posted}</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{job.applicants}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/business/jobs`}>
              {locale === 'ar' ? 'عرض جميع الوظائف' : 'View All Jobs'}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
