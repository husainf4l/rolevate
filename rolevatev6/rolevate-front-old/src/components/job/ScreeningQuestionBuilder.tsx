"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ScreeningQuestion, FormErrors } from "./types";

interface ScreeningQuestionBuilderProps {
  question: ScreeningQuestion;
  index: number;
  errors: FormErrors;
  onUpdate: (id: string, updates: Partial<ScreeningQuestion>) => void;
  onRemove: (id: string) => void;
}

export default function ScreeningQuestionBuilder({ 
  question, 
  index, 
  errors, 
  onUpdate, 
  onRemove 
}: ScreeningQuestionBuilderProps) {
  return (
    <div className="bg-white/50 border border-[#d2d2d7] rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
              Question {index + 1}
            </label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => onUpdate(question.id, { question: e.target.value })}
              placeholder="Enter your question..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#13ead9] focus:border-transparent ${
                errors[`screening_${index}`] ? 'border-red-400' : 'border-[#d2d2d7]'
              }`}
            />
            {errors[`screening_${index}`] && (
              <p className="mt-1 text-sm text-red-500">{errors[`screening_${index}`]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                Question Type
              </label>
              <select
                value={question.type}
                onChange={(e) => onUpdate(question.id, { 
                  type: e.target.value as ScreeningQuestion['type'] 
                })}
                className="w-full px-3 py-2 border border-[#d2d2d7] rounded-lg focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
              >
                <option value="yes_no">Yes/No</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="multiple_choice">Multiple Choice</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                Required
              </label>
              <select
                value={question.required ? 'true' : 'false'}
                onChange={(e) => onUpdate(question.id, { 
                  required: e.target.value === 'true' 
                })}
                className="w-full px-3 py-2 border border-[#d2d2d7] rounded-lg focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
              >
                <option value="true">Required</option>
                <option value="false">Optional</option>
              </select>
            </div>
          </div>

          {question.type === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                Options (one per line)
              </label>
              <textarea
                value={question.options?.join('\n') || ''}
                onChange={(e) => onUpdate(question.id, { 
                  options: e.target.value.split('\n').filter(o => o.trim()) 
                })}
                placeholder="Option 1\nOption 2\nOption 3"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#13ead9] focus:border-transparent resize-none ${
                  errors[`screening_options_${index}`] ? 'border-red-400' : 'border-[#d2d2d7]'
                }`}
              />
              {errors[`screening_options_${index}`] && (
                <p className="mt-1 text-sm text-red-500">{errors[`screening_options_${index}`]}</p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemove(question.id)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

