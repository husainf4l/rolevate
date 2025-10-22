import PersonalDetailsForm from "../PersonalDetailsForm";
import { useState } from "react";

export default function PersonalDetailsFormExample() {
  const [data, setData] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    linkedin: "linkedin.com/in/johndoe",
    website: "johndoe.com",
  });

  return (
    <div className="p-6 max-w-2xl">
      <PersonalDetailsForm data={data} onChange={setData} />
    </div>
  );
}
