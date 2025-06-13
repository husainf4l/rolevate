import React from "react";
import { JobCreationProps } from "./types";

interface AIInterviewSettingsProps extends JobCreationProps {
  onRegeneratePrompt: () => void;
  onRegenerateInstructions: () => void;
}

const AIInterviewSettings: React.FC<AIInterviewSettingsProps> = ({
  formData,
  fieldErrors,
  onInputChange,
  onRegeneratePrompt,
  onRegenerateInstructions,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        AI Interview Settings
      </h2>

      <div className="flex items-start gap-3 mb-4">
        <input
          type="checkbox"
          name="enableAiInterview"
          checked={formData.enableAiInterview}
          onChange={onInputChange}
          className="w-5 h-5 text-[#00C6AD] bg-gray-700 border-gray-600 rounded focus:ring-[#00C6AD] focus:ring-2 mt-0.5"
        />
        <div>
          <label className="text-gray-300 font-medium">
            Enable AI-powered interview for this position
          </label>
          <p className="text-sm text-gray-400 mt-1">
            AI interviews help screen candidates efficiently with bilingual
            support (Arabic/English) and consistent evaluation criteria.
            Qualified candidates will be invited to an automated interview
            session.
          </p>
        </div>
      </div>

      {formData.enableAiInterview && (
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interview Duration (minutes)
              </label>
              <select
                name="interviewDuration"
                value={formData.interviewDuration || 30}
                onChange={onInputChange}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                  fieldErrors.interviewDuration
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
              >
                <option value={15}>15 minutes (Quick screening)</option>
                <option value={30}>30 minutes (Standard)</option>
                <option value={45}>45 minutes (Comprehensive)</option>
                <option value={60}>60 minutes (Detailed assessment)</option>
              </select>
              {fieldErrors.interviewDuration && (
                <p className="text-red-400 text-sm mt-1">
                  {fieldErrors.interviewDuration}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interview Language
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                defaultValue="both"
              >
                <option value="both">Arabic & English</option>
                <option value="english">English Only</option>
                <option value="arabic">Arabic Only</option>
              </select>
            </div>
          </div>

          {/* AI Prompt Configuration */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI Interview Prompt
                <span className="text-xs text-gray-400 ml-2">
                  (Auto-generated, but you can customize)
                </span>
              </label>
              <textarea
                name="aiPrompt"
                value={formData.aiPrompt || ""}
                onChange={onInputChange}
                rows={8}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                  fieldErrors.aiPrompt ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="AI prompt will be auto-generated based on job details..."
              />
              <div className="flex justify-between items-center mt-1">
                {fieldErrors.aiPrompt && (
                  <p className="text-red-400 text-sm">{fieldErrors.aiPrompt}</p>
                )}
                <p className="text-xs text-gray-400 ml-auto">
                  {formData.aiPrompt?.length || 0}/2000 characters
                </p>
              </div>
              <button
                type="button"
                onClick={onRegeneratePrompt}
                className="mt-2 text-xs bg-[#00C6AD]/20 text-[#00C6AD] px-3 py-1 rounded-md hover:bg-[#00C6AD]/30 transition-colors"
              >
                🔄 Regenerate Prompt
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI Interview Instructions
                <span className="text-xs text-gray-400 ml-2">
                  (Guidelines for the AI interviewer)
                </span>
              </label>
              <textarea
                name="aiInstructions"
                value={formData.aiInstructions || ""}
                onChange={onInputChange}
                rows={6}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                  fieldErrors.aiInstructions
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                placeholder="AI instructions will be auto-generated based on job details..."
              />
              <div className="flex justify-between items-center mt-1">
                {fieldErrors.aiInstructions && (
                  <p className="text-red-400 text-sm">
                    {fieldErrors.aiInstructions}
                  </p>
                )}
                <p className="text-xs text-gray-400 ml-auto">
                  {formData.aiInstructions?.length || 0}/1500 characters
                </p>
              </div>
              <button
                type="button"
                onClick={onRegenerateInstructions}
                className="mt-2 text-xs bg-[#00C6AD]/20 text-[#00C6AD] px-3 py-1 rounded-md hover:bg-[#00C6AD]/30 transition-colors"
              >
                🔄 Regenerate Instructions
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-400">
              💡 AI interviews are automatically scheduled after candidates pass
              initial screening. The prompt and instructions are auto-generated
              but can be customized to match your specific requirements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInterviewSettings;
