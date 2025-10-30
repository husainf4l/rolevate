"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Heart } from "lucide-react";
import { Job } from "@/types/jobs";

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
  showSaveButton?: boolean;
}

export default function JobCard({
  job,
  onSave,
  isSaved = false,
  showSaveButton = false,
}: JobCardProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving || !onSave) return;
    setIsSaving(true);
    try {
      onSave(job.id.toString());
    } catch (error) {
      console.error("Failed to save/unsave job:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get company logo from job data
  const getCompanyLogo = (): string | undefined => {
    // Check for companyLogo property first
    if ((job as any).companyLogo) {
      return (job as any).companyLogo;
    }
    // Then check for company object with logo
    if ((job as any).company?.logo) {
      return (job as any).company.logo;
    }
    return undefined;
  };

  const companyLogo = getCompanyLogo();

  // Format posted date
  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Posted today";
    if (diffDays === 2) return "Posted yesterday";
    if (diffDays <= 7) return `Posted ${diffDays - 1} days ago`;
    if (diffDays <= 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
  };

  // Format deadline date
  const formatDeadlineDate = (deadlineString: string) => {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Deadline passed";
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else if (diffDays <= 30) {
      return `Due in ${Math.floor(diffDays / 7)} weeks`;
    } else {
      return `Due ${deadline.toLocaleDateString()}`;
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 border border-slate-200/60 bg-white hover:bg-slate-50/50 rounded-sm">
      <CardContent className="p-4">
        {/* Header with company and save */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 rounded-sm">
              {companyLogo ? (
                <AvatarImage 
                  src={companyLogo} 
                  alt={job.company}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-[#0891b2] text-white font-semibold text-sm rounded-sm">
                {job.company.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-slate-900">{job.company}</p>
              <Badge variant="secondary" className="text-xs px-2 py-0 bg-slate-100 text-slate-600 rounded-sm">
                {job.type}
              </Badge>
            </div>
          </div>

          {showSaveButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={isSaving}
              className="p-1.5 rounded-sm hover:bg-slate-100 transition-colors disabled:opacity-50"
              aria-label={isSaved ? "Unsave job" : "Save job"}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved
                    ? "fill-red-500 text-red-500"
                    : "text-slate-400 hover:text-red-400"
                }`}
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>

        {/* Job title */}
        <h3 className="font-semibold text-slate-900 mb-2 leading-tight text-base group-hover:text-teal-700 transition-colors">
          {job.title}
        </h3>

        {/* Location and salary */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          {job.salary && (
            <Badge className="bg-[#0891b2] text-white hover:bg-[#0891b2]/90 text-sm px-3 py-1 rounded-sm">
              {job.salary}
            </Badge>
          )}
        </div>

        {/* Posted date */}
        <div className="text-xs text-slate-500 mb-3">
          {formatPostedDate(job.createdAt)}
        </div>

        {/* Deadline */}
        {job.deadline && (
          <div className={`text-xs mb-3 font-medium ${
            new Date(job.deadline) < new Date() 
              ? 'text-red-600' 
              : new Date(job.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                ? 'text-orange-600'
                : 'text-slate-600'
          }`}>
            {formatDeadlineDate(job.deadline)}
          </div>
        )}

        {/* Skills preview */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {job.skills.slice(0, 3).map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0.5 bg-slate-50 text-slate-600 border-slate-200 rounded-sm"
              >
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 bg-slate-50 text-slate-600 border-slate-200 rounded-sm"
              >
                +{job.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Details button */}
        <div className="mt-4">
          <Link href={`/jobs/${job.slug}`}>
            <Button className="w-full bg-[#0891b2] hover:bg-[#0891b2]/90 text-white font-medium rounded-sm">
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}