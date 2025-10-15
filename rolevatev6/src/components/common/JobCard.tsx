"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Heart } from "lucide-react";
import { Job } from "@/services";

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

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 border border-slate-200/60 bg-white hover:bg-slate-50/50 rounded-sm">
      <CardContent className="p-4">
        {/* Header with company and save */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-[#0891b2] text-white font-semibold text-sm">
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
        <div className="flex items-center justify-between">
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

        {/* Details button */}
        <div className="mt-4">
          <Link href={`/jobs/${job.id}`}>
            <Button className="w-full bg-[#0891b2] hover:bg-[#0891b2]/90 text-white font-medium rounded-sm">
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}