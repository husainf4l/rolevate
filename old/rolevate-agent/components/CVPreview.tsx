import { CVData } from "@shared/schema";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

interface CVPreviewProps {
  data: CVData;
}

export default function CVPreview({ data }: CVPreviewProps) {
  return (
    <div
      id="cv-preview"
      className="bg-white text-black w-full mx-auto shadow-xl p-12"
      style={{ 
        minHeight: "297mm",
        fontFamily: "Inter, system-ui, sans-serif"
      }}
    >
      <div className="space-y-6">
        <div className="border-b border-gray-300 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data.personalDetails.fullName || "Your Name"}
          </h1>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            {data.personalDetails.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>{data.personalDetails.email}</span>
              </div>
            )}
            {data.personalDetails.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>{data.personalDetails.phone}</span>
              </div>
            )}
            {data.personalDetails.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{data.personalDetails.location}</span>
              </div>
            )}
            {data.personalDetails.linkedin && (
              <div className="flex items-center gap-1.5">
                <Linkedin className="w-4 h-4" />
                <span>{data.personalDetails.linkedin}</span>
              </div>
            )}
            {data.personalDetails.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>{data.personalDetails.website}</span>
              </div>
            )}
          </div>
        </div>

        {data.summary && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 uppercase tracking-wide border-t border-gray-300 pt-6">
              Work Experience
            </h2>
            <div className="space-y-4">
              {data.workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                    </div>
                    <div className="text-sm text-gray-600 text-right">
                      <p>{exp.startDate} - {exp.endDate}</p>
                      {exp.location && <p>{exp.location}</p>}
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mt-2 whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 uppercase tracking-wide border-t border-gray-300 pt-6">
              Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-700">{edu.school}</p>
                      {edu.field && <p className="text-gray-600 text-sm">{edu.field}</p>}
                    </div>
                    <div className="text-sm text-gray-600 text-right">
                      <p>{edu.startDate} - {edu.endDate}</p>
                      {edu.location && <p>{edu.location}</p>}
                    </div>
                  </div>
                  {edu.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mt-2 whitespace-pre-line">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 uppercase tracking-wide border-t border-gray-300 pt-6">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
