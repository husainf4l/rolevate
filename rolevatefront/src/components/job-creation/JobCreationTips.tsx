import React from "react";

const JobCreationTips: React.FC = () => {
  return (
    <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-blue-400 text-sm">💡</span>
        </div>
        <div>
          <h3 className="text-blue-300 font-semibold mb-2">
            Tips for Creating Effective Job Posts
          </h3>
          <ul className="text-sm text-blue-200/80 space-y-1">
            <li>
              • Use clear, specific job titles that candidates would search for
            </li>
            <li>• Include salary ranges to attract the right candidates</li>
            <li>• Be specific about required vs. preferred qualifications</li>
            <li>• Mention growth opportunities and company culture</li>
            <li>
              • Use AI interviews to efficiently screen large candidate pools
            </li>
            <li>
              • Include both Arabic and English if targeting bilingual
              candidates
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JobCreationTips;
