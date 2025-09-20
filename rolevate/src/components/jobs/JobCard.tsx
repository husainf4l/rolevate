'use client';

import React, { useState } from 'react';
import { MapPin, Clock, DollarSign, Briefcase, Users, Star, Heart, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { JobCardProps } from '@/types/jobs';

const JobCard: React.FC<JobCardProps> = ({
  job,
  locale = 'en',
  onSave,
  onApply,
  isSaved = false,
  className = ''
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
        className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 cursor-pointer ${isRTL ? 'rtl' : 'ltr'} ${className}`}
        role="article"
        aria-label={`Job posting: ${job.title} at ${job.company}`}
      >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl" />
      </div>

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={`${job.company} logo`}
                className="w-12 h-12 rounded-xl object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className={`flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {job.title}
                </h3>
                <p className={`text-sm text-muted-foreground mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {job.company}
                </p>
                {job.companySize && (
                  <p className={`text-xs text-muted-foreground mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {job.companySize} employees
                  </p>
                )}
              </div>

              {/* Rating */}
              {job.rating && (
                <div className="flex items-center gap-1 bg-background/50 rounded-lg px-2 py-1" aria-label={`Company rating: ${job.rating} stars`}>
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                  <span className="text-xs font-medium text-foreground">{job.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className={`flex flex-wrap items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span>{job.location}</span>
            {job.remote && (
              <span className="bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-medium ml-2" aria-label="Remote work available">
                {t('remote')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{formatJobType(job.type)}</span>
          </div>

          {job.salary && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" aria-hidden="true" />
              <span className="font-medium text-foreground">{job.salary}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" aria-hidden="true" />
            <span>{job.postedAt}</span>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm text-muted-foreground leading-relaxed line-clamp-3 ${isRTL ? 'text-right' : 'text-left'}`}>
          {job.description}
        </p>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {job.tags.slice(0, 4).map((tag, index) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-xs font-medium rounded-full hover:border-primary/40 transition-colors duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 4 && (
              <span className="inline-flex items-center px-3 py-1 bg-muted/50 text-muted-foreground text-xs font-medium rounded-full" aria-label={`${job.tags.length - 4} more skills`}>
                +{job.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {job.benefits.slice(0, 3).map((benefit, index) => (
              <span
                key={benefit}
                className="inline-flex items-center px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-md"
              >
                {benefit}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex gap-3 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleApply(e);
            }}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            aria-label={`Apply for ${job.title} position`}
          >
            <span className="flex items-center justify-center gap-2">
              {t('apply')}
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave(e);
            }}
            disabled={isSaving}
            className={`flex items-center justify-center w-12 h-12 bg-background/60 hover:bg-background rounded-xl transition-all duration-300 hover:scale-105 group/save focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
              saved ? 'text-red-500' : 'text-muted-foreground group-hover/save:text-primary'
            }`}
            aria-label={saved ? 'Remove from saved jobs' : 'Save this job'}
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-200 ${saved ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
    </article>
    </Link>
  );
};

export default JobCard;