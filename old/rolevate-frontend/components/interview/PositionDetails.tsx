"use client";

interface PositionDetailsProps {
  title: string;
  department: string;
  skills: string[];
}

export const PositionDetails = ({
  title,
  department,
  skills,
}: PositionDetailsProps) => {
  // Map skills to background colors
  const skillColors: { [key: string]: string } = {
    "Client Relations": "bg-blue-900/50 text-blue-300",
    "Financial Analysis": "bg-green-900/50 text-green-300",
    "Corporate Banking": "bg-purple-900/50 text-purple-300",
    "Risk Management": "bg-red-900/50 text-red-300",
    "Data Analysis": "bg-yellow-900/50 text-yellow-300",
  };

  return (
    <div className="bg-slate-900/40 p-4 rounded-lg">
      <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2">
        Position
      </h3>
      <div className="space-y-1">
        <p className="text-md font-medium">{title}</p>
        <p className="text-sm text-gray-400">{department}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className={`text-xs ${
                skillColors[skill] || "bg-gray-900/50 text-gray-300"
              } px-2 py-0.5 rounded-full`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
