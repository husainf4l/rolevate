import { PrismaClient, UserRole, ExperienceLevel, WorkType, InterviewLanguage, ApplicationStatus, FitRecommendation, InterviewStatus, InterviewType, CompanySize, SubscriptionPlan, BillingCycle, WhatsappStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Seeding database with 3 jobs...');

  // Clean up existing data
  await prisma.interviewHistory.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.fitScore.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.cvAnalysis.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.apply.deleteMany({});
  await prisma.jobPost.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.candidate.deleteMany({});

  console.log('Database cleaned. Creating new seed data...');

  // Create companies
  const abuKhader = await prisma.company.create({
    data: {
      name: 'Abu Khader Automotive',
      displayName: 'Abu Khader Automotive',
      industry: 'Automotive',
      description: 'Leading automotive dealer and service provider',
      website: 'https://www.abukhader.com',
      location: 'Jordan',
      country: 'Jordan',
      city: 'Amman',
      size: CompanySize.LARGE,
      isActive: true,
    },
  });

  const menaitech = await prisma.company.create({
    data: {
      name: 'Menaitech',
      displayName: 'Menaitech',
      industry: 'Technology',
      description: 'Innovative software development company specializing in mobile applications',
      website: 'https://www.menaitech.com',
      location: 'Jordan',
      country: 'Jordan',
      city: 'Amman',
      size: CompanySize.MEDIUM,
      isActive: true,
    },
  });

  console.log('Companies created');

  // Create users
  const abuKhaderUser = await prisma.user.create({
    data: {
      email: 'hr@abukhader.com',
      username: 'abukhader_hr',
      firstName: 'Ahmad',
      lastName: 'Sameer',
      name: 'Ahmad Sameer',
      password: await hashPassword('password123'),
      phoneNumber: '+962795123456',
      role: UserRole.HR_MANAGER,
      companyId: abuKhader.id,
      isActive: true,
    },
  });

  const menaitechUser = await prisma.user.create({
    data: {
      email: 'hr@menaitech.com',
      username: 'menaitech_hr',
      firstName: 'Nadia',
      lastName: 'Khalil',
      name: 'Nadia Khalil',
      password: await hashPassword('password123'),
      phoneNumber: '+962796123456',
      role: UserRole.HR_MANAGER,
      companyId: menaitech.id,
      isActive: true,
    },
  });

  console.log('Users created');

  // Create subscriptions for companies
  await prisma.subscription.create({
    data: {
      plan: SubscriptionPlan.PREMIUM,
      status: 'ACTIVE' as any,
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 10)),
      jobPostLimit: 50,
      candidateLimit: 1000,
      interviewLimit: 500,
      priceAmount: 99.99,
      currency: 'USD',
      billingCycle: BillingCycle.MONTHLY,
      companyId: abuKhader.id,
    },
  });

  await prisma.subscription.create({
    data: {
      plan: SubscriptionPlan.PREMIUM,
      status: 'ACTIVE' as any,
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 11)),
      jobPostLimit: 50,
      candidateLimit: 1000,
      interviewLimit: 500,
      priceAmount: 99.99,
      currency: 'USD',
      billingCycle: BillingCycle.MONTHLY,
      companyId: menaitech.id,
    },
  });

  console.log('Subscriptions created');

  // Create only 3 specific job posts

  // 1. Sales Representative at Abu Khader Automotive
  const salesRepJob = await prisma.jobPost.create({
    data: {
      title: 'Sales Representative',
      description: 'Abu Khader Automotive is seeking a motivated Sales Representative to join our team.',
      requirements: 'Proven sales experience, excellent communication skills, and passion for automotive industry.',
      responsibilities: 'Present and sell vehicles to prospects, handle customer inquiries, and maintain relationships with existing customers.',
      benefits: 'Competitive commission structure, training programs, and growth opportunities.',
      skills: ['Automotive Sales', 'Customer Service', 'Negotiation', 'Product Knowledge', 'CRM'],
      experienceLevel: ExperienceLevel.MID_LEVEL,
      location: 'Amman, Jordan',
      workType: WorkType.ONSITE,
      salaryMin: 800,
      salaryMax: 1500,
      currency: 'JOD',
      isActive: true,
      isFeatured: false,
      enableAiInterview: true,
      interviewLanguages: [InterviewLanguage.ARABIC, InterviewLanguage.ENGLISH],
      interviewDuration: 25,
      aiPrompt: `System: You are Ahmad Sameer — a professional AI recruiter for Abu Khader Automotive.
You are conducting an interview for the Sales Representative position.

Your role is to ask one question at a time, maintain a professional but friendly tone, and assess the candidate's sales abilities and automotive knowledge.

Interview flow:
1. Welcome and introduction
2. Previous sales experience
3. Knowledge of automotive industry
4. Customer service approach
5. Handling objections and negotiations
6. Goal-setting and achievement record
7. CRM and sales tools experience
8. Team collaboration
9. Motivation and career goals
10. Language skills and availability

Keep questions conversational and conclude with appreciation.`,
      aiInstructions: `Focus on assessing sales experience, customer relationship skills, and automotive industry knowledge. Look for motivation, communication skills, and goal-oriented mindset.`,
      companyId: abuKhader.id,
      createdById: abuKhaderUser.id,
      publishedAt: new Date(),
    },
  });

  // 2. .NET Developer at Menaitech
  const dotNetDevJob = await prisma.jobPost.create({
    data: {
      title: '.NET Developer',
      description: 'Menaitech is looking for a skilled .NET Developer to join our software development team.',
      requirements: 'Minimum 3 years of experience in .NET development, proficiency in C#, and familiarity with web services and SQL Server.',
      responsibilities: 'Design and implement new features, maintain existing code, and participate in code reviews.',
      benefits: 'Competitive salary, flexible working hours, and professional development opportunities.',
      skills: ['.NET', 'C#', 'SQL Server', 'Web APIs', 'Azure'],
      experienceLevel: ExperienceLevel.MID_LEVEL,
      location: 'Amman, Jordan',
      workType: WorkType.HYBRID,
      salaryMin: 1200,
      salaryMax: 2000,
      currency: 'JOD',
      isActive: true,
      isFeatured: false,
      enableAiInterview: true,
      interviewLanguages: [InterviewLanguage.ENGLISH],
      interviewDuration: 45,
      aiPrompt: `System: You are Sarah Mitchell — a senior technical lead at Menaitech.
You are conducting a technical interview for the .NET Developer position.

Your approach should be technically focused but encouraging, assessing both technical skills and problem-solving abilities.

Interview structure:
1. Welcome and role overview
2. .NET and C# experience
3. Database design and SQL Server knowledge
4. Web API development experience
5. Azure cloud services familiarity
6. Code review and best practices
7. Problem-solving scenario
8. Version control and collaboration tools
9. Learning and staying updated with technology
10. Career goals and team fit

Balance technical depth with practical application assessment.`,
      aiInstructions: `Assess technical proficiency in .NET stack, problem-solving skills, and ability to work in a collaborative development environment. Focus on practical experience and coding best practices.`,
      companyId: menaitech.id,
      createdById: menaitechUser.id,
      publishedAt: new Date(),
    },
  });

  // 3. HR Talent Manager at Menaitech
  const hrManagerJob = await prisma.jobPost.create({
    data: {
      title: 'HR Talent Manager',
      description: 'Menaitech is seeking an experienced HR Talent Manager to oversee our talent acquisition and management processes.',
      requirements: 'Minimum 5 years of experience in HR management, strong interpersonal skills, and experience with HRMS systems.',
      responsibilities: 'Develop and implement recruitment strategies, manage the talent acquisition process, and provide guidance on HR best practices.',
      benefits: 'Competitive salary, health insurance, and professional development opportunities.',
      skills: ['Talent Acquisition', 'HR Management', 'HRMS', 'Interviewing', 'Onboarding'],
      experienceLevel: ExperienceLevel.SENIOR,
      location: 'Amman, Jordan',
      workType: WorkType.ONSITE,
      salaryMin: 1500,
      salaryMax: 2500,
      currency: 'JOD',
      isActive: true,
      isFeatured: true,
      enableAiInterview: true,
      interviewLanguages: [InterviewLanguage.ENGLISH, InterviewLanguage.ARABIC],
      interviewDuration: 35,
      aiPrompt: `System: You are Nadia Khalil — an experienced HR Director at Menaitech.
You are interviewing candidates for the HR Talent Manager position.

Your style should be professional, empathetic, and focused on HR expertise and people management skills.

Interview flow:
1. Welcome and position overview
2. HR management experience
3. Talent acquisition strategies
4. HRMS and recruitment tools
5. Interview and selection techniques
6. Employee onboarding processes
7. HR metrics and analytics
8. Conflict resolution and employee relations
9. Legal compliance and HR policies
10. Leadership and team management

Focus on both strategic HR thinking and practical implementation skills.`,
      aiInstructions: `Evaluate HR expertise, talent acquisition experience, leadership capabilities, and ability to develop and implement HR strategies. Look for strong interpersonal skills and strategic thinking.`,
      companyId: menaitech.id,
      createdById: menaitechUser.id,
      publishedAt: new Date(),
    },
  });

  console.log('Job posts created');

  // Create some sample candidates
  const candidates = await Promise.all([
    prisma.candidate.create({
      data: {
        phoneNumber: '+96279111111',
        name: 'Ahmed Al-Mansouri',
        firstName: 'Ahmed',
        lastName: 'Al-Mansouri',
        email: 'ahmed.mansouri@example.com',
      },
    }),
    prisma.candidate.create({
      data: {
        phoneNumber: '+96279222222',
        name: 'Layla Al-Zahra',
        firstName: 'Layla',
        lastName: 'Al-Zahra',
        email: 'layla.zahra@example.com',
      },
    }),
    prisma.candidate.create({
      data: {
        phoneNumber: '+96279333333',
        name: 'Omar Al-Sayed',
        firstName: 'Omar',
        lastName: 'Al-Sayed',
        email: 'omar.sayed@example.com',
      },
    }),
  ]);

  console.log('Candidates created');

  console.log(`
🎉 Database seeded successfully with 3 jobs!

📋 Job Posts Created:
1. Sales Representative at Abu Khader Automotive
2. .NET Developer at Menaitech  
3. HR Talent Manager at Menaitech

🏢 Companies: Abu Khader Automotive, Menaitech
👥 Users: 2 HR managers
📱 Candidates: 3 sample candidates
🎯 All jobs have AI prompts and instructions configured!
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
