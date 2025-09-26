"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import CandidateSidebar from "@/components/layout/candidate-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  Camera,
  Plus,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    website: "",
    title: "Software Developer",
    professionalSummary:
      "Experienced software developer with 5+ years in full-stack development, specializing in React, Node.js, and cloud technologies. Passionate about creating user-friendly applications and solving complex problems.",
    skills: [
      "JavaScript",
      "React",
      "Node.js",
      "Python",
      "AWS",
      "Docker",
      "Git",
      "Agile",
    ],
  });

  const [newSkill, setNewSkill] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: locale === "ar" ? "تم حفظ التغييرات" : "Changes Saved",
        description:
          locale === "ar"
            ? "تم تحديث ملفك الشخصي بنجاح"
            : "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: locale === "ar" ? "خطأ" : "Error",
        description:
          locale === "ar"
            ? "حدث خطأ أثناء حفظ التغييرات"
            : "An error occurred while saving changes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar locale={locale} />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {locale === "ar" ? "الملف الشخصي" : "Profile"}
            </h1>
            <p className="text-muted-foreground">
              {locale === "ar"
                ? "إدارة معلوماتك الشخصية وملفك المهني"
                : "Manage your personal information and professional profile"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {locale === "ar" ? "نظرة عامة" : "Overview"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage
                          src="/placeholder-avatar.jpg"
                          alt={`${profile.firstName} ${profile.lastName}`}
                        />
                        <AvatarFallback className="text-lg">
                          {profile.firstName.charAt(0)}
                          {profile.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.title}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {locale === "ar" ? "نشط" : "Active"}
                      </Badge>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {locale === "ar" ? "الملف مكتمل" : "Profile Complete"}
                      </span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {locale === "ar"
                          ? "انضم في يناير 2024"
                          : "Joined January 2024"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {locale === "ar"
                      ? "المعلومات الشخصية"
                      : "Personal Information"}
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      {locale === "ar" ? "تعديل" : "Edit"}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {locale === "ar"
                      ? "معلوماتك الأساسية"
                      : "Your basic information"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        {locale === "ar" ? "الاسم الأول" : "First Name"}
                      </Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        {locale === "ar" ? "اسم العائلة" : "Last Name"}
                      </Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {locale === "ar" ? "البريد الإلكتروني" : "Email"}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        {locale === "ar" ? "رقم الهاتف" : "Phone"}
                      </Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">
                        {locale === "ar" ? "الموقع" : "Location"}
                      </Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">
                        {locale === "ar" ? "الموقع الإلكتروني" : "Website"}
                      </Label>
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                        placeholder="https://"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        {locale === "ar" ? "المسمى الوظيفي" : "Job Title"}
                      </Label>
                      <Input
                        id="title"
                        value={profile.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {locale === "ar" ? "الملخص المهني" : "Professional Summary"}
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      {locale === "ar" ? "تعديل" : "Edit"}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {locale === "ar"
                      ? "وصف موجز عن خبراتك ومهاراتك"
                      : "A brief description of your experience and skills"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={profile.professionalSummary}
                    onChange={(e) =>
                      handleInputChange("professionalSummary", e.target.value)
                    }
                    placeholder={
                      locale === "ar"
                        ? "اكتب ملخصاً مهنياً..."
                        : "Write a professional summary..."
                    }
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {locale === "ar" ? "المهارات" : "Skills"}
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      {locale === "ar" ? "تعديل" : "Edit"}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {locale === "ar"
                      ? "مهاراتك التقنية والمهنية"
                      : "Your technical and professional skills"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground flex items-center gap-1"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          {skill}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder={
                          locale === "ar"
                            ? "أضف مهارة جديدة..."
                            : "Add new skill..."
                        }
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading
                    ? locale === "ar"
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : locale === "ar"
                    ? "حفظ التغييرات"
                    : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
