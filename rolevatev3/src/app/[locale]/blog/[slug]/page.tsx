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
              <span key={partIndex} className="font-semibold text-foreground bg-primary/10 px-1 py-0.5 rounded-sm border border-primary/20">
                {boldText}
              </span>
            );
          }
          return part;
        });
      };

      if (paragraph.startsWith('# ')) {
        return (
          <h1 key={index} className="text-3xl font-bold text-foreground mb-6 mt-8 first:mt-0">
            {parseBoldText(paragraph.replace('# ', ''))}
          </h1>
        );
      } else if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-foreground mb-4 mt-6">
            {parseBoldText(paragraph.replace('## ', ''))}
          </h2>
        );
      } else if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold text-foreground mb-3 mt-5">
            {parseBoldText(paragraph.replace('### ', ''))}
          </h3>
        );
      } else if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(item => item.startsWith('- '));
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{parseBoldText(item.replace('- ', ''))}</li>
            ))}
          </ul>
        );
      } else {
        return (
          <p key={index} className="text-muted-foreground leading-relaxed mb-4">
            {parseBoldText(paragraph)}
          </p>
        );
      }
    });
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-6 md:mb-8 relative">
            {/* Mobile Back Navigation - Inline with Badge */}
            <div className="flex items-center justify-between mb-4 md:justify-start">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="md:hidden bg-background/60 backdrop-blur-md border border-border/50 shadow-lg hover:bg-background/80 dark:bg-background/40 dark:hover:bg-background/60 transition-all duration-300 rounded-full w-8 h-8"
                >
                  <Link href="/blog">
                    <ArrowLeft className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                  </Link>
                </Button>
                <Badge className="bg-primary text-primary-foreground">
                  {getCategoryLabel(blog.category)}
                </Badge>
              </div>
            </div>
            
            {/* Desktop Back Navigation - Hidden on Mobile */}
            <div className="hidden md:block absolute -left-16 top-2">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="bg-background/60 backdrop-blur-md border border-border/50 shadow-xl hover:bg-background/80 hover:border-border hover:shadow-2xl dark:bg-background/40 dark:hover:bg-background/60 dark:border-border/30 dark:hover:border-border/60 transition-all duration-300 rounded-full w-12 h-12 hover:scale-105 active:scale-95"
              >
                <Link href="/blog" className="flex items-center justify-center w-full h-full">
                  <ArrowLeft className={`w-5 h-5 transition-transform duration-200 hover:-translate-x-0.5 ${locale === 'ar' ? 'rotate-180 hover:translate-x-0.5' : ''}`} />
                </Link>
              </Button>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {locale === 'ar' && blog.titleAr ? blog.titleAr : blog.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {locale === 'ar' && blog.excerptAr ? blog.excerptAr : blog.excerpt}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-border pb-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium">
                  {locale === 'ar' && blog.author.nameAr ? blog.author.nameAr : blog.author.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{blog.readingTime} {locale === 'ar' ? 'دقيقة قراءة' : 'min read'}</span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  {locale === 'ar' ? 'مشاركة' : 'Share'}
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="w-4 h-4 mr-2" />
                  {locale === 'ar' ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden mb-8">
            <Image
              src={blog.featuredImage}
              alt={locale === 'ar' && blog.titleAr ? blog.titleAr : blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12 prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground dark:prose-invert">
            {renderContent(locale === 'ar' && blog.contentAr ? blog.contentAr : blog.content)}
          </div>

          {/* Article Footer */}
          <footer className="border-t border-border pt-8 mb-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'نُشر في' : 'Published in'}
                </span>
                <Badge variant="secondary">
                  {getCategoryLabel(blog.category)}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  {locale === 'ar' ? 'مشاركة المقالة' : 'Share Article'}
                </Button>
              </div>
            </div>
          </footer>

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <section className="border-t border-border pt-12">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                {locale === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <Card key={relatedBlog.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                    <div className="relative h-32 overflow-hidden">
                      <Image
                        src={relatedBlog.featuredImage}
                        alt={locale === 'ar' && relatedBlog.titleAr ? relatedBlog.titleAr : relatedBlog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        <Link href={`/blog/${relatedBlog.slug}`}>
                          {locale === 'ar' && relatedBlog.titleAr ? relatedBlog.titleAr : relatedBlog.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {locale === 'ar' && relatedBlog.excerptAr ? relatedBlog.excerptAr : relatedBlog.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(relatedBlog.publishedAt)}</span>
                        <span>{relatedBlog.readingTime} {locale === 'ar' ? 'دقيقة' : 'min'}</span>
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