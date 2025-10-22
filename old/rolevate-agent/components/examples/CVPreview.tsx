import CVPreview from "../CVPreview";

export default function CVPreviewExample() {
  const mockData = {
    personalDetails: {
      fullName: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/sarahjohnson",
      website: "sarahjohnson.dev",
    },
    summary: "Experienced software engineer with 5+ years of expertise in building scalable web applications. Passionate about creating intuitive user experiences and writing clean, maintainable code.",
    workExperience: [
      {
        id: "1",
        company: "Tech Innovations Inc.",
        position: "Senior Software Engineer",
        location: "San Francisco, CA",
        startDate: "Jan 2021",
        endDate: "Present",
        description: "Led development of core platform features serving 1M+ users\nImplemented CI/CD pipeline reducing deployment time by 60%\nMentored junior developers and conducted code reviews",
      },
      {
        id: "2",
        company: "StartupXYZ",
        position: "Software Engineer",
        location: "Remote",
        startDate: "Jun 2019",
        endDate: "Dec 2020",
        description: "Built RESTful APIs using Node.js and Express\nDeveloped responsive web applications with React\nCollaborated with design team on UX improvements",
      },
    ],
    education: [
      {
        id: "1",
        school: "University of California, Berkeley",
        degree: "Bachelor of Science",
        field: "Computer Science",
        location: "Berkeley, CA",
        startDate: "Sep 2015",
        endDate: "May 2019",
        description: "GPA: 3.8/4.0\nRelevant Coursework: Data Structures, Algorithms, Web Development",
      },
    ],
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "SQL",
      "Git",
      "AWS",
      "Docker",
      "REST APIs",
    ],
  };

  return <CVPreview data={mockData} />;
}
