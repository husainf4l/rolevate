import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { BlogCategory } from '@/types/blog';
import { blogService } from '@/services/blog';
import { Navbar } from '@/components/layout';
import Footer from '@/components/common/footer';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogPage({
  params,
  searchParams
}: BlogPageProps) {
  const { locale } = await params;
  const { page = '1', category } = await searchParams;

  const currentPage = parseInt(page);
  const selectedCategory = category as BlogCategory | undefined;

  // Fetch blogs
  const blogsResponse = await blogService.getBlogs(
    currentPage,
    9,
    selectedCategory
  );

  const blogs = blogsResponse.blogs || [];
  const totalBlogs = blogsResponse.total || 0;
  const totalPages = Math.ceil(totalBlogs / 9);

  const getCategoryLabel = (category: BlogCategory) => {
    const labels = {
      [BlogCategory.RECRUITMENT]: locale === 'ar' ? 'التوظيف' : 'Recruitment',
      [BlogCategory.CAREER_ADVICE]: locale === 'ar' ? 'نصائح مهنية' : 'Career Advice',
      [BlogCategory.HR_INSIGHTS]: locale === 'ar' ? 'رؤى الموارد البشرية' : 'HR Insights',
      [BlogCategory.COMPANY_CULTURE]: locale === 'ar' ? 'ثقافة الشركة' : 'Company Culture',
      [BlogCategory.JOB_SEARCH]: locale === 'ar' ? 'البحث عن وظيفة' : 'Job Search',
      [BlogCategory.INTERVIEW_TIPS]: locale === 'ar' ? 'نصائح المقابلات' : 'Interview Tips',
      [BlogCategory.WORKPLACE_TRENDS]: locale === 'ar' ? 'اتجاهات مكان العمل' : 'Workplace Trends',
      [BlogCategory.EMPLOYEE_ENGAGEMENT]: locale === 'ar' ? 'إشراك الموظفين' : 'Employee Engagement',
    };
    return labels[category] || category;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const categories = Object.values(BlogCategory);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {locale === 'ar' ? 'مدونة التوظيف' : 'Recruitment Blog'}
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              {locale === 'ar'
                ? 'اكتشف أحدث الأخبار والنصائح حول التوظيف والتطوير المهني'
                : 'Discover the latest news and tips about recruitment and career development'
              }
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {locale === 'ar' ? 'الفئات' : 'Categories'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/blog"
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {locale === 'ar' ? 'جميع المقالات' : 'All Articles'}
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/blog?category=${cat}`}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {getCategoryLabel(cat)}
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {/* Results Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {selectedCategory
                  ? `${getCategoryLabel(selectedCategory)} ${locale === 'ar' ? 'المقالات' : 'Articles'}`
                  : (locale === 'ar' ? 'جميع المقالات' : 'All Articles')
                }
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {locale === 'ar'
                  ? `${totalBlogs} مقالة متاحة`
                  : `${totalBlogs} articles available`
                }
              </p>
            </div>

            {/* Blog Grid */}
            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                {blogs.map((blog) => (
                  <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={blog.featuredImage}
                        alt={locale === 'ar' && blog.titleAr ? blog.titleAr : blog.title}
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
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        <Link href={`/blog/${blog.slug}`}>
                          {locale === 'ar' && blog.titleAr ? blog.titleAr : blog.title}
                        </Link>
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm">
                        {locale === 'ar' && blog.excerptAr ? blog.excerptAr : blog.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{locale === 'ar' && blog.author?.nameAr ? blog.author.nameAr : blog.author?.name || (locale === 'ar' ? 'مجهول' : 'Unknown')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{blog.readingTime} {locale === 'ar' ? 'دقيقة' : 'min'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(blog.publishedAt)}</span>
                        </div>

                        <Button variant="ghost" size="sm" asChild className="group-hover:text-primary">
                          <Link href={`/blog/${blog.slug}`}>
                            {locale === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                            <ArrowRight className={`w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {locale === 'ar' ? 'لا توجد مقالات' : 'No articles found'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {locale === 'ar'
                        ? 'لم نتمكن من العثور على أي مقالات في هذه الفئة'
                        : 'We couldn\'t find any articles in this category'
                      }
                    </p>
                    <Button asChild>
                      <Link href="/blog">
                        {locale === 'ar' ? 'عرض جميع المقالات' : 'View All Articles'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    asChild={pageNum !== currentPage}
                  >
                    {pageNum === currentPage ? (
                      <span>{pageNum}</span>
                    ) : (
                      <Link
                        href={`/blog${selectedCategory ? `?category=${selectedCategory}&page=${pageNum}` : `?page=${pageNum}`}`}
                      >
                        {pageNum}
                      </Link>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
    <Footer locale={locale} />
    </>
  );
}