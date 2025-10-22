"use client";

import { MapPin, Clock, DollarSign, Briefcase, Users, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { JobCardProps } from '@/types/jobs';

export default function JobCard({ job, locale = 'en' }: JobCardProps) {
  const t = useTranslations('jobs');
  const isRTL = locale === 'ar';

  return (
    <Link href={`/${locale}/jobs/${job.id}`} className="block group">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 cursor-pointer ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl" />
      </div>

      {/* Urgent Badge */}
      {job.urgent && (
        <div className="absolute top-4 right-4 z-10">
          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {t('urgent')}
          </div>
        </div>
      )}

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
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
              </div>

              {/* Rating */}
              {job.rating && (
                <div className="flex items-center gap-1 bg-background/50 rounded-lg px-2 py-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-medium text-foreground">{job.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className={`flex flex-wrap items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
            {job.remote && (
              <span className="bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-medium ml-2">
                {t('remote')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{job.type}</span>
          </div>

          {job.salary && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium text-foreground">{job.salary}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{job.postedAt}</span>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm text-muted-foreground leading-relaxed line-clamp-3 ${isRTL ? 'text-right' : 'text-left'}`}>
          {job.description}
        </p>

        {/* Tags */}
        {job.tags.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {job.tags.slice(0, 4).map((tag: string, index: number) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-xs font-medium rounded-full hover:border-primary/40 transition-colors duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 4 && (
              <span className="inline-flex items-center px-3 py-1 bg-muted/50 text-muted-foreground text-xs font-medium rounded-full">
                +{job.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex gap-3 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle apply action here
            }}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]"
          >
            {t('apply')}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle save action here
            }}
            className="flex items-center justify-center w-12 h-12 bg-background/60 hover:bg-background rounded-xl transition-all duration-300 hover:scale-105 group/save"
          >
            <svg
              className="w-5 h-5 text-muted-foreground group-hover/save:text-primary transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
    </div>
    </Link>
  );
}