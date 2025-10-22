'use client';

import React, { useState } from 'react';
import { MapPin, Clock, DollarSign, Briefcase, Users, Star, Heart, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { JobCardProps } from '@/types/jobs';
import { Button } from '@/components/common';

const JobCard: React.FC<JobCardProps> = ({
  job,
  locale = 'en',
  onSave,
  onApply,
  isSaved = false,
  className = '',
  variant = 'primary'
}) => {
  const t = useTranslations('jobs');
  const isRTL = locale === 'ar';
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(job.id);
        setSaved(!saved);
      } catch (error) {
        console.error('Failed to save job:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApply) {
      try {
        await onApply(job.id);
      } catch (error) {
        console.error('Failed to apply for job:', error);
      }
    }
  };

  const formatJobType = (type: string) => {
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Link href={`/${locale}/jobs/${job.id}`} className="block">
      <article
        className={`group relative rounded-2xl hover:shadow-xl transition-all duration-500 cursor-pointer shadow-lg hover:-translate-y-1 ${
          variant === 'primary'
            ? 'bg-card'
            : 'bg-secondary'
        } ${isRTL ? 'rtl' : 'ltr'} ${className}`}
        role="article"
        aria-label={`Job posting: ${job.title} at ${job.company}`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className={`flex items-start gap-4 sm:gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={`${job.company} logo`}
                  className="w-16 h-16 rounded-xl object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" aria-hidden="true" />
                </div>
              )}
            </div>

            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg sm:text-xl font-medium text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {job.title}
                  </h3>
                  <p className={`text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 transition-colors duration-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {job.company}
                  </p>
                  {job.companySize && (
                    <p className={`text-sm text-muted-foreground mt-1 transition-colors duration-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {job.companySize} employees
                    </p>
                  )}
                </div>

                {/* Rating */}
                {job.rating && (
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 transition-colors duration-300" aria-label={`Company rating: ${job.rating} stars`}>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                    <span className="text-sm font-medium text-foreground transition-colors duration-300">{job.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className={`flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-sm sm:text-base text-muted-foreground mt-4 sm:mt-6 transition-colors duration-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground transition-colors duration-300" aria-hidden="true" />
              <span>{job.location}</span>
              {job.remote && (
                <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium ml-2 transition-colors duration-300" aria-label="Remote work available">
                  {t('remote')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground transition-colors duration-300" aria-hidden="true" />
              <span>{formatJobType(job.type)}</span>
            </div>

            {job.salary && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-muted-foreground transition-colors duration-300" aria-hidden="true" />
                <span className="font-medium text-foreground transition-colors duration-300">{job.salary}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground transition-colors duration-300" aria-hidden="true" />
              <span>{job.postedAt}</span>
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3 mt-4 sm:mt-6 transition-colors duration-300 ${isRTL ? 'text-right' : 'text-left'}`}>
            {job.description}
          </p>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className={`flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {job.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-primary/10 text-primary text-xs sm:text-sm font-medium rounded-md sm:rounded-lg"
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 4 && (
                <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-muted text-muted-foreground text-xs sm:text-sm font-medium rounded-md sm:rounded-lg" aria-label={`${job.tags.length - 4} more skills`}>
                  +{job.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className={`flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {job.benefits.slice(0, 3).map((benefit) => (
                <span
                  key={benefit}
                  className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-accent/10 text-accent text-xs sm:text-sm font-medium rounded-md sm:rounded-lg"
                >
                  {benefit}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 mt-4 sm:mt-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleApply(e);
              }}
              variant="gradient"
              size="lg"
              rightIcon={<ExternalLink className="w-4 h-4" />}
              className="transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              aria-label={`Apply for ${job.title} position`}
            >
              {t('apply')}
            </Button>

            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave(e);
              }}
              variant={saved ? 'destructive' : 'icon-secondary'}
              size="icon"
              disabled={isSaving}
              className="w-12 h-12 sm:w-14 sm:h-14"
              aria-label={saved ? 'Remove from saved jobs' : 'Save this job'}
            >
              <Heart
                className={`w-6 h-6 transition-all duration-300 ${saved ? 'fill-current scale-110' : 'group-hover:text-red-500'}`}
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default JobCard;