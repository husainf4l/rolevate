import { BlogPost, BlogCategory, BlogStatus, BlogResponse } from '@/types/blog';

class BlogService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

  // Demo blog data about recruitment
  private demoBlogs: BlogPost[] = [
    {
      id: '1',
      title: 'The Future of Recruitment: AI-Powered Hiring in 2025',
      titleAr: 'مستقبل التوظيف: التوظيف المعزز بالذكاء الاصطناعي في 2025',
      slug: 'future-of-recruitment-ai-powered-hiring-2025',
      excerpt: 'Discover how artificial intelligence is revolutionizing the recruitment process, from automated candidate screening to predictive analytics for better hiring decisions.',
      excerptAr: 'اكتشف كيف يغير الذكاء الاصطناعي عملية التوظيف، من فحص المرشحين التلقائي إلى التحليلات التنبؤية لاتخاذ قرارات توظيف أفضل.',
      content: `# The Future of Recruitment: AI-Powered Hiring in 2025

Artificial Intelligence is transforming the recruitment landscape at an unprecedented pace. In 2025, we're seeing AI tools that can predict candidate success, automate resume screening, and even conduct initial interviews.

## Key AI Trends in Recruitment

### 1. Predictive Analytics
AI algorithms can now analyze historical hiring data to predict which candidates are most likely to succeed in specific roles. This reduces turnover and improves hiring quality.

### 2. Automated Screening
Machine learning models can review thousands of resumes in minutes, identifying the most qualified candidates based on job requirements and company culture fit.

### 3. Virtual Interview Assistants
AI-powered chatbots conduct initial screening interviews, asking relevant questions and evaluating responses in real-time.

## Benefits for Employers

- **Faster Hiring Cycles**: Reduce time-to-hire by up to 75%
- **Better Quality Hires**: Predictive analytics improve hiring success rates
- **Reduced Bias**: AI can help eliminate unconscious bias in the screening process
- **Cost Savings**: Automate repetitive tasks and focus human recruiters on strategic decisions

## The Human Element

While AI is powerful, the human touch remains crucial. AI should augment, not replace, human recruiters who bring empathy, cultural understanding, and complex decision-making skills.

The future of recruitment is here, and it's smarter, faster, and more efficient than ever before.`,
      contentAr: `# مستقبل التوظيف: التوظيف المعزز بالذكاء الاصطناعي في 2025

يغير الذكاء الاصطناعي مشهد التوظيف بسرعة غير مسبوقة. في عام 2025، نرى أدوات الذكاء الاصطناعي التي يمكنها التنبؤ بنجاح المرشحين، وأتمتة فحص السير الذاتية، وحتى إجراء المقابلات الأولية.

## الاتجاهات الرئيسية للذكاء الاصطناعي في التوظيف

### 1. التحليلات التنبؤية
يمكن لخوارزميات الذكاء الاصطناعي الآن تحليل بيانات التوظيف التاريخية للتنبؤ بأي المرشحين الأكثر احتمالاً للنجاح في أدوار محددة. هذا يقلل من معدل الدوران ويحسن جودة التوظيف.

### 2. الفحص التلقائي
يمكن لنماذج التعلم الآلي مراجعة آلاف السير الذاتية في دقائق، وتحديد المرشحين الأكثر تأهيلاً بناءً على متطلبات الوظيفة وملاءمة ثقافة الشركة.

### 3. مساعدي المقابلات الافتراضية
تجري برامج الدردشة المعززة بالذكاء الاصطناعي مقابلات فحص أولية، تسأل أسئلة ذات صلة وتقيم الردود في الوقت الفعلي.

## الفوائد لأصحاب العمل

- **دورات توظيف أسرع**: تقليل وقت التوظيف بنسبة تصل إلى 75%
- **توظيف أفضل جودة**: تحسن التحليلات التنبؤية معدلات نجاح التوظيف
- **تقليل التحيز**: يمكن للذكاء الاصطناعي المساعدة في القضاء على التحيز غير الواعي في عملية الفحص
- **توفير التكاليف**: أتمتة المهام المتكررة والتركيز على القرارات الاستراتيجية

## العنصر البشري

بينما الذكاء الاصطناعي قوي، يظل اللمسة البشرية أمرًا حاسمًا. يجب أن يعزز الذكاء الاصطناعي، لا يحل محل، المجندين البشريين الذين يجلبون التعاطف والفهم الثقافي ومهارات اتخاذ القرارات المعقدة.

مستقبل التوظيف هنا، وهو أذكى وأسرع وأكثر كفاءة من أي وقت مضى.`,
      author: {
        name: 'Sarah Johnson',
        nameAr: 'سارة جونسون',
        avatar: '/images/avatar-1.jpg',
        role: 'HR Technology Specialist',
        roleAr: 'متخصصة في تكنولوجيا الموارد البشرية'
      },
      category: BlogCategory.RECRUITMENT,
      tags: ['AI', 'Recruitment', 'Technology', 'HR', 'Future of Work'],
      featuredImage: '/images/hero/hero1.jpeg',
      publishedAt: '2025-01-15T10:00:00Z',
      readingTime: 5,
      featured: true,
      status: BlogStatus.PUBLISHED,
      seo: {
        metaTitle: 'AI-Powered Hiring: The Future of Recruitment in 2025',
        metaDescription: 'Explore how AI is revolutionizing recruitment with predictive analytics, automated screening, and virtual interviews.',
        keywords: ['AI recruitment', 'automated hiring', 'predictive analytics', 'HR technology']
      }
    },
    {
      id: '2',
      title: 'Building a Strong Employer Brand: Attract Top Talent',
      titleAr: 'بناء علامة تجارية قوية لصاحب العمل: جذب أفضل المواهب',
      slug: 'building-strong-employer-brand-attract-top-talent',
      excerpt: 'Learn how to create a compelling employer brand that attracts and retains the best talent in today\'s competitive job market.',
      excerptAr: 'تعلم كيفية إنشاء علامة تجارية جذابة لصاحب العمل تجذب وتحتفظ بأفضل المواهب في سوق العمل التنافسي اليوم.',
      content: `# Building a Strong Employer Brand: Attract Top Talent

In today's competitive talent market, having a strong employer brand is no longer optional—it's essential. A compelling employer brand helps you attract, engage, and retain top talent.

## What is Employer Branding?

Employer branding is the process of promoting your company as the employer of choice to a desired target group, usually current and potential employees.

## Key Components of a Strong Employer Brand

### 1. Company Culture
Define and communicate your company values, mission, and work environment clearly.

### 2. Employee Value Proposition (EVP)
What makes working for your company unique? Identify and promote your EVP.

### 3. Employee Experience
Focus on creating positive experiences throughout the employee lifecycle.

### 4. Authentic Storytelling
Share real stories from your employees about their experiences working at your company.

## Strategies for Building Your Employer Brand

### Content Marketing
Create engaging content that showcases your company culture and values.

### Social Media Presence
Use platforms like LinkedIn to share company updates and employee stories.

### Employee Advocacy
Encourage employees to share their positive experiences online.

### Career Page Optimization
Ensure your careers page is modern, informative, and easy to navigate.

## Measuring Success

Track metrics like:
- Application quality and quantity
- Time to fill positions
- Employee retention rates
- Brand awareness and perception

A strong employer brand doesn't just attract talent—it creates a competitive advantage in the war for talent.`,
      contentAr: `# بناء علامة تجارية قوية لصاحب العمل: جذب أفضل المواهب

في سوق المواهب التنافسي اليوم، أصبح امتلاك علامة تجارية قوية لصاحب العمل ليس خيارًا اختياريًا - بل ضروريًا. تساعد العلامة التجارية الجذابة لصاحب العمل في جذب وإشراك والاحتفاظ بأفضل المواهب.

## ما هي العلامة التجارية لصاحب العمل؟

العلامة التجارية لصاحب العمل هي عملية الترويج لشركتك كصاحب العمل المفضل لدى مجموعة مستهدفة مرغوبة، عادةً الموظفين الحاليين والمحتملين.

## المكونات الرئيسية لعلامة تجارية قوية لصاحب العمل

### 1. ثقافة الشركة
حدد وقم بتواصل قيم شركتك ورسالتها وبيئة العمل بوضوح.

### 2. عرض القيمة للموظف (EVP)
ما الذي يجعل العمل في شركتك فريدًا؟ حدد ورقِّ عرض القيمة الخاص بك.

### 3. تجربة الموظف
ركز على إنشاء تجارب إيجابية طوال دورة حياة الموظف.

### 4. السرد الأصيل
شارك قصصًا حقيقية من موظفيك عن تجاربهم في العمل في شركتك.

## استراتيجيات لبناء علامتك التجارية

### التسويق بالمحتوى
أنشئ محتوى جذابًا يعرض ثقافة شركتك وقيمها.

### التواجد على وسائل التواصل الاجتماعي
استخدم منصات مثل LinkedIn لمشاركة تحديثات الشركة وقصص الموظفين.

### الدعوة للموظفين
شجع الموظفين على مشاركة تجاربهم الإيجابية عبر الإنترنت.

### تحسين صفحة الوظائف
تأكد من أن صفحة الوظائف حديثة وغنية بالمعلومات وسهلة التصفح.

## قياس النجاح

تتبع المقاييس مثل:
- جودة وكمية الطلبات
- وقت ملء المناصب
- معدلات الاحتفاظ بالموظفين
- الوعي بالعلامة التجارية والإدراك

العلامة التجارية القوية لصاحب العمل لا تجذب المواهب فحسب - بل تخلق ميزة تنافسية في حرب المواهب.`,
      author: {
        name: 'Michael Chen',
        nameAr: 'مايكل تشين',
        avatar: '/images/avatar-2.jpg',
        role: 'Talent Acquisition Manager',
        roleAr: 'مدير اكتساب المواهب'
      },
      category: BlogCategory.EMPLOYEE_ENGAGEMENT,
      tags: ['Employer Branding', 'Talent Attraction', 'Company Culture', 'HR Strategy'],
      featuredImage: '/images/hero/hero2.jpeg',
      publishedAt: '2025-01-10T14:30:00Z',
      readingTime: 4,
      featured: true,
      status: BlogStatus.PUBLISHED,
      seo: {
        metaTitle: 'Build a Strong Employer Brand to Attract Top Talent',
        metaDescription: 'Learn strategies to create a compelling employer brand that attracts and retains the best talent in competitive markets.',
        keywords: ['employer branding', 'talent attraction', 'company culture', 'recruitment']
      }
    },
    {
      id: '3',
      title: 'Interview Best Practices: How to Ace Your Next Interview',
      titleAr: 'أفضل الممارسات في المقابلات: كيف تتفوق في مقابلتك التالية',
      slug: 'interview-best-practices-ace-your-next-interview',
      excerpt: 'Master the art of interviewing with these proven strategies, from preparation to follow-up, that will help you land your dream job.',
      excerptAr: 'أتقن فن المقابلات بهذه الاستراتيجيات المثبتة، من التحضير إلى المتابعة، التي ستساعدك في الحصول على وظيفتك المثالية.',
      content: `# Interview Best Practices: How to Ace Your Next Interview

Preparing for a job interview can be nerve-wracking, but with the right strategies, you can significantly improve your chances of success.

## Before the Interview

### Research the Company
- Study the company website, social media, and recent news
- Understand their products, services, and company culture
- Prepare thoughtful questions about the company

### Review the Job Description
- Match your skills and experience to the job requirements
- Prepare specific examples of your achievements
- Be ready to discuss how you can contribute to the company

### Practice Common Questions
- Tell me about yourself
- What are your strengths and weaknesses?
- Why do you want to work here?
- Where do you see yourself in 5 years?

## During the Interview

### Body Language Matters
- Maintain eye contact
- Smile and be enthusiastic
- Use confident posture
- Listen actively

### STAR Method for Answers
- **Situation**: Set the context
- **Task**: Explain your responsibility
- **Action**: Describe what you did
- **Result**: Share the outcome

### Ask Smart Questions
- What are the biggest challenges facing the team?
- How does success look like in this role?
- What opportunities are there for professional development?

## After the Interview

### Send a Thank-You Note
- Email within 24 hours
- Reiterate your interest
- Reference something specific from the interview

### Follow Up
- If you haven't heard back in a week, send a polite follow-up
- Keep the conversation going if appropriate

Remember, interviews are a two-way street. While the company is evaluating you, you're also evaluating whether the company is a good fit for you.`,
      contentAr: `# أفضل الممارسات في المقابلات: كيف تتفوق في مقابلتك التالية

يمكن أن يكون التحضير لمقابلة عمل أمرًا مثيرًا للتوتر، لكن بالاستراتيجيات المناسبة، يمكنك تحسين فرص نجاحك بشكل كبير.

## قبل المقابلة

### ابحث عن الشركة
- دراسة موقع الشركة ووسائل التواصل الاجتماعي والأخبار الأخيرة
- فهم منتجاتها وخدماتها وثقافة الشركة
- إعداد أسئلة مدروسة عن الشركة

### مراجعة وصف الوظيفة
- مطابقة مهاراتك وخبراتك مع متطلبات الوظيفة
- إعداد أمثلة محددة لإنجازاتك
- كن مستعدًا لمناقشة كيف يمكنك المساهمة في الشركة

### ممارسة الأسئلة الشائعة
- أخبرني عن نفسك
- ما هي نقاط القوة والضعف لديك؟
- لماذا تريد العمل هنا؟
- أين ترى نفسك خلال 5 سنوات؟

## أثناء المقابلة

### لغة الجسد مهمة
- الحفاظ على التواصل البصري
- الابتسام والحماس
- استخدام وضعية واثقة
- الاستماع النشط

### طريقة STAR للإجابات
- **الوضع**: تحديد السياق
- **المهمة**: شرح مسؤوليتك
- **الإجراء**: وصف ما فعلته
- **النتيجة**: مشاركة النتيجة

### اسأل أسئلة ذكية
- ما هي أكبر التحديات التي تواجه الفريق؟
- كيف يبدو النجاح في هذا الدور؟
- ما هي الفرص المتاحة للتطوير المهني؟

## بعد المقابلة

### أرسل رسالة شكر
- البريد الإلكتروني خلال 24 ساعة
- أعد تأكيد اهتمامك
- أشر إلى شيء محدد من المقابلة

### المتابعة
- إذا لم تسمع ردًا خلال أسبوع، أرسل متابعة مهذبة
- حافظ على استمرار المحادثة إذا كان ذلك مناسبًا

تذكر، المقابلات طريق ذو اتجاهين. بينما تقيم الشركة أنت، أنت أيضًا تقيم ما إذا كانت الشركة مناسبة لك.`,
      author: {
        name: 'Emily Rodriguez',
        nameAr: 'إميلي رودريغيز',
        avatar: '/images/avatar-3.jpg',
        role: 'Career Coach',
        roleAr: 'مدرب مهني'
      },
      category: BlogCategory.INTERVIEW_TIPS,
      tags: ['Interview Tips', 'Career Development', 'Job Search', 'Communication'],
      featuredImage: '/images/hero/hero3.jpeg',
      publishedAt: '2025-01-08T09:15:00Z',
      readingTime: 6,
      featured: false,
      status: BlogStatus.PUBLISHED,
      seo: {
        metaTitle: 'Interview Best Practices: Ace Your Next Job Interview',
        metaDescription: 'Master interview techniques with proven strategies for preparation, during the interview, and follow-up.',
        keywords: ['job interview tips', 'interview preparation', 'career advice', 'job search']
      }
    },
    {
      id: '4',
      title: 'Remote Work Revolution: Managing Distributed Teams Effectively',
      titleAr: 'ثورة العمل عن بعد: إدارة الفرق الموزعة بفعالية',
      slug: 'remote-work-revolution-managing-distributed-teams',
      excerpt: 'Explore the challenges and solutions for managing remote teams in the modern workplace, with practical tips for leaders and team members.',
      excerptAr: 'استكشف التحديات والحلول لإدارة الفرق عن بعد في مكان العمل الحديث، مع نصائح عملية للقادة وأعضاء الفريق.',
      content: `# Remote Work Revolution: Managing Distributed Teams Effectively

The shift to remote work has transformed how we think about team management and collaboration. While remote work offers flexibility, it also presents unique challenges.

## Challenges of Remote Team Management

### Communication Barriers
- Time zone differences
- Lack of non-verbal cues
- Miscommunication due to written communication

### Building Trust and Culture
- Difficulty in building personal connections
- Maintaining company culture remotely
- Ensuring team cohesion

### Productivity and Accountability
- Monitoring work without micromanaging
- Setting clear expectations
- Measuring performance objectively

## Best Practices for Managing Remote Teams

### 1. Establish Clear Communication Protocols
- Use multiple communication tools appropriately
- Set expectations for response times
- Schedule regular check-ins and meetings

### 2. Foster Company Culture
- Virtual team-building activities
- Recognition and celebration of achievements
- Creating shared experiences online

### 3. Implement the Right Tools
- Video conferencing platforms
- Project management software
- Collaboration tools for document sharing

### 4. Focus on Results, Not Hours
- Outcome-based performance metrics
- Flexible scheduling
- Trust-based management approach

## Tools for Remote Team Success

- **Communication**: Slack, Microsoft Teams, Zoom
- **Project Management**: Asana, Trello, Jira
- **Collaboration**: Google Workspace, Microsoft 365
- **Time Tracking**: Optional, focus on deliverables

The key to successful remote team management is trust, clear communication, and the right technological infrastructure.`,
      contentAr: `# ثورة العمل عن بعد: إدارة الفرق الموزعة بفعالية

أدى التحول إلى العمل عن بعد إلى تغيير طريقة تفكيرنا في إدارة الفرق والتعاون. بينما يوفر العمل عن بعد المرونة، إلا أنه يقدم أيضًا تحديات فريدة.

## تحديات إدارة الفرق عن بعد

### حواجز التواصل
- اختلافات المناطق الزمنية
- نقص الإشارات غير اللفظية
- سوء التواصل بسبب التواصل المكتوب

### بناء الثقة والثقافة
- صعوبة في بناء الروابط الشخصية
- الحفاظ على ثقافة الشركة عن بعد
- ضمان تماسك الفريق

### الإنتاجية والمساءلة
- مراقبة العمل دون الإفراط في الرقابة
- تحديد التوقعات بوضوح
- قياس الأداء بشكل موضوعي

## أفضل الممارسات لإدارة الفرق عن بعد

### 1. إنشاء بروتوكولات تواصل واضحة
- استخدام أدوات التواصل المتعددة بشكل مناسب
- تحديد توقعات أوقات الرد
- جدولة اجتماعات منتظمة وفحوصات

### 2. تعزيز ثقافة الشركة
- أنشطة بناء الفريق الافتراضية
- التقدير والاحتفال بالإنجازات
- إنشاء تجارب مشتركة عبر الإنترنت

### 3. تنفيذ الأدوات المناسبة
- منصات مؤتمرات الفيديو
- برامج إدارة المشاريع
- أدوات التعاون لمشاركة المستندات

### 4. التركيز على النتائج، لا الساعات
- مقاييس الأداء المبنية على النتائج
- جدولة مرنة
- نهج إدارة مبني على الثقة

## أدوات لنجاح الفرق عن بعد

- **التواصل**: Slack، Microsoft Teams، Zoom
- **إدارة المشاريع**: Asana، Trello، Jira
- **التعاون**: Google Workspace، Microsoft 365
- **تتبع الوقت**: اختياري، التركيز على التسليمات

المفتاح لإدارة الفرق عن بعد بنجاح هو الثقة والتواصل الواضح والبنية التحتية التكنولوجية المناسبة.`,
      author: {
        name: 'David Kim',
        nameAr: 'ديفيد كيم',
        avatar: '/images/avatar-4.jpg',
        role: 'Remote Work Consultant',
        roleAr: 'مستشار العمل عن بعد'
      },
      category: BlogCategory.WORKPLACE_TRENDS,
      tags: ['Remote Work', 'Team Management', 'Digital Transformation', 'Leadership'],
      featuredImage: '/images/hero/hero4.jpeg',
      publishedAt: '2025-01-05T16:45:00Z',
      readingTime: 7,
      featured: false,
      status: BlogStatus.PUBLISHED,
      seo: {
        metaTitle: 'Managing Remote Teams: Best Practices for Distributed Work',
        metaDescription: 'Learn effective strategies for managing remote teams, overcoming communication barriers, and building trust in distributed workplaces.',
        keywords: ['remote work', 'team management', 'distributed teams', 'virtual collaboration']
      }
    }
  ];

  async getBlogs(page: number = 1, limit: number = 10, category?: BlogCategory): Promise<BlogResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredBlogs = this.demoBlogs.filter(blog => blog.status === BlogStatus.PUBLISHED);

      if (category) {
        filteredBlogs = filteredBlogs.filter(blog => blog.category === category);
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

      return {
        success: true,
        blogs: paginatedBlogs,
        total: filteredBlogs.length,
        page,
        limit
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch blogs'
      };
    }
  }

  async getBlogById(id: string): Promise<BlogResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const blog = this.demoBlogs.find(b => b.id === id && b.status === BlogStatus.PUBLISHED);

      if (!blog) {
        return {
          success: false,
          message: 'Blog not found'
        };
      }

      return {
        success: true,
        blog
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch blog'
      };
    }
  }

  async getBlogBySlug(slug: string): Promise<BlogResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const blog = this.demoBlogs.find(b => b.slug === slug && b.status === BlogStatus.PUBLISHED);

      if (!blog) {
        return {
          success: false,
          message: 'Blog not found'
        };
      }

      return {
        success: true,
        blog
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch blog'
      };
    }
  }

  async getFeaturedBlogs(limit: number = 2): Promise<BlogResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const featuredBlogs = this.demoBlogs
        .filter(blog => blog.featured && blog.status === BlogStatus.PUBLISHED)
        .slice(0, limit);

      return {
        success: true,
        blogs: featuredBlogs,
        total: featuredBlogs.length
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch featured blogs'
      };
    }
  }

  async getBlogsByCategory(category: BlogCategory, page: number = 1, limit: number = 10): Promise<BlogResponse> {
    return this.getBlogs(page, limit, category);
  }
}

export const blogService = new BlogService();