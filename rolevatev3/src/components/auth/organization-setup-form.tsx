"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SetupData {
  // Organization details
  name: string;
  nameAr: string;
  description: string;
  logo: File | null;

  // Admin user details
  adminEmail: string;
  adminPassword: string;
  adminName: string;
}

interface OrganizationSetupFormProps {
  locale: string;
  onComplete: (data: SetupData) => void;
}

export default function OrganizationSetupForm({
  locale,
  onComplete,
}: OrganizationSetupFormProps) {
  const [formData, setFormData] = useState<SetupData>({
    name: "",
    nameAr: "",
    description: "",
    logo: null,
    adminEmail: "",
    adminPassword: "",
    adminName: "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<SetupData>>({});

  const t = useTranslations("employerSignup.setup");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<SetupData> = {};

    // Organization validation
    if (!formData.name.trim()) {
      newErrors.name = t("validation.nameRequired");
    }

    // Admin user validation
    if (!formData.adminName.trim()) {
      newErrors.adminName = t("validation.adminNameRequired");
    }
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = t("validation.adminEmailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = t("validation.adminEmailInvalid");
    }
    if (!formData.adminPassword) {
      newErrors.adminPassword = t("validation.adminPasswordRequired");
    } else if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = t("validation.adminPasswordMinLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for API submission
      const apiFormData = new FormData();

      // Organization details
      apiFormData.append("name", formData.name);
      if (formData.nameAr.trim()) {
        apiFormData.append("nameAr", formData.nameAr);
      }
      if (formData.description.trim()) {
        apiFormData.append("description", formData.description);
      }

      // Admin user details
      apiFormData.append("adminEmail", formData.adminEmail);
      apiFormData.append("adminPassword", formData.adminPassword);
      apiFormData.append("adminName", formData.adminName);

      // Optional logo
      if (formData.logo) {
        apiFormData.append("logo", formData.logo);
      }

      const response = await fetch("/organizations/register", {
        method: "POST",
        body: apiFormData,
      });

      if (!response.ok) {
        throw new Error("Failed to setup organization");
      }

      const result = await response.json();
      onComplete(result);
    } catch (error) {
      console.error("Error setting up organization:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SetupData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Section */}
        <div className="space-y-4">
          <div className={`${locale === "ar" ? "text-right" : "text-left"}`}>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {t("organizationTitle")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("organizationSubtitle")}
            </p>
          </div>

          {/* Organization Name */}
          <div className="space-y-2">
            <label
              className={`text-sm font-medium text-foreground ${
                locale === "ar" ? "text-right" : "text-left"
              } block`}
            >
              {t("nameLabel")} <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={t("namePlaceholder")}
              className={`${locale === "ar" ? "text-right" : "text-left"} ${
                errors.name ? "border-destructive" : ""
              }`}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Organization Name (Arabic) */}
          <div className="space-y-2">
            <label
              className={`text-sm font-medium text-foreground ${
                locale === "ar" ? "text-right" : "text-left"
              } block`}
            >
              {t("nameArLabel")}{" "}
              <span className="text-muted-foreground">({t("optional")})</span>
            </label>
            <Input
              type="text"
              value={formData.nameAr}
              onChange={(e) => handleInputChange("nameAr", e.target.value)}
              placeholder={t("nameArPlaceholder")}
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              className={`text-sm font-medium text-foreground ${
                locale === "ar" ? "text-right" : "text-left"
              } block`}
            >
              {t("descriptionLabel")}{" "}
              <span className="text-muted-foreground">({t("optional")})</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={3}
              className={`w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
                locale === "ar" ? "text-right" : "text-left"
              }`}
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <label
              className={`text-sm font-medium text-foreground ${
                locale === "ar" ? "text-right" : "text-left"
              } block`}
            >
              {t("logoLabel")}{" "}
              <span className="text-muted-foreground">({t("optional")})</span>
            </label>

            <div className="flex items-center gap-4">
              {/* Logo Preview */}
              {logoPreview && (
                <div className="w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* File Input */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("logoHint")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Admin User Section */}
        <div className="space-y-4">
          <div className={`${locale === "ar" ? "text-right" : "text-left"}`}>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {t("adminTitle")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("adminSubtitle")}
            </p>
          </div>

          {/* Admin Name */}
          <div className="space-y-2">
            <label
              className={`text-sm font-medium text-foreground ${
                locale === "ar" ? "text-right" : "text-left"
              } block`}
            >
              {t("adminNameLabel")} <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={formData.adminName}
              onChange={(e) => handleInputChange("adminName", e.target.value)}
              placeholder={t("adminNamePlaceholder")}
              className={`${locale === "ar" ? "text-right" : "text-left"} ${
                errors.adminName ? "border-destructive" : ""
              }`}
            />
            {errors.adminName && (
              <p className="text-xs text-destructive">{errors.adminName}</p>
            )}
          </div>

          {/* Admin Email */}
          <div className="space-y-2">
            <label
              className={`text-sm font-medium text-foreground ${
                locale === "ar" ? "text-right" : "text-left"
              } block`}
            >
              {t("adminEmailLabel")} <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              value={formData.adminEmail}
              onChange={(e) => handleInputChange("adminEmail", e.target.value)}
              placeholder={t("adminEmailPlaceholder")}
              className={`${locale === "ar" ? "text-right" : "text-left"} ${
                errors.adminEmail ? "border-destructive" : ""
              }`}
            />
            {errors.adminEmail && (
              <p className="text-xs text-destructive">{errors.adminEmail}</p>
            )}
          </div>

          {/* Admin Password */}
          <div className="space-y-2">
            <label
              className={`text-sm font-medium text-foreground ${
                locale === "ar" ? "text-right" : "text-left"
              } block`}
            >
              {t("adminPasswordLabel")}{" "}
              <span className="text-destructive">*</span>
            </label>
            <Input
              type="password"
              value={formData.adminPassword}
              onChange={(e) =>
                handleInputChange("adminPassword", e.target.value)
              }
              placeholder={t("adminPasswordPlaceholder")}
              className={`${locale === "ar" ? "text-right" : "text-left"} ${
                errors.adminPassword ? "border-destructive" : ""
              }`}
            />
            {errors.adminPassword && (
              <p className="text-xs text-destructive">{errors.adminPassword}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("adminPasswordHint")}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {t("creating")}
            </div>
          ) : (
            t("complete")
          )}
        </Button>
      </form>
    </div>
  );
}
