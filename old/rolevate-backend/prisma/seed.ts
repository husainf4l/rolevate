import { PrismaClient, UserType, Industry, Country, JobType, JobLevel, WorkType, JobStatus, ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechCorp Solutions',
        spelling: 'Tech Corp',
        description: 'Leading technology solutions provider specializing in AI and machine learning.',
        email: 'hr@techcorp.com',
        phone: '+1-555-0101',
        website: 'https://techcorp.com',
        industry: Industry.TECHNOLOGY,
        numberOfEmployees: 150,
        subscription: 'PRO',
        address: {
          create: {
            street: '123 Tech Street',
            city: 'Dubai',
            country: Country.AE,
          },
        },
      },
    }),
    prisma.company.create({
      data: {
        name: 'Global Finance Inc',
        description: 'International financial services company.',
        email: 'careers@globalfinance.com',
        phone: '+1-555-0202',
        website: 'https://globalfinance.com',
        industry: Industry.FINANCE,
        numberOfEmployees: 500,
        subscription: 'ENTERPRISE',
        address: {
          create: {
            street: '456 Finance Ave',
            city: 'Dubai',
            country: Country.AE,
          },
        },
      },
    }),
    prisma.company.create({
      data: {
        name: 'HealthFirst Medical',
        description: 'Healthcare provider focused on patient-centered care.',
        email: 'jobs@healthfirst.com',
        phone: '+1-555-0303',
        website: 'https://healthfirst.com',
        industry: Industry.HEALTHCARE,
        numberOfEmployees: 200,
        subscription: 'PRO',
        address: {
          create: {
            street: '789 Health Blvd',
            city: 'Dubai',
            country: Country.AE,
          },
        },
      },
    }),
  ]);

  console.log('✅ Created demo companies');

  // Create demo users (company admins and candidates)
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    // Company admins
    prisma.user.create({
      data: {
        userType: UserType.COMPANY,
        email: 'admin@techcorp.com',
        password: hashedPassword,
        name: 'John Smith',
        companyId: companies[0].id,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        userType: UserType.COMPANY,
        email: 'admin@globalfinance.com',
        password: hashedPassword,
        name: 'Sarah Johnson',
        companyId: companies[1].id,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        userType: UserType.COMPANY,
        email: 'admin@healthfirst.com',
        password: hashedPassword,
        name: 'Mike Davis',
        companyId: companies[2].id,
        isActive: true,
      },
    }),
    // Candidates
    prisma.user.create({
      data: {
        userType: UserType.CANDIDATE,
        email: 'alice.developer@email.com',
        password: hashedPassword,
        name: 'Alice Chen',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        userType: UserType.CANDIDATE,
        email: 'bob.engineer@email.com',
        password: hashedPassword,
        name: 'Bob Wilson',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        userType: UserType.CANDIDATE,
        email: 'carol.manager@email.com',
        password: hashedPassword,
        name: 'Carol Brown',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Created demo users');

  // Create candidate profiles
  const candidateProfiles = await Promise.all([
    prisma.candidateProfile.create({
      data: {
        firstName: 'Alice',
        lastName: 'Chen',
        email: 'alice.developer@email.com',
        phone: '+1-555-1001',
        dateOfBirth: new Date('1995-03-15'),
        nationality: Country.AE,
        currentLocation: 'Dubai, UAE',
        currentJobTitle: 'Senior Software Engineer',
        currentCompany: 'StartupXYZ',
        experienceLevel: 'SENIOR_LEVEL',
        totalExperience: 5,
        expectedSalary: '$120,000 - $150,000',
        noticePeriod: '2 weeks',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS'],
        preferredJobTypes: [JobType.FULL_TIME],
        preferredWorkType: WorkType.REMOTE,
        preferredIndustries: [Industry.TECHNOLOGY],
        preferredLocations: ['Dubai', 'Abu Dhabi', 'Remote'],
        savedJobs: [],
        isProfilePublic: true,
        isOpenToWork: true,
        profileSummary: 'Experienced full-stack developer with 5+ years in web technologies. Passionate about building scalable applications.',
        userId: users[3].id,
      },
    }),
    prisma.candidateProfile.create({
      data: {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.engineer@email.com',
        phone: '+1-555-1002',
        dateOfBirth: new Date('1992-07-22'),
        nationality: Country.AE,
        currentLocation: 'Dubai, UAE',
        currentJobTitle: 'DevOps Engineer',
        currentCompany: 'TechGiant',
        experienceLevel: 'MID_LEVEL',
        totalExperience: 4,
        expectedSalary: '$100,000 - $130,000',
        noticePeriod: '1 month',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'Python'],
        preferredJobTypes: [JobType.FULL_TIME],
        preferredWorkType: WorkType.HYBRID,
        preferredIndustries: [Industry.TECHNOLOGY, Industry.FINANCE],
        preferredLocations: ['Dubai', 'Sharjah'],
        savedJobs: [],
        isProfilePublic: true,
        isOpenToWork: true,
        profileSummary: 'DevOps engineer with expertise in cloud infrastructure and CI/CD pipelines.',
        userId: users[4].id,
      },
    }),
    prisma.candidateProfile.create({
      data: {
        firstName: 'Carol',
        lastName: 'Brown',
        email: 'carol.manager@email.com',
        phone: '+1-555-1003',
        dateOfBirth: new Date('1988-11-08'),
        nationality: Country.AE,
        currentLocation: 'Dubai, UAE',
        currentJobTitle: 'Product Manager',
        currentCompany: 'HealthTech Inc',
        experienceLevel: 'SENIOR_LEVEL',
        totalExperience: 8,
        expectedSalary: '$140,000 - $170,000',
        noticePeriod: '2 weeks',
        skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'SQL'],
        preferredJobTypes: [JobType.FULL_TIME],
        preferredWorkType: WorkType.ONSITE,
        preferredIndustries: [Industry.HEALTHCARE, Industry.TECHNOLOGY],
        preferredLocations: ['Dubai', 'Abu Dhabi'],
        savedJobs: [],
        isProfilePublic: true,
        isOpenToWork: true,
        profileSummary: 'Experienced product manager with 8+ years in healthcare technology.',
        userId: users[5].id,
      },
    }),
  ]);

  console.log('✅ Created candidate profiles');

  // Create demo jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Senior Full Stack Developer',
        department: 'Engineering',
        location: 'Dubai, UAE',
        salary: '$120,000 - $160,000',
        type: JobType.FULL_TIME,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: `We are looking for a Senior Full Stack Developer to join our growing team.

## Responsibilities:
- Develop and maintain web applications using modern technologies
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews and mentoring

## Requirements:
- 3+ years of experience with JavaScript/TypeScript
- Experience with React and Node.js
- Knowledge of databases (PostgreSQL preferred)
- Familiarity with cloud platforms (AWS preferred)`,
        shortDescription: 'Join our engineering team as a Senior Full Stack Developer working on cutting-edge web applications.',
        responsibilities: `- Develop scalable web applications
- Collaborate with product and design teams
- Write comprehensive tests
- Participate in agile development process`,
        requirements: `- Bachelor's degree in Computer Science or equivalent experience
- 3+ years of full-stack development experience
- Proficiency in JavaScript, TypeScript, React, and Node.js
- Experience with REST APIs and databases`,
        benefits: `- Competitive salary and equity
- Health, dental, and vision insurance
- Flexible work arrangements
- Professional development budget
- Free lunch and snacks`,
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
        experience: '3+ years',
        education: 'Bachelor\'s degree preferred',
        jobLevel: JobLevel.SENIOR,
        workType: WorkType.REMOTE,
        industry: 'Technology',
        companyDescription: 'TechCorp Solutions is a leading technology company specializing in AI-powered business solutions.',
        status: JobStatus.ACTIVE,
        companyId: companies[0].id,
        interviewLanguage: 'english',
        featured: true,
        applicants: 0,
        views: 0,
      },
    }),
    prisma.job.create({
      data: {
        title: 'DevOps Engineer',
        department: 'Infrastructure',
        location: 'Dubai, UAE',
        salary: '$110,000 - $140,000',
        type: JobType.FULL_TIME,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        description: `We're seeking a DevOps Engineer to help scale our infrastructure.

## Key Responsibilities:
- Manage and maintain CI/CD pipelines
- Monitor system performance and reliability
- Implement infrastructure as code
- Collaborate with development teams

## Requirements:
- Experience with Docker and Kubernetes
- Knowledge of AWS or GCP
- Scripting skills (Python/Bash)
- Understanding of monitoring tools`,
        shortDescription: 'Scale our infrastructure and improve deployment processes as a DevOps Engineer.',
        responsibilities: `- Maintain CI/CD pipelines
- Monitor application performance
- Implement automation scripts
- Ensure system security and compliance`,
        requirements: `- 2+ years of DevOps experience
- Experience with containerization (Docker)
- Knowledge of cloud platforms
- Strong scripting abilities`,
        benefits: `- Competitive compensation
- Comprehensive health benefits
- Remote work options
- Learning and development opportunities`,
        skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Python', 'Jenkins'],
        experience: '2+ years',
        education: 'Bachelor\'s degree in Computer Science or related field',
        jobLevel: JobLevel.MID,
        workType: WorkType.HYBRID,
        industry: 'Finance',
        companyDescription: 'Global Finance Inc provides innovative financial solutions to businesses worldwide.',
        status: JobStatus.ACTIVE,
        companyId: companies[1].id,
        interviewLanguage: 'english',
        featured: false,
        applicants: 0,
        views: 0,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Healthcare Product Manager',
        department: 'Product',
        location: 'Dubai, UAE',
        salary: '$130,000 - $160,000',
        type: JobType.FULL_TIME,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        description: `Join our product team to drive healthcare innovation.

## What You'll Do:
- Define product strategy and roadmap
- Work closely with engineering and design teams
- Conduct user research and analyze market trends
- Manage product lifecycle from ideation to launch

## What We Look For:
- 5+ years of product management experience
- Healthcare industry experience preferred
- Strong analytical and communication skills
- Experience with agile methodologies`,
        shortDescription: 'Lead product strategy for healthcare technology solutions.',
        responsibilities: `- Define product vision and strategy
- Collaborate with cross-functional teams
- Conduct market research and competitive analysis
- Manage product backlog and prioritization`,
        requirements: `- 5+ years of product management experience
- Experience in healthcare technology preferred
- Strong analytical and problem-solving skills
- Excellent communication and leadership abilities`,
        benefits: `- Competitive salary and bonuses
- Comprehensive health and wellness benefits
- Flexible work arrangements
- Professional development opportunities
- Meaningful work in healthcare`,
        skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'Healthcare'],
        experience: '5+ years',
        education: 'Bachelor\'s degree required, MBA preferred',
        jobLevel: JobLevel.SENIOR,
        workType: WorkType.ONSITE,
        industry: 'Healthcare',
        companyDescription: 'HealthFirst Medical is committed to improving patient outcomes through innovative technology.',
        status: JobStatus.ACTIVE,
        companyId: companies[2].id,
        interviewLanguage: 'english',
        featured: true,
        applicants: 0,
        views: 0,
      },
    }),
  ]);

  console.log('✅ Created demo jobs');

  // Create job applications
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        status: ApplicationStatus.SUBMITTED,
        jobId: jobs[0].id,
        candidateId: candidateProfiles[0].id,
        coverLetter: 'I am excited to apply for the Senior Full Stack Developer position. With my 5+ years of experience in web development and passion for technology, I believe I would be a great fit for your team.',
        expectedSalary: '$135,000',
        noticePeriod: '2 weeks',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    }),
    prisma.application.create({
      data: {
        status: ApplicationStatus.REVIEWING,
        jobId: jobs[1].id,
        candidateId: candidateProfiles[1].id,
        coverLetter: 'I am interested in the DevOps Engineer role and believe my experience with cloud infrastructure and automation would be valuable to your team.',
        expectedSalary: '$115,000',
        noticePeriod: '1 month',
        appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    }),
  ]);

  console.log('✅ Created demo applications');

  // Update job applicant counts
  await prisma.job.update({
    where: { id: jobs[0].id },
    data: { applicants: 1 },
  });

  await prisma.job.update({
    where: { id: jobs[1].id },
    data: { applicants: 1 },
  });

  console.log('✅ Updated job applicant counts');

  // Create some notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'SUCCESS',
        category: 'APPLICATION',
        title: 'Application Submitted',
        message: 'Your application for Senior Full Stack Developer has been submitted successfully.',
        userId: users[3].id,
        companyId: companies[0].id,
        metadata: { jobId: jobs[0].id },
      },
    }),
    prisma.notification.create({
      data: {
        type: 'INFO',
        category: 'APPLICATION',
        title: 'Application Under Review',
        message: 'Your application for DevOps Engineer is now under review.',
        userId: users[4].id,
        companyId: companies[1].id,
        metadata: { jobId: jobs[1].id },
      },
    }),
  ]);

  console.log('✅ Created demo notifications');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Demo Data Summary:');
  console.log(`   • ${companies.length} companies created`);
  console.log(`   • ${users.length} users created`);
  console.log(`   • ${candidateProfiles.length} candidate profiles created`);
  console.log(`   • ${jobs.length} jobs created`);
  console.log(`   • ${applications.length} applications created`);
  console.log('\n🔐 Demo Login Credentials:');
  console.log('   Company Admins:');
  console.log('   • admin@techcorp.com / password123');
  console.log('   • admin@globalfinance.com / password123');
  console.log('   • admin@healthfirst.com / password123');
  console.log('   Candidates:');
  console.log('   • alice.developer@email.com / password123');
  console.log('   • bob.engineer@email.com / password123');
  console.log('   • carol.manager@email.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });