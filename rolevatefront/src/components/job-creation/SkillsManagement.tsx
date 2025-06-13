import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { SkillManagementProps } from "./types";

const SkillsManagement: React.FC<SkillManagementProps> = ({
  skills,
  skillInput,
  skillSuggestions,
  fieldErrors,
  onSkillInputChange,
  onAddSkill,
  onRemoveSkill,
  onSkillSuggestionClick,
  onKeyPress,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Required Skills *
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Add relevant skills, technologies, or qualifications. Examples:
          React.js, Project Management, Arabic/English, Banking Experience
        </p>
        <div className="mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => onSkillInputChange(e.target.value)}
              onKeyPress={onKeyPress}
              className={`flex-1 px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                fieldErrors.skills ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Type a skill and press Enter or click Add..."
            />
            <button
              type="button"
              onClick={onAddSkill}
              disabled={!skillInput.trim()}
              className="px-4 py-3 bg-[#00C6AD] text-white rounded-lg hover:bg-[#14B8A6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add
            </button>
          </div>
          {fieldErrors.skills && (
            <p className="text-red-400 text-sm mt-1">{fieldErrors.skills}</p>
          )}
        </div>

        {/* Smart Skills Suggestions */}
        {skillInput.length > 2 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {skillSuggestions
                .filter(
                  (skill) =>
                    skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                    !skills.includes(skill)
                )
                .slice(0, 6)
                .map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => onSkillSuggestionClick(skill)}
                    className="px-3 py-1 text-xs bg-gray-600 text-gray-300 rounded-full hover:bg-[#00C6AD] hover:text-white transition-colors"
                  >
                    + {skill}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Popular Skills Suggestions */}
        {skills.length === 0 && skillInput.length === 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">
              Popular skills to get you started:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "JavaScript",
                "React.js",
                "Node.js",
                "Python",
                "Project Management",
                "Arabic",
                "English",
                "Banking",
                "Finance",
                "Leadership",
              ].map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => onSkillSuggestionClick(skill)}
                  className="px-3 py-1 text-xs bg-gray-600 text-gray-300 rounded-full hover:bg-[#00C6AD] hover:text-white transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skills Display */}
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-2 bg-[#00C6AD]/10 border border-[#00C6AD]/30 text-[#00C6AD] rounded-lg text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemoveSkill(skill)}
                className="text-[#00C6AD] hover:text-red-400 transition-colors"
                title="Remove skill"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {skills.length > 0 && (
          <p className="text-green-400 text-sm mt-2">
            ✓ {skills.length} skill
            {skills.length !== 1 ? "s" : ""} added
          </p>
        )}
      </div>
    </div>
  );
};

export default SkillsManagement;
