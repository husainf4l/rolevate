import SummaryForm from "../SummaryForm";
import { useState } from "react";

export default function SummaryFormExample() {
  const [summary, setSummary] = useState(
    "Experienced software engineer with a passion for building scalable web applications."
  );

  return (
    <div className="p-6 max-w-2xl">
      <SummaryForm summary={summary} onChange={setSummary} />
    </div>
  );
}
