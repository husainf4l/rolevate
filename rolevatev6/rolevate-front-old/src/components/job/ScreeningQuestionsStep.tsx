"use client";

import React from "react";
import {
  UserGroupIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ScreeningQuestion, FormErrors } from "./types";
import ScreeningQuestionBuilder from "./ScreeningQuestionBuilder";

interface ScreeningQuestionsStepProps {
  screeningQuestions: ScreeningQuestion[];
  errors: FormErrors;
  onAddQuestion: () => void;
  onUpdateQuestion: (id: string, updates: Partial<ScreeningQuestion>) => void;
  onRemoveQuestion: (id: string) => void;
  onAddPrebuiltQuestion: (question: { question: string; type: ScreeningQuestion['type'] }) => void;
}

const prebuiltQuestions = [
  { question: "Do you have experience with the required technologies?", type: "yes_no" as const },
  { question: "Are you authorized to work in this location?", type: "yes_no" as const },
  { question: "How many years of relevant experience do you have?", type: "number" as const },
  { question: "What is your expected salary range?", type: "text" as const },
  { question: "Are you willing to relocate?", type: "yes_no" as const },
];

export default function ScreeningQuestionsStep({ 
  screeningQuestions, 
  errors, 
  onAddQuestion, 
  onUpdateQuestion, 
  onRemoveQuestion, 
  onAddPrebuiltQuestion 
}: ScreeningQuestionsStepProps) {
  return (
    <div className="p-8 lg:p-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-xl shadow-lg">
          <UserGroupIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Screening Questions</h2>
          <p className="text-[#6e6e73] text-sm mt-1">Add questions to filter and qualify candidates</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
          <p className="text-blue-800 text-sm">
            Add 3-5 screening questions to automatically filter candidates and improve match quality. 
            Questions should be job-relevant and help identify qualified applicants.
          </p>
        </div>

        {/* Pre-built Questions */}
        <div>
          <h3 className="font-semibold text-[#1d1d1f] mb-3">Quick Add Popular Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prebuiltQuestions.map((question, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onAddPrebuiltQuestion(question)}
                className="text-left p-3 border border-[#d2d2d7] rounded-lg hover:border-[#13ead9] hover:bg-[#13ead9]/5 transition-colors"
              >
                <div className="text-sm font-medium text-[#1d1d1f]">{question.question}</div>
                <div className="text-xs text-[#6e6e73] mt-1 capitalize">{question.type.replace('_', ' ')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Questions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1d1d1f]">Custom Questions</h3>
            <button
              type="button"
              onClick={onAddQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white rounded-lg hover:from-[#0891b2] hover:to-[#0e7490] transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Question
            </button>
          </div>

          <div className="space-y-4">
            {screeningQuestions.map((question, index) => (
              <ScreeningQuestionBuilder
                key={question.id}
                question={question}
                index={index}
                errors={errors}
                onUpdate={onUpdateQuestion}
                onRemove={onRemoveQuestion}
              />
            ))}

            {screeningQuestions.length === 0 && (
              <div className="text-center py-8 text-[#6e6e73]">
                <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-[#d2d2d7]" />
                <p className="text-lg font-medium">No screening questions added yet</p>
                <p className="text-sm mt-1">Add questions to help filter and qualify candidates</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

