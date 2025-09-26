"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User, ChevronRight, ArrowRight } from "lucide-react";
import { BlogPost, BlogCategory } from "@/types/blog";
import { blogService } from "@/services/blog";

interface BlogSectionProps {
  locale: string;
}

export default function BlogSection({ locale }: BlogSectionProps) {
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPost[]>([]);
  const [moreBlogs, setMoreBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Get featured blogs for the main display
        const featuredResponse = await blogService.getFeaturedBlogs(2);
        if (featuredResponse.success && featuredResponse.blogs) {
          setFeaturedBlogs(featuredResponse.blogs);
        }

        // Get more blogs for horizontal scroll
        const moreBlogsResponse = await blogService.getBlogs(1, 6);
        if (moreBlogsResponse.success && moreBlogsResponse.blogs) {
          // Filter out featured blogs and take next 4
          const nonFeaturedBlogs = moreBlogsResponse.blogs
            .filter((blog) => !blog.featured)
            .slice(0, 4);
          setMoreBlogs(nonFeaturedBlogs);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const getCategoryLabel = (category: BlogCategory) => {
    const labels = {
      [BlogCategory.RECRUITMENT]: locale === "ar" ? "التوظيف" : "Recruitment",
      [BlogCategory.CAREER_ADVICE]:
        locale === "ar" ? "نصائح مهنية" : "Career Advice",
      [BlogCategory.HR_INSIGHTS]:
        locale === "ar" ? "رؤى الموارد البشرية" : "HR Insights",
      [BlogCategory.COMPANY_CULTURE]:
        locale === "ar" ? "ثقافة الشركة" : "Company Culture",
      [BlogCategory.JOB_SEARCH]:
        locale === "ar" ? "البحث عن وظيفة" : "Job Search",
      [BlogCategory.INTERVIEW_TIPS]:
        locale === "ar" ? "نصائح المقابلات" : "Interview Tips",
      [BlogCategory.WORKPLACE_TRENDS]:
        locale === "ar" ? "اتجاهات مكان العمل" : "Workplace Trends",
      [BlogCategory.EMPLOYEE_ENGAGEMENT]:
        locale === "ar" ? "إشراك الموظفين" : "Employee Engagement",
    };
    return labels[category] || category;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {[1, 2].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {locale === "ar" ? "مدونة التوظيف" : "Recruitment Blog"}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {locale === "ar"
              ? "اكتشف أحدث الأخبار والنصائح حول التوظيف والتطوير المهني"
              : "Discover the latest news and tips about recruitment and career development"}
          </p>
        </div>

        {/* Featured Blogs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {featuredBlogs.map((blog) => (
            <Card
              key={blog.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={blog.featuredImage}
                  alt={
                    locale === "ar" && blog.titleAr ? blog.titleAr : blog.title
                  }
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground">
                    {getCategoryLabel(blog.category)}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link href={`/blog/${blog.slug}`}>
                    {locale === "ar" && blog.titleAr
                      ? blog.titleAr
                      : blog.title}
                  </Link>
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {locale === "ar" && blog.excerptAr
                    ? blog.excerptAr
                    : blog.excerpt}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>
                      {locale === "ar" && blog.author.nameAr
                        ? blog.author.nameAr
                        : blog.author.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {blog.readingTime}{" "}
                      {locale === "ar" ? "دقيقة" : "min read"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(blog.publishedAt)}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="group-hover:text-primary"
                  >
                    <Link href={`/${locale}/blog/${blog.slug}`}>
                      {locale === "ar" ? "اقرأ المزيد" : "Read More"}
                      <ArrowRight
                        className={`w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 ${
                          locale === "ar" ? "rotate-180" : ""
                        }`}
                      />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* More Blogs - Same layout as featured */}
        {moreBlogs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {locale === "ar" ? "المزيد من المقالات" : "More Articles"}
              </h3>
              <Button variant="outline" asChild>
                <Link href="/blog">
                  {locale === "ar" ? "عرض الكل" : "View All"}
                  <ChevronRight
                    className={`w-4 h-4 ml-2 ${
                      locale === "ar" ? "rotate-180" : ""
                    }`}
                  />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {moreBlogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={blog.featuredImage}
                      alt={
                        locale === "ar" && blog.titleAr
                          ? blog.titleAr
                          : blog.title
                      }
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-primary-foreground">
                        {getCategoryLabel(blog.category)}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      <Link href={`/blog/${blog.slug}`}>
                        {locale === "ar" && blog.titleAr
                          ? blog.titleAr
                          : blog.title}
                      </Link>
                    </h4>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm">
                      {locale === "ar" && blog.excerptAr
                        ? blog.excerptAr
                        : blog.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>
                          {locale === "ar" && blog.author.nameAr
                            ? blog.author.nameAr
                            : blog.author.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {blog.readingTime}{" "}
                          {locale === "ar" ? "دقيقة" : "min read"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(blog.publishedAt)}</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="group-hover:text-primary"
                      >
                        <Link href={`/blog/${blog.slug}`}>
                          {locale === "ar" ? "اقرأ المزيد" : "Read More"}
                          <ArrowRight
                            className={`w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 ${
                              locale === "ar" ? "rotate-180" : ""
                            }`}
                          />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/blog">
              {locale === "ar"
                ? "استكشف جميع المقالات"
                : "Explore All Articles"}
              <ArrowRight
                className={`w-5 h-5 ml-2 ${
                  locale === "ar" ? "rotate-180" : ""
                }`}
              />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
