"use client";

import React from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SkillsManagerProps {
  skills: string[];
  skillSuggestions: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  error?: string | undefined;
}

export default function SkillsManager({ 
  skills, 
  skillSuggestions, 
  onAddSkill, 
  onRemoveSkill, 
  error 
}: SkillsManagerProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1d1d1f] mb-3">
        Required Skills *
      </label>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemoveSkill(skill)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-[#6e6e73]">Popular skills:</span>
          {skillSuggestions.filter(skill => !skills.includes(skill)).slice(0, 8).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => onAddSkill(skill)}
              className="px-3 py-1 text-sm border border-[#d2d2d7] rounded-full hover:bg-[#13ead9] hover:text-white hover:border-[#13ead9] transition-colors"
            >
              {skill}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a skill..."
            className="flex-1 px-3 py-2 border border-[#d2d2d7] rounded-lg focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                e.preventDefault();
                onAddSkill(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              if (input.value) {
                onAddSkill(input.value);
                input.value = '';
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white rounded-lg hover:from-[#0891b2] hover:to-[#0e7490] transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}