import WorkExperienceForm from "../WorkExperienceForm";
import { useState } from "react";

export default function WorkExperienceFormExample() {
  const [experiences, setExperiences] = useState([
    {
      id: "1",
      company: "Acme Inc.",
      position: "Software Engineer",
      location: "San Francisco, CA",
      startDate: "Jan 2020",
      endDate: "Present",
      description: "Developed web applications using React and Node.js",
    },
  ]);

  return (
    <div className="p-6 max-w-2xl">
      <WorkExperienceForm experiences={experiences} onChange={setExperiences} />
    </div>
  );
}
