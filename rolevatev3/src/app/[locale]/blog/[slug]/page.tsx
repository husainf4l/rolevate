import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { BlogPost, BlogCategory } from '@/types/blog';
import { blogService } from '@/services/blog';
import Footer from '@/components/common/footer';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function BlogPostPage({
  params
}: BlogPostPageProps) {
  const { locale, slug } = await params;

  // Fetch the blog post
  const blogResponse = await blogService.getBlogBySlug(slug);

  if (!blogResponse.success || !blogResponse.blog) {
    notFound();
  }

  const blog = blogResponse.blog;

  // Fetch related blogs (same category, excluding current)
  const relatedBlogsResponse = await blogService.getBlogs(1, 3, blog.category);
  const relatedBlogs = relatedBlogsResponse.blogs?.filter(b => b.id !== blog.id).slice(0, 3) || [];

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

  const renderContent = (content: string) => {
    // Simple markdown-like parsing for demo purposes
    // In a real app, you'd use a proper markdown parser
    const paragraphs = content.split('\n\n');
    return paragraphs.map((paragraph, index) => {
      // Parse bold text between **
      const parseBoldText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return (
              <span key={partIndex} className="font-medium text-foreground bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                {boldText}
              </span>
            );
          }
          return part;
        });
      };

      if (paragraph.startsWith('# ')) {
        return (
          <h1 key={index} className="text-xl md:text-2xl font-bold text-foreground mb-6 mt-8 first:mt-0 leading-tight tracking-tight">
            {parseBoldText(paragraph.replace('# ', ''))}
          </h1>
        );
      } else if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-lg md:text-xl font-semibold text-foreground mb-4 mt-6 leading-tight tracking-tight">
            {parseBoldText(paragraph.replace('## ', ''))}
          </h2>
        );
      } else if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} className="text-base md:text-lg font-medium text-foreground mb-3 mt-5 leading-tight tracking-tight">
            {parseBoldText(paragraph.replace('### ', ''))}
          </h3>
        );
      } else if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(item => item.startsWith('- '));
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-muted-foreground leading-relaxed font-light pl-4">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-sm">{parseBoldText(item.replace('- ', ''))}</li>
            ))}
          </ul>
        );
      } else {
        return (
          <p key={index} className="text-muted-foreground leading-relaxed mb-5 font-light text-sm md:text-base">
            {parseBoldText(paragraph)}
          </p>
        );
      }
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <article className="container mx-auto px-4 py-6 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <header className="mb-8 md:mb-12 relative">
              {/* Mobile Back Navigation - Inline with Badge */}
              <div className="flex items-center justify-between mb-6 md:justify-start">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="md:hidden bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:bg-white/90 dark:bg-gray-900/80 dark:hover:bg-gray-900/90 dark:border-gray-700/50 transition-all duration-300 rounded-full w-8 h-8"
                  >
                    <Link href="/blog">
                      <ArrowLeft className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                    </Link>
                  </Button>
                  <Badge className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    {getCategoryLabel(blog.category)}
                  </Badge>
                </div>
              </div>

              {/* Desktop Back Navigation - Hidden on Mobile */}
              <div className="hidden md:block absolute -left-20 top-2">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="bg-white/90 backdrop-blur-md border border-gray-200/60 shadow-lg hover:bg-white hover:shadow-xl dark:bg-gray-900/90 dark:hover:bg-gray-900 dark:border-gray-700/60 dark:hover:border-gray-600 transition-all duration-300 rounded-full w-12 h-12 hover:scale-105 active:scale-95"
                >
                  <Link href="/blog" className="flex items-center justify-center w-full h-full">
                    <ArrowLeft className={`w-5 h-5 transition-transform duration-200 hover:-translate-x-0.5 ${locale === 'ar' ? 'rotate-180 hover:translate-x-0.5' : ''}`} />
                  </Link>
                </Button>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight">
                {locale === 'ar' && blog.titleAr ? blog.titleAr : blog.title}
              </h1>

              <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed font-light max-w-3xl">
                {locale === 'ar' && blog.excerptAr ? blog.excerptAr : blog.excerpt}
              </p>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground border-b border-gray-200/60 dark:border-gray-700/60 pb-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground text-sm">
                    {locale === 'ar' && blog.author?.nameAr ? blog.author.nameAr : blog.author?.name || (locale === 'ar' ? 'مجهول' : 'Unknown')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-light">{formatDate(blog.publishedAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-light">{blog.readingTime} {locale === 'ar' ? 'دقيقة قراءة' : 'min read'}</span>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="outline" size="sm" className="text-xs h-8 px-3 border-gray-200/60 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/50">
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    {locale === 'ar' ? 'مشاركة' : 'Share'}
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-8 px-3 border-gray-200/60 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/50">
                    <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                    {locale === 'ar' ? 'حفظ' : 'Save'}
                  </Button>
                </div>
              </div>
            </header>

          {/* Featured Image */}
          <div className="relative h-80 md:h-[450px] lg:h-[500px] rounded-xl overflow-hidden mb-10 shadow-2xl">
            <Image
              src={blog.featuredImage}
              alt={locale === 'ar' && blog.titleAr ? blog.titleAr : blog.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>

          {/* Article Content */}
          <div className="prose prose-base md:prose-lg max-w-none mb-16 prose-headings:text-foreground prose-headings:font-semibold prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:font-light prose-li:text-muted-foreground prose-strong:text-foreground prose-strong:font-medium dark:prose-invert">
            {renderContent(locale === 'ar' && blog.contentAr ? blog.contentAr : blog.content)}
          </div>

          {/* Article Footer */}
          <footer className="border-t border-gray-200/60 dark:border-gray-700/60 pt-8 mb-16">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/30 dark:to-transparent p-6 rounded-lg border border-gray-200/40 dark:border-gray-700/40">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-light">
                  {locale === 'ar' ? 'نُشر في' : 'Published in'}
                </span>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                  {getCategoryLabel(blog.category)}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="text-sm h-9 px-4 border-gray-200/60 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-800/50 shadow-sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  {locale === 'ar' ? 'مشاركة المقالة' : 'Share Article'}
                </Button>
              </div>
            </div>
          </footer>

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <section className="border-t border-gray-200/60 dark:border-gray-700/60 pt-12">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8 tracking-tight">
                {locale === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <Card key={relatedBlog.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-gray-200/60 dark:border-gray-700/60 hover:border-primary/20 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={relatedBlog.featuredImage}
                        alt={locale === 'ar' && relatedBlog.titleAr ? relatedBlog.titleAr : relatedBlog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <CardContent className="p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200 leading-tight">
                        <Link href={`/blog/${relatedBlog.slug}`} className="hover:underline decoration-primary/30 underline-offset-2">
                          {locale === 'ar' && relatedBlog.titleAr ? relatedBlog.titleAr : relatedBlog.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed font-light">
                        {locale === 'ar' && relatedBlog.excerptAr ? relatedBlog.excerptAr : relatedBlog.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground font-light">
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{formatDate(relatedBlog.publishedAt)}</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{relatedBlog.readingTime} {locale === 'ar' ? 'دقيقة' : 'min'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;

  const blogResponse = await blogService.getBlogBySlug(slug);

  if (!blogResponse.success || !blogResponse.blog) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  const blog = blogResponse.blog;

  const title = locale === 'ar' && blog.titleAr ? blog.titleAr : blog.title;
  const description = locale === 'ar' && blog.excerptAr ? blog.excerptAr : blog.excerpt;

  return {
    title: `${title} | RoleVate Blog`,
    description,
    openGraph: {
      title,
      description,
      images: [blog.featuredImage],
    },
  };
}