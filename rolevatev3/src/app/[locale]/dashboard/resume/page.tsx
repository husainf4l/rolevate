import type { Metadata } from "next";
import CandidateSidebar from "@/components/layout/candidate-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Eye,
  Edit,
  Plus,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Upload,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Resume - Rolevate",
  description: "Manage and optimize your resume",
};

export default async function ResumePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const resumeData = {
    personalInfo: {
      name: "John Doe",
      title: "Senior Frontend Developer",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      linkedin: "linkedin.com/in/johndoe",
      website: "johndoe.dev",
    },
    summary:
      "Experienced frontend developer with 5+ years of expertise in React, TypeScript, and modern web technologies. Passionate about creating user-friendly applications and solving complex problems.",
    experience: [
      {
        id: 1,
        title: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        location: "New York, NY",
        period: "Jan 2022 - Present",
        description:
          "Led a team of 4 developers in building scalable React applications. Improved performance by 40% and user engagement by 25%.",
        achievements: [
          "Reduced application load time by 40%",
          "Implemented CI/CD pipeline",
          "Mentored junior developers",
        ],
      },
      {
        id: 2,
        title: "Frontend Developer",
        company: "StartupXYZ",
        location: "San Francisco, CA",
        period: "Mar 2020 - Dec 2021",
        description:
          "Developed and maintained multiple client-facing applications using React and Node.js.",
        achievements: [
          "Built 5+ production applications",
          "Collaborated with design team",
          "Implemented responsive designs",
        ],
      },
    ],
    education: [
      {
        id: 1,
        degree: "Bachelor of Science in Computer Science",
        school: "University of Technology",
        location: "New York, NY",
        period: "2016 - 2020",
        gpa: "3.8/4.0",
      },
    ],
    skills: [
      { name: "JavaScript", level: 95 },
      { name: "React", level: 90 },
      { name: "TypeScript", level: 85 },
      { name: "Node.js", level: 80 },
      { name: "Python", level: 75 },
      { name: "AWS", level: 70 },
    ],
    certifications: [
      {
        name: "AWS Certified Developer",
        issuer: "Amazon Web Services",
        date: "2023",
        expiry: "2026",
      },
      {
        name: "React Developer Certification",
        issuer: "Meta",
        date: "2022",
        expiry: "2025",
      },
    ],
    languages: [
      { name: "English", level: "Native" },
      { name: "Spanish", level: "Intermediate" },
    ],
  };

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar locale={locale} />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {locale === "ar" ? "السيرة الذاتية" : "Resume"}
            </h1>
            <p className="text-muted-foreground">
              {locale === "ar"
                ? "إدارة وتحسين سيرتك الذاتية للحصول على فرص أفضل"
                : "Manage and optimize your resume to get better opportunities"}
            </p>
          </div>

          {/* Resume Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {locale === "ar" ? "معاينة" : "Preview"}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {locale === "ar" ? "تحميل PDF" : "Download PDF"}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {locale === "ar" ? "رفع سيرة ذاتية" : "Upload Resume"}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              {locale === "ar" ? "تعديل" : "Edit"}
            </Button>
          </div>

          {/* Resume Quality Score */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {locale === "ar"
                  ? "جودة السيرة الذاتية"
                  : "Resume Quality Score"}
              </CardTitle>
              <CardDescription>
                {locale === "ar"
                  ? "نسبة اكتمال سيرتك الذاتية وفعاليتها"
                  : "Your resume completion and effectiveness score"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    85%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {locale === "ar" ? "النسبة العامة" : "Overall Score"}
                  </div>
                  <Progress value={85} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    9/10
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {locale === "ar" ? "المهارات" : "Skills"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    8/10
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {locale === "ar" ? "الخبرة" : "Experience"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    7/10
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {locale === "ar" ? "التعليم" : "Education"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">
                {locale === "ar" ? "نظرة عامة" : "Overview"}
              </TabsTrigger>
              <TabsTrigger value="experience">
                {locale === "ar" ? "الخبرة" : "Experience"}
              </TabsTrigger>
              <TabsTrigger value="education">
                {locale === "ar" ? "التعليم" : "Education"}
              </TabsTrigger>
              <TabsTrigger value="skills">
                {locale === "ar" ? "المهارات" : "Skills"}
              </TabsTrigger>
              <TabsTrigger value="certifications">
                {locale === "ar" ? "الشهادات" : "Certifications"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {locale === "ar"
                      ? "المعلومات الشخصية"
                      : "Personal Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        {locale === "ar" ? "الاسم الكامل" : "Full Name"}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {resumeData.personalInfo.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {locale === "ar" ? "المسمى الوظيفي" : "Job Title"}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {resumeData.personalInfo.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {locale === "ar" ? "البريد الإلكتروني" : "Email"}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {resumeData.personalInfo.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {locale === "ar" ? "رقم الهاتف" : "Phone"}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {resumeData.personalInfo.phone}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {locale === "ar" ? "الموقع" : "Location"}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {resumeData.personalInfo.location}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">LinkedIn</label>
                      <p className="text-sm text-muted-foreground">
                        {resumeData.personalInfo.linkedin}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {locale === "ar" ? "الملخص المهني" : "Professional Summary"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {resumeData.summary}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
              {resumeData.experience.map((exp) => (
                <Card key={exp.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          {exp.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {exp.company} • {exp.location}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{exp.period}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {exp.description}
                    </p>
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {locale === "ar"
                          ? "الإنجازات الرئيسية"
                          : "Key Achievements"}
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {exp.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {locale === "ar" ? "إضافة خبرة جديدة" : "Add New Experience"}
              </Button>
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              {resumeData.education.map((edu) => (
                <Card key={edu.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5" />
                          {edu.degree}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {edu.school} • {edu.location}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{edu.period}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      GPA: {edu.gpa}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {locale === "ar" ? "إضافة تعليم جديد" : "Add New Education"}
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resumeData.skills.map((skill) => (
                  <Card key={skill.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {skill.level}%
                        </span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {locale === "ar" ? "إضافة مهارة جديدة" : "Add New Skill"}
              </Button>
            </TabsContent>

            <TabsContent value="certifications" className="space-y-4">
              {resumeData.certifications.map((cert, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          {cert.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {cert.issuer}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{cert.date}</Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {locale === "ar" ? "ينتهي في" : "Expires"}{" "}
                          {cert.expiry}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {locale === "ar"
                  ? "إضافة شهادة جديدة"
                  : "Add New Certification"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
