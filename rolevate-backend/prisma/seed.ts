import { PrismaClient, UserRole, ExperienceLevel, WorkType, InterviewLanguage, ApplicationStatus, FitRecommendation, InterviewStatus, InterviewType, CompanySize, SubscriptionPlan, BillingCycle, WhatsappStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Seeding database...');

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
  const capitalBank = await prisma.company.create({
    data: {
      name: 'Capital Bank',
      displayName: 'Capital Bank',
      industry: 'Banking',
      description: 'Leading financial institution in the Middle East',
      website: 'https://www.capitalbank.jo',
      location: 'Jordan',
      country: 'Jordan',
      city: 'Amman',
      size: CompanySize.LARGE,
      isActive: true,
    },
  });

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
      name: 'Menaitech Jordan',
      displayName: 'Menaitech',
      industry: 'Technology',
      description: 'HR and talent management software solutions provider',
      website: 'https://www.menaitech.com',
      location: 'Jordan',
      country: 'Jordan',
      city: 'Amman',
      size: CompanySize.MEDIUM,
      isActive: true,
    },
  });
  
  // Additional companies
  const orangeJordan = await prisma.company.create({
    data: {
      name: 'Orange Jordan',
      displayName: 'Orange Telecom',
      industry: 'Telecommunications',
      description: 'Leading telecommunications provider in Jordan',
      website: 'https://www.orange.jo',
      location: 'Jordan',
      country: 'Jordan',
      city: 'Amman',
      size: CompanySize.LARGE,
      isActive: true,
    },
  });
  
  const techCrunch = await prisma.company.create({
    data: {
      name: 'TechCrunch Software',
      displayName: 'TechCrunch',
      industry: 'Software Development',
      description: 'Innovative software development company specializing in mobile applications',
      website: 'https://www.techcrunch-jo.com',
      location: 'Jordan',
      country: 'Jordan',
      city: 'Irbid',
      size: CompanySize.SMALL,
      isActive: true,
    },
  });
  
  const jordanHospital = await prisma.company.create({
    data: {
      name: 'Jordan Hospital',
      displayName: 'Jordan Hospital',
      industry: 'Healthcare',
      description: 'Leading healthcare provider offering comprehensive medical services',
      website: 'https://www.jordanhospital.com',
      location: 'Jordan',
      country: 'Jordan',
      city: 'Amman',
      size: CompanySize.LARGE,
      isActive: true,
    },
  });

  console.log('Companies created');

  // Create users
  const hashedPassword = await hashPassword('tt55oo77');

  const widdUser = await prisma.user.create({
    data: {
      email: 'widd@capitalbank.com',
      username: 'widd',
      name: 'Widd',
      firstName: 'Widd',
      lastName: 'Recruiter',
      password: hashedPassword,
      role: UserRole.RECRUITER,
      companyId: capitalBank.id,
      isActive: true,
    },
  });
  
  // Additional Capital Bank users
  const capitalHRManager = await prisma.user.create({
    data: {
      email: 'hr.manager@capitalbank.com',
      username: 'capital_hr_manager',
      name: 'Sarah Johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      password: hashedPassword,
      role: UserRole.HR_MANAGER,
      companyId: capitalBank.id,
      isActive: true,
    },
  });
  
  const capitalAdmin = await prisma.user.create({
    data: {
      email: 'admin@capitalbank.com',
      username: 'capital_admin',
      name: 'Mohammed Al-Qasem',
      firstName: 'Mohammed',
      lastName: 'Al-Qasem',
      password: hashedPassword,
      role: UserRole.COMPANY_ADMIN,
      companyId: capitalBank.id,
      isActive: true,
    },
  });

  const abuKhaderUser = await prisma.user.create({
    data: {
      email: 'recruiter@abukhader.com',
      username: 'abukhader_hr',
      name: 'Abu Khader HR',
      firstName: 'HR',
      lastName: 'Manager',
      password: hashedPassword,
      role: UserRole.HR_MANAGER,
      companyId: abuKhader.id,
      isActive: true,
    },
  });
  
  // Additional Abu Khader users
  const abuKhaderRecruiter = await prisma.user.create({
    data: {
      email: 'talent@abukhader.com',
      username: 'abukhader_talent',
      name: 'Layla Nasr',
      firstName: 'Layla',
      lastName: 'Nasr',
      password: hashedPassword,
      role: UserRole.RECRUITER,
      companyId: abuKhader.id,
      isActive: true,
    },
  });

  const menaitechUser = await prisma.user.create({
    data: {
      email: 'recruiter@menaitech.com',
      username: 'menaitech_hr',
      name: 'Menaitech HR',
      firstName: 'HR',
      lastName: 'Lead',
      password: hashedPassword,
      role: UserRole.HR_MANAGER,
      companyId: menaitech.id,
      isActive: true,
    },
  });
  
  // Additional company users
  const orangeHRManager = await prisma.user.create({
    data: {
      email: 'hr@orange.jo',
      username: 'orange_hr',
      name: 'Rami Haddad',
      firstName: 'Rami',
      lastName: 'Haddad',
      password: hashedPassword,
      role: UserRole.HR_MANAGER,
      companyId: orangeJordan.id,
      isActive: true,
    },
  });
  
  const techCrunchRecruiter = await prisma.user.create({
    data: {
      email: 'jobs@techcrunch-jo.com',
      username: 'techcrunch_recruiter',
      name: 'Nour Al-Masri',
      firstName: 'Nour',
      lastName: 'Al-Masri',
      password: hashedPassword,
      role: UserRole.RECRUITER,
      companyId: techCrunch.id,
      isActive: true,
    },
  });
  
  const hospitalHR = await prisma.user.create({
    data: {
      email: 'hr@jordanhospital.com',
      username: 'hospital_hr',
      name: 'Dina Khalil',
      firstName: 'Dina',
      lastName: 'Khalil',
      password: hashedPassword,
      role: UserRole.HR_MANAGER,
      companyId: jordanHospital.id,
      isActive: true,
    },
  });
  
  // Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@rolevate.io',
      username: 'admin',
      name: 'System Admin',
      firstName: 'System',
      lastName: 'Admin',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('Users created');

  // Create subscriptions for each company
  await prisma.subscription.create({
    data: {
      plan: SubscriptionPlan.FREE,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      jobPostLimit: 10,
      candidateLimit: 200,
      interviewLimit: 100,
      companyId: capitalBank.id,
    },
  });

  await prisma.subscription.create({
    data: {
      plan: SubscriptionPlan.FREE,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      jobPostLimit: 10,
      candidateLimit: 200,
      interviewLimit: 100,
      companyId: abuKhader.id,
    },
  });

  await prisma.subscription.create({
    data: {
      plan: SubscriptionPlan.FREE,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      jobPostLimit: 10,
      candidateLimit: 200,
      interviewLimit: 100,
      companyId: menaitech.id,
    },
  });
  
  // Additional subscriptions
  await prisma.subscription.create({
    data: {
      plan: SubscriptionPlan.FREE,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      jobPostLimit: 10,
      candidateLimit: 200,
      interviewLimit: 100,
      companyId: orangeJordan.id,
    },
  });
  
  await prisma.subscription.create({
    data: {
      plan: SubscriptionPlan.FREE,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      jobPostLimit: 5,
      candidateLimit: 100,
      interviewLimit: 50,
      companyId: techCrunch.id,
    },
  });
  
  await prisma.subscription.create({
    data: {
      plan: SubscriptionPlan.FREE,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      jobPostLimit: 15,
      candidateLimit: 300,
      interviewLimit: 150,
      companyId: jordanHospital.id,
      billingCycle: BillingCycle.MONTHLY,
    },
  });

  console.log('Subscriptions created');

  // Create job posts
  const relationshipManagerJob = await prisma.jobPost.create({
    data: {
      title: 'Senior Relationship Manager',
      description: 'We are looking for a Senior Relationship Manager to join our Corporate Banking team.',
      requirements: 'Minimum 5 years of experience in corporate banking, excellent communication skills, and strong financial analysis capabilities.',
      responsibilities: 'Manage key client relationships, develop new business opportunities, and provide financial solutions to corporate clients.',
      benefits: 'Competitive salary, health insurance, and career advancement opportunities.',
      skills: ['Corporate Banking', 'Relationship Management', 'Financial Analysis', 'Credit Assessment', 'Client Acquisition'],
      experienceLevel: ExperienceLevel.SENIOR,
      location: 'Amman, Jordan',
      workType: WorkType.ONSITE,
      salaryMin: 2000,
      salaryMax: 3500,
      currency: 'JOD',
      isActive: true,
      isFeatured: true,
      enableAiInterview: true,
      interviewLanguages: [InterviewLanguage.ENGLISH],
      interviewDuration: 30,
      aiPrompt: `System: You are Laila Al Noor — a friendly and professional AI HR assistant for Capital Bank.
You are guiding a candidate through a structured interview for the role of Senior Relationship Manager in Corporate Banking.

Your job is to ask one question at a time, listen respectfully, and keep the tone professional but warm. Never explain answers or offer feedback. Use short, natural transitions to maintain a conversational flow.

Follow this sequence:
1. Welcome and introduction
2. Experience in corporate/commercial banking
3. Sectors and client types
4. Portfolio size, growth, and retention
5. Credit prep and client evaluation
6. Collaboration with risk and credit departments
7. KPIs and performance achievements
8. Client acquisition and cross-selling
9. Use of banking systems and CRM tools
10. Internal coordination with teams
11. Salary expectations and workplace preferences

Close the interview with a polite thank-you message.`,
      companyId: capitalBank.id,
      createdById: widdUser.id,
      publishedAt: new Date(),
    },
  });
  
  // Additional Capital Bank job posts
  const creditAnalystJob = await prisma.jobPost.create({
    data: {
      title: 'Credit Risk Analyst',
      description: 'Capital Bank is seeking a Credit Risk Analyst to join our Risk Management team.',
      requirements: 'Bachelor\'s degree in Finance, Economics, or related field. 2+ years of experience in credit risk analysis in a banking environment.',
      responsibilities: 'Analyze loan applications, review financial statements, assess creditworthiness, and prepare risk assessment reports.',
      benefits: 'Competitive salary, health insurance, and professional development opportunities.',
      skills: ['Credit Analysis', 'Risk Management', 'Financial Modeling', 'Basel Regulations', 'Banking'],
      experienceLevel: ExperienceLevel.MID_LEVEL,
      location: 'Amman, Jordan',
      workType: WorkType.ONSITE,
      salaryMin: 1200,
      salaryMax: 1800,
      currency: 'JOD',
      isActive: true,
      isFeatured: false,
      enableAiInterview: true,
      interviewLanguages: [InterviewLanguage.ENGLISH],
      interviewDuration: 25,
      companyId: capitalBank.id,
      createdById: widdUser.id,
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 15)),
    },
  });
  
  const digitalBankingOfficerJob = await prisma.jobPost.create({
    data: {
      title: 'Digital Banking Officer',
      description: 'Join our Digital Banking team to drive innovation and enhance our digital offerings.',
      requirements: 'Bachelor\'s degree in Computer Science, IT, or related field. 3+ years of experience in digital banking solutions.',
      responsibilities: 'Manage digital banking initiatives, enhance customer experience, and collaborate with IT for platform improvements.',
      benefits: 'Competitive salary, health insurance, and flexible work arrangements.',
      skills: ['Digital Banking', 'FinTech', 'Project Management', 'User Experience', 'Customer Journey Mapping'],
      experienceLevel: ExperienceLevel.MID_LEVEL,
      location: 'Amman, Jordan',
      workType: WorkType.HYBRID,
      salaryMin: 1500,
      salaryMax: 2200,
      currency: 'JOD',
      isActive: true,
      isFeatured: true,
      enableAiInterview: true,
      interviewLanguages: [InterviewLanguage.ENGLISH],
      interviewDuration: 30,
      companyId: capitalBank.id,
      createdById: capitalHRManager.id,
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 5)),
    },
  });

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
  
  // Additional Abu Khader job posts
  const serviceAdvisorJob = await prisma.jobPost.create({
    data: {
      title: 'Service Advisor',
      description: 'Join our service team to provide exceptional customer service and technical guidance.',
      requirements: 'Technical knowledge of automotive systems, customer service experience, and strong communication skills.',
      responsibilities: 'Advise customers on maintenance needs, prepare service orders, and coordinate with technicians.',
      benefits: 'Competitive salary, training opportunities, and employee discount program.',
      skills: ['Customer Service', 'Automotive Knowledge', 'Service Management', 'Technical Communication', 'Problem Solving'],
      experienceLevel: ExperienceLevel.MID_LEVEL,
      location: 'Amman, Jordan',
      workType: WorkType.ONSITE,
      salaryMin: 700,
      salaryMax: 1100,
      currency: 'JOD',
      isActive: true,
      isFeatured: false,
      enableAiInterview: true,
      interviewLanguages: [InterviewLanguage.ARABIC],
      interviewDuration: 20,
      aiPrompt: `System: You are Fatima Al-Rashid — a technical service manager for Abu Khader Automotive.
You are interviewing candidates for the Service Advisor position.

Your approach should be technical yet approachable, focusing on automotive knowledge and customer service skills.

Interview sequence:
1. Welcome and role introduction
2. Technical automotive knowledge
3. Customer service experience
4. Handling difficult customers
5. Service scheduling and coordination
6. Technical problem-solving
7. Communication with technicians
8. Service quality standards
9. Computer systems and documentation
10. Availability and commitment

Maintain a balance between technical assessment and customer service evaluation.`,
      aiInstructions: `Evaluate technical automotive knowledge, customer service skills, and ability to coordinate between customers and technical staff. Look for problem-solving abilities and communication skills.`,
      companyId: abuKhader.id,
      createdById: abuKhaderUser.id,
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 10)),
    },
  });

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
  
  // Additional job posts for other companies
  const networkEngineerJob = await prisma.jobPost.create({
    data: {
      title: 'Network Engineer',
      description: 'Orange Jordan is looking for a Network Engineer to join our infrastructure team.',
      requirements: 'Bachelor\'s degree in IT, Computer Science, or related field. 3+ years of experience with network infrastructure.',
      responsibilities: 'Manage and maintain network infrastructure, implement network solutions, and troubleshoot network issues.',
      benefits: 'Competitive salary, health insurance, and career growth opportunities.',
      skills: ['Network Administration', 'Cisco', 'Routing', 'Switching', 'Network Security'],
      experienceLevel: ExperienceLevel.MID_LEVEL,
      location: 'Amman, Jordan',
      workType: WorkType.ONSITE,
      salaryMin: 1100,
      salaryMax: 1800,
      currency: 'JOD',
      isActive: true,
      isFeatured: false,
      enableAiInterview: true,
      interviewLanguages: [InterviewLanguage.ENGLISH],
      interviewDuration: 30,
      aiPrompt: `System: You are Omar Al-Zahra — a senior network architect at Orange Jordan.
You are interviewing candidates for the Network Engineer position.

Your approach should be technical and methodical, focusing on network infrastructure knowledge and problem-solving abilities.

Interview sequence:
1. Welcome and role introduction
2. Network infrastructure experience
3. Cisco equipment and certifications
4. Routing and switching protocols
5. Network security implementation
6. Troubleshooting methodologies
7. Network monitoring and performance
8. Project management and documentation
9. Vendor management and support
10. Continuous learning and technology updates

Assess both theoretical knowledge and practical implementation experience.`,
      aiInstructions: `Evaluate technical network engineering skills, Cisco expertise, troubleshooting abilities, and experience with enterprise network infrastructure. Focus on practical problem-solving and security awareness.`,
      companyId: orangeJordan.id,
      createdById: orangeHRManager.id,
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    },
  });
  
  const mobileDevJob = await prisma.jobPost.create({
    data: {
      title: 'Mobile App Developer',
      description: 'TechCrunch Software is hiring a Mobile App Developer to create cutting-edge applications.',
      requirements: 'Experience with React Native or Flutter, knowledge of mobile app development lifecycle, and portfolio of published apps.',
      responsibilities: 'Develop and maintain mobile applications, implement new features, and ensure app performance.',
      benefits: 'Competitive salary, flexible working hours, and remote work options.',
      skills: ['React Native', 'Flutter', 'Mobile Development', 'API Integration', 'UI/UX'],
      experienceLevel: ExperienceLevel.MID_LEVEL,
      location: 'Irbid, Jordan',
      workType: WorkType.HYBRID,
      salaryMin: 1000,
      salaryMax: 1700,
      currency: 'JOD',
      isActive: true,
      isFeatured: true,
      enableAiInterview: true,
      interviewLanguages: [InterviewLanguage.ENGLISH],
      interviewDuration: 40,
      companyId: techCrunch.id,
      createdById: techCrunchRecruiter.id,
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 7)),
    },
  });
  
  const nurseJob = await prisma.jobPost.create({
    data: {
      title: 'Registered Nurse',
      description: 'Jordan Hospital is hiring Registered Nurses to join our dedicated healthcare team.',
      requirements: 'Bachelor\'s degree in Nursing, valid nursing license, and 2+ years of clinical experience.',
      responsibilities: 'Provide direct patient care, administer medications, and coordinate with healthcare team members.',
      benefits: 'Competitive salary, health insurance, and continuing education support.',
      skills: ['Patient Care', 'Medical Records', 'Medication Administration', 'Clinical Assessment', 'Healthcare Protocols'],
      experienceLevel: ExperienceLevel.MID_LEVEL,
      location: 'Amman, Jordan',
      workType: WorkType.ONSITE,
      salaryMin: 900,
      salaryMax: 1400,
      currency: 'JOD',
      isActive: true,
      isFeatured: false,
      enableAiInterview: true,
      interviewLanguages: [InterviewLanguage.ARABIC, InterviewLanguage.ENGLISH],
      interviewDuration: 25,
      companyId: jordanHospital.id,
      createdById: hospitalHR.id,
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 12)),
    },
  });

  console.log('Job posts created');
  
  // Create candidates
  const candidates: any[] = [];
  
  // Create 20 candidates with different profiles
  for (let i = 1; i <= 20; i++) {
    const candidate = await prisma.candidate.create({
      data: {
        phoneNumber: `+96279${100000 + i}`,
        email: `candidate${i}@example.com`,
        name: `Candidate ${i}`,
        firstName: `First${i}`,
        lastName: `Last${i}`,
        whatsappNumber: `+96279${100000 + i}`,
        isActive: true,
        cvUrl: i <= 10 ? `https://example.com/cvs/candidate${i}.pdf` : null,
      },
    });
    
    candidates.push(candidate);
  }
  
  console.log('Candidates created');
  
  // Create applications
  // Apply candidates to various jobs
  const applications: any[] = [];
  
  // Relationship Manager job applications
  for (let i = 0; i < 5; i++) {
    const applicationStatus = [
      ApplicationStatus.PENDING,
      ApplicationStatus.CV_SCREENING,
      ApplicationStatus.CV_APPROVED,
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.INTERVIEW_COMPLETED
    ][i];
    
    const application = await prisma.application.create({
      data: {
        status: applicationStatus,
        appliedAt: new Date(new Date().setDate(new Date().getDate() - (20 - i))),
        updatedAt: new Date(),
        cvUrl: `https://example.com/cvs/candidate${i+1}.pdf`,
        cvFileName: `resume_${i+1}.pdf`,
        coverLetter: `I am excited to apply for the Senior Relationship Manager position at Capital Bank...`,
        jobPostId: relationshipManagerJob.id,
        candidateId: candidates[i].id,
        whatsappSent: i > 0,
        whatsappSentAt: i > 0 ? new Date(new Date().setDate(new Date().getDate() - (19 - i))) : null,
      },
    });
    
    applications.push(application);
  }
  
  // Sales Representative job applications
  for (let i = 5; i < 8; i++) {
    const applicationStatus = [
      ApplicationStatus.CV_APPROVED,
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.SHORTLISTED
    ][i-5];
    
    const application = await prisma.application.create({
      data: {
        status: applicationStatus,
        appliedAt: new Date(new Date().setDate(new Date().getDate() - (15 - i))),
        updatedAt: new Date(),
        cvUrl: `https://example.com/cvs/candidate${i+1}.pdf`,
        cvFileName: `resume_${i+1}.pdf`,
        coverLetter: `I am writing to express my interest in the Sales Representative position at Abu Khader Automotive...`,
        jobPostId: salesRepJob.id,
        candidateId: candidates[i].id,
        whatsappSent: true,
        whatsappSentAt: new Date(new Date().setDate(new Date().getDate() - (14 - i))),
      },
    });
    
    applications.push(application);
  }
  
  // .NET Developer job applications
  for (let i = 8; i < 12; i++) {
    const applicationStatus = [
      ApplicationStatus.CV_SCREENING,
      ApplicationStatus.CV_APPROVED,
      ApplicationStatus.INTERVIEW_COMPLETED,
      ApplicationStatus.FINAL_INTERVIEW
    ][i-8];
    
    const application = await prisma.application.create({
      data: {
        status: applicationStatus,
        appliedAt: new Date(new Date().setDate(new Date().getDate() - (18 - i))),
        updatedAt: new Date(),
        cvUrl: `https://example.com/cvs/candidate${i+1}.pdf`,
        cvFileName: `resume_${i+1}.pdf`,
        coverLetter: `I am applying for the .NET Developer position at Menaitech with 5+ years of experience...`,
        jobPostId: dotNetDevJob.id,
        candidateId: candidates[i].id,
        whatsappSent: i > 9,
        whatsappSentAt: i > 9 ? new Date(new Date().setDate(new Date().getDate() - (16 - i))) : null,
      },
    });
    
    applications.push(application);
  }
  
  // HR Talent Manager job applications
  for (let i = 12; i < 15; i++) {
    const applicationStatus = [
      ApplicationStatus.CV_APPROVED,
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.OFFER_EXTENDED
    ][i-12];
    
    const application = await prisma.application.create({
      data: {
        status: applicationStatus,
        appliedAt: new Date(new Date().setDate(new Date().getDate() - (25 - i))),
        updatedAt: new Date(),
        cvUrl: `https://example.com/cvs/candidate${i+1}.pdf`,
        cvFileName: `resume_${i+1}.pdf`,
        coverLetter: `I am excited to apply for the HR Talent Manager role at Menaitech with my extensive HR experience...`,
        jobPostId: hrManagerJob.id,
        candidateId: candidates[i].id,
        whatsappSent: true,
        whatsappSentAt: new Date(new Date().setDate(new Date().getDate() - (24 - i))),
      },
    });
    
    applications.push(application);
  }
  
  console.log('Applications created');
  
  // Create CV Analysis
  for (let i = 0; i < applications.length; i++) {
    if (i < 15) { // Create CV analysis for the first 15 applications
      await prisma.cvAnalysis.create({
        data: {
          cvUrl: applications[i].cvUrl || `https://example.com/cvs/candidate${i+1}.pdf`,
          extractedText: `Resume content for candidate ${i+1}...`,
          candidateName: candidates[i].name,
          candidateEmail: candidates[i].email,
          candidatePhone: candidates[i].phoneNumber,
          status: 'completed',
          overallScore: 65 + Math.floor(Math.random() * 25),
          skillsScore: 60 + Math.floor(Math.random() * 30),
          experienceScore: 70 + Math.floor(Math.random() * 20),
          educationScore: 75 + Math.floor(Math.random() * 15),
          languageScore: 80 + Math.floor(Math.random() * 20),
          summary: `Candidate has ${3 + Math.floor(Math.random() * 7)} years of relevant experience in the field.`,
          strengths: [
            'Strong communication skills',
            'Relevant industry experience',
            'Technical proficiency'
          ],
          weaknesses: [
            'Limited leadership experience',
            'Some skill gaps in required areas'
          ],
          suggestedImprovements: [
            'Gain more experience in leadership roles',
            'Enhance technical certifications'
          ],
          skills: ['Communication', 'Project Management', 'Technical Writing'],
          certifications: ['Certified Professional', 'Industry Certification'],
          applicationId: applications[i].id,
          candidateId: candidates[i].id,
          aiModel: 'gpt-4',
          processingTime: 15000 + Math.floor(Math.random() * 10000),
        }
      });
    }
  }
  
  console.log('CV Analyses created');
  
  // Create Interviews
  const interviews: any[] = [];
  
  // Create interviews for applications that have advanced to interview stages
  for (let i = 0; i < applications.length; i++) {
    if ([
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.INTERVIEW_IN_PROGRESS,
      ApplicationStatus.INTERVIEW_COMPLETED,
      ApplicationStatus.FINAL_INTERVIEW,
      ApplicationStatus.OFFER_EXTENDED
    ].includes(applications[i].status)) {
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10 + i % 6, 0, 0, 0);
      
      const interviewStatus = applications[i].status === ApplicationStatus.INTERVIEW_SCHEDULED ? 
        InterviewStatus.SCHEDULED : 
        (applications[i].status === ApplicationStatus.INTERVIEW_IN_PROGRESS ? 
          InterviewStatus.IN_PROGRESS : 
          InterviewStatus.COMPLETED);
      
      const interview = await prisma.interview.create({
        data: {
          type: InterviewType.AI_SCREENING,
          language: InterviewLanguage.ENGLISH,
          status: interviewStatus,
          scheduledAt: tomorrow,
          startedAt: interviewStatus !== InterviewStatus.SCHEDULED ? new Date() : null,
          completedAt: interviewStatus === InterviewStatus.COMPLETED ? new Date() : null,
          duration: interviewStatus === InterviewStatus.COMPLETED ? 25 + Math.floor(Math.random() * 20) : null,
          expectedDuration: 30,
          roomName: `interview-${applications[i].id}`,
          roomCode: `code-${Math.floor(100000 + Math.random() * 900000)}`,
          roomId: `room-${applications[i].id}`,
          accessToken: `token-${applications[i].id}`,
          participantToken: `participant-token-${applications[i].id}`,
          recordingEnabled: true,
          candidatePhone: candidates[i].phoneNumber,
          candidateName: candidates[i].name,
          instructions: `Please join the interview at the scheduled time. Be prepared to discuss your experience and skills.`,
          maxDuration: 1800,
          applicationId: applications[i].id,
          candidateId: candidates[i].id,
          overallScore: interviewStatus === InterviewStatus.COMPLETED ? 70 + Math.floor(Math.random() * 20) : null,
          communicationScore: interviewStatus === InterviewStatus.COMPLETED ? 75 + Math.floor(Math.random() * 15) : null,
          technicalScore: interviewStatus === InterviewStatus.COMPLETED ? 65 + Math.floor(Math.random() * 25) : null,
          behavioralScore: interviewStatus === InterviewStatus.COMPLETED ? 80 + Math.floor(Math.random() * 15) : null,
          summary: interviewStatus === InterviewStatus.COMPLETED ? 
            `The candidate demonstrated strong knowledge in their field and communicated well during the interview.` : null,
        }
      });
      
      interviews.push(interview);
    }
  }
  
  console.log('Interviews created');
  
  // Create Fit Scores for completed interviews
  for (let i = 0; i < interviews.length; i++) {
    if (interviews[i].status === InterviewStatus.COMPLETED) {
      const overallScore = 70 + Math.floor(Math.random() * 20);
      const recommendation = overallScore >= 85 ? 
        FitRecommendation.STRONG_HIRE : 
        (overallScore >= 75 ? 
          FitRecommendation.HIRE : 
          (overallScore >= 65 ? 
            FitRecommendation.CONSIDER : 
            FitRecommendation.NO_HIRE));
      
      await prisma.fitScore.create({
        data: {
          overallScore: overallScore,
          cvWeight: 0.4,
          interviewWeight: 0.6,
          cvScore: 65 + Math.floor(Math.random() * 25),
          interviewScore: interviews[i].overallScore,
          recommendation: recommendation,
          confidence: 0.7 + Math.random() * 0.25,
          reasoning: `Based on the candidate's performance in the interview and CV review, they appear to be ${
            recommendation === FitRecommendation.STRONG_HIRE ? 
              'an exceptional' : 
              (recommendation === FitRecommendation.HIRE ? 
                'a strong' : 
                (recommendation === FitRecommendation.CONSIDER ? 
                  'a decent' : 
                  'a weak'))
          } match for this position.`,
          rankInPool: i + 1,
          percentile: Math.round((100 - ((i + 1) / interviews.length * 100)) * 10) / 10,
          applicationId: interviews[i].applicationId,
        }
      });
    }
  }
  
  console.log('Fit Scores created');
  
  // Create Notifications
  for (let i = 0; i < applications.length; i++) {
    // Notification for new applications
    await prisma.notification.create({
      data: {
        type: "APPLICATION_RECEIVED",
        title: 'New Application Received',
        message: `A new application has been received for the position of ${
          applications[i].jobPostId === relationshipManagerJob.id ? 'Senior Relationship Manager' :
          (applications[i].jobPostId === salesRepJob.id ? 'Sales Representative' :
          (applications[i].jobPostId === dotNetDevJob.id ? '.NET Developer' :
          'HR Talent Manager'))
        }`,
        isRead: Math.random() > 0.5,
        readAt: Math.random() > 0.5 ? new Date() : null,
        createdAt: applications[i].appliedAt,
        userId: applications[i].jobPostId === relationshipManagerJob.id ? widdUser.id :
               (applications[i].jobPostId === salesRepJob.id ? abuKhaderUser.id :
               menaitechUser.id),
        applicationId: applications[i].id,
        data: {
          applicationId: applications[i].id,
          candidateName: candidates[i].name
        },
      }
    });
    
    // Notification for interview scheduled (where applicable)
    if ([
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.INTERVIEW_IN_PROGRESS,
      ApplicationStatus.INTERVIEW_COMPLETED,
      ApplicationStatus.FINAL_INTERVIEW,
      ApplicationStatus.OFFER_EXTENDED
    ].includes(applications[i].status)) {
      await prisma.notification.create({
        data: {
          type: "INTERVIEW_SCHEDULED" as any,
          title: 'Interview Scheduled',
          message: `An interview has been scheduled with ${candidates[i].name} for the ${
            applications[i].jobPostId === relationshipManagerJob.id ? 'Senior Relationship Manager' :
            (applications[i].jobPostId === salesRepJob.id ? 'Sales Representative' :
            (applications[i].jobPostId === dotNetDevJob.id ? '.NET Developer' :
            'HR Talent Manager'))
          } position.`,
          isRead: Math.random() > 0.7,
          readAt: Math.random() > 0.7 ? new Date() : null,
          createdAt: new Date(new Date().setDate(new Date().getDate() - (5 - (i % 5)))),
          userId: applications[i].jobPostId === relationshipManagerJob.id ? widdUser.id :
                (applications[i].jobPostId === salesRepJob.id ? abuKhaderUser.id :
                menaitechUser.id),
          applicationId: applications[i].id,
          data: {
            applicationId: applications[i].id,
            candidateName: candidates[i].name,
            interviewDate: new Date(new Date().setDate(new Date().getDate() + 1 + (i % 5)))
          },
        }
      });
    }
  }
  
  console.log('Notifications created');
  
  // Create Interview History entries
  for (let i = 0; i < interviews.length; i++) {
    if (interviews[i].status === InterviewStatus.COMPLETED) {
      await prisma.interviewHistory.create({
        data: {
          candidate_id: interviews[i].candidateId,
          ai: "What experience do you have in this field?",
          user: "I have 5 years of experience working in similar roles, with a focus on project management and team leadership.",
          language: "en",
          jobId: applications.find(a => a.id === interviews[i].applicationId)?.jobPostId,
        }
      });
      
      await prisma.interviewHistory.create({
        data: {
          candidate_id: interviews[i].candidateId,
          ai: "Can you describe a challenging situation you faced in your previous role and how you handled it?",
          user: "In my previous role, we had a tight deadline for a major client project. I organized the team into focused work streams, prioritized tasks, and we delivered successfully ahead of schedule.",
          language: "en",
          jobId: applications.find(a => a.id === interviews[i].applicationId)?.jobPostId,
        }
      });
    }
  }
  
  console.log('Interview History created');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
