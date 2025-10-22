import EducationForm from "../EducationForm";
import { useState } from "react";

export default function EducationFormExample() {
  const [education, setEducation] = useState([
    {
      id: "1",
      school: "University Name",
      degree: "Bachelor of Science",
      field: "Computer Science",
      location: "Boston, MA",
      startDate: "Sep 2016",
      endDate: "May 2020",
      description: "GPA: 3.8/4.0",
    },
  ]);

  return (
    <div className="p-6 max-w-2xl">
      <EducationForm education={education} onChange={setEducation} />
    </div>
  );
}
