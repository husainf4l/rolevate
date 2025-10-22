import SkillsForm from "../SkillsForm";
import { useState } from "react";

export default function SkillsFormExample() {
  const [skills, setSkills] = useState(["JavaScript", "React", "Node.js", "TypeScript"]);

  return (
    <div className="p-6 max-w-2xl">
      <SkillsForm skills={skills} onChange={setSkills} />
    </div>
  );
}
