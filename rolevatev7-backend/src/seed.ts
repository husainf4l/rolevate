import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User, UserType } from '../src/user/user.entity';
import { Company } from '../src/company/company.entity';
import { Address } from '../src/address/address.entity';
import { Job, JobType, JobLevel, WorkType, JobStatus } from '../src/job/job.entity';
import { CandidateProfile } from '../src/candidate/candidate-profile.entity';
import { Application, ApplicationStatus } from '../src/application/application.entity';
import { AUTH } from '../src/common/constants/config.constants';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const existingCompanies = await dataSource.getRepository(Company).count();
    if (existingCompanies > 0) {
      console.log('🧹 Clearing existing data...');

      // Clear tables in reverse dependency order using raw queries
      await dataSource.query('DELETE FROM application');
      await dataSource.query('DELETE FROM communication');
      await dataSource.query('DELETE FROM job');
      await dataSource.query('DELETE FROM candidate_profile');
      await dataSource.query('DELETE FROM "user"');
      await dataSource.query('DELETE FROM company');
      await dataSource.query('DELETE FROM address');

      console.log('✅ Cleared existing data');
    }

    console.log('🌱 Seeding demo data...');

    // Create addresses
    const addresses = await dataSource.getRepository(Address).save([
      {
        street: '123 Tech Street',
        city: 'San Francisco',
        country: 'US',
      },
      {
        street: '456 Innovation Ave',
        city: 'New York',
        country: 'US',
      },
      {
        street: '789 Startup Boulevard',
        city: 'Austin',
        country: 'US',
      },
    ]);

    console.log('🏠 Created addresses');

    // Create companies
    const companies = await dataSource.getRepository(Company).save([
      {
        name: 'TechCorp Solutions',
        spelling: 'TechCorp',
        description: 'Leading technology solutions provider specializing in enterprise software development and digital transformation.',
        email: 'hr@techcorp.com',
        phone: '+1-555-0101',
        website: 'https://techcorp.com',
        industry: 'Technology',
        numberOfEmployees: 150,
        address: addresses[0],
        subscription: 'PRO',
      },
      {
        name: 'InnovateLabs Inc',
        spelling: 'InnovateLabs',
        description: 'Cutting-edge research and development company focused on AI and machine learning solutions.',
        email: 'careers@innovatelabs.com',
        phone: '+1-555-0202',
        website: 'https://innovatelabs.com',
        industry: 'Technology',
        numberOfEmployees: 75,
        address: addresses[1],
        subscription: 'ENTERPRISE',
      },
      {
        name: 'Global Finance Group',
        spelling: 'Global Finance',
        description: 'International financial services company providing comprehensive banking and investment solutions.',
        email: 'jobs@globalfinance.com',
        phone: '+1-555-0303',
        website: 'https://globalfinance.com',
        industry: 'Finance',
        numberOfEmployees: 500,
        address: addresses[2],
        subscription: 'PRO',
      },
    ]);

    console.log('🏢 Created companies');

    // Create users
    const users: User[] = [];
    for (const userData of [
      // Company admins
      {
        userType: UserType.BUSINESS,
        email: 'admin@techcorp.com',
        name: 'Sarah Johnson',
        phone: '+1-555-1001',
        companyId: companies[0].id,
        isActive: true,
        password: await bcrypt.hash('TT%%oo77', AUTH.BCRYPT_ROUNDS),
      },
      {
        userType: UserType.BUSINESS,
        email: 'admin@innovatelabs.com',
        name: 'Michael Chen',
        phone: '+1-555-1002',
        companyId: companies[1].id,
        isActive: true,
        password: await bcrypt.hash('TT%%oo77', AUTH.BCRYPT_ROUNDS),
      },
      {
        userType: UserType.BUSINESS,
        email: 'admin@globalfinance.com',
        name: 'Emily Rodriguez',
        phone: '+1-555-1003',
        companyId: companies[2].id,
        isActive: true,
        password: await bcrypt.hash('TT%%oo77', AUTH.BCRYPT_ROUNDS),
      },
      // Candidates
      {
        userType: UserType.CANDIDATE,
        email: 'john.developer@email.com',
        name: 'John Smith',
        phone: '+1-555-2001',
        isActive: true,
      },
      {
        userType: UserType.CANDIDATE,
        email: 'sarah.engineer@email.com',
        name: 'Sarah Wilson',
        phone: '+1-555-2002',
        isActive: true,
      },
      {
        userType: UserType.CANDIDATE,
        email: 'mike.manager@email.com',
        name: 'Mike Davis',
        phone: '+1-555-2003',
        isActive: true,
      },
      {
        userType: UserType.CANDIDATE,
        email: 'lisa.designer@email.com',
        name: 'Lisa Brown',
        phone: '+1-555-2004',
        isActive: true,
      },
      {
        userType: UserType.CANDIDATE,
        email: 'alex.analyst@email.com',
        name: 'Alex Johnson',
        phone: '+1-555-2005',
        isActive: true,
      },
    ]) {
      const user = await dataSource.getRepository(User).save(userData);
      users.push(user);
    }

    console.log('👥 Created users');

    // Create candidate profiles
    const candidateProfiles = await dataSource.getRepository(CandidateProfile).save([
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.developer@email.com',
        phone: '+1-555-2001',
        currentJobTitle: 'Senior Software Engineer',
        currentCompany: 'PreviousTech Inc',
        experienceLevel: 'SENIOR_LEVEL',
        totalExperience: 8,
        expectedSalary: '$120,000 - $150,000',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS'],
        preferredJobTypes: [JobType.FULL_TIME],
        preferredWorkType: WorkType.REMOTE,
        preferredIndustries: ['Technology'],
        preferredLocations: ['San Francisco', 'Remote'],
        isProfilePublic: true,
        isOpenToWork: true,
        profileSummary: 'Experienced full-stack developer with 8+ years in web technologies and cloud platforms.',
        userId: users[3].id,
        user: users[3],
      },
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.engineer@email.com',
        phone: '+1-555-2002',
        currentJobTitle: 'DevOps Engineer',
        currentCompany: 'CloudTech Solutions',
        experienceLevel: 'MID_LEVEL',
        totalExperience: 5,
        expectedSalary: '$90,000 - $120,000',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'Linux'],
        preferredJobTypes: [JobType.FULL_TIME],
        preferredWorkType: WorkType.HYBRID,
        preferredIndustries: ['Technology'],
        preferredLocations: ['New York', 'Boston', 'Remote'],
        isProfilePublic: true,
        isOpenToWork: true,
        profileSummary: 'DevOps engineer specializing in cloud infrastructure and CI/CD pipelines.',
        userId: users[4].id,
        user: users[4],
      },
      {
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike.manager@email.com',
        phone: '+1-555-2003',
        currentJobTitle: 'Engineering Manager',
        currentCompany: 'StartupXYZ',
        experienceLevel: 'EXECUTIVE',
        totalExperience: 12,
        expectedSalary: '$180,000 - $220,000',
        skills: ['Leadership', 'Agile', 'Scrum', 'Team Management', 'JavaScript', 'Python'],
        preferredJobTypes: [JobType.FULL_TIME],
        preferredWorkType: WorkType.ONSITE,
        preferredIndustries: ['Technology'],
        preferredLocations: ['San Francisco', 'Seattle'],
        isProfilePublic: true,
        isOpenToWork: true,
        profileSummary: 'Engineering leader with extensive experience in building and scaling development teams.',
        userId: users[5].id,
        user: users[5],
      },
      {
        firstName: 'Lisa',
        lastName: 'Brown',
        email: 'lisa.designer@email.com',
        phone: '+1-555-2004',
        currentJobTitle: 'UX/UI Designer',
        currentCompany: 'DesignStudio Pro',
        experienceLevel: 'MID_LEVEL',
        totalExperience: 6,
        expectedSalary: '$80,000 - $110,000',
        skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
        preferredJobTypes: [JobType.FULL_TIME, JobType.CONTRACT],
        preferredWorkType: WorkType.REMOTE,
        preferredIndustries: ['Technology', 'Marketing'],
        preferredLocations: ['Remote', 'Los Angeles', 'New York'],
        isProfilePublic: true,
        isOpenToWork: true,
        profileSummary: 'Creative UX/UI designer with a passion for user-centered design and accessibility.',
        userId: users[6].id,
        user: users[6],
      },
      {
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.analyst@email.com',
        phone: '+1-555-2005',
        currentJobTitle: 'Data Analyst',
        currentCompany: 'DataCorp Analytics',
        experienceLevel: 'ENTRY_LEVEL',
        totalExperience: 2,
        expectedSalary: '$60,000 - $80,000',
        skills: ['SQL', 'Python', 'Excel', 'Tableau', 'Statistics', 'Data Visualization'],
        preferredJobTypes: [JobType.FULL_TIME],
        preferredWorkType: WorkType.HYBRID,
        preferredIndustries: ['Technology', 'Finance'],
        preferredLocations: ['Austin', 'Dallas', 'Remote'],
        isProfilePublic: true,
        isOpenToWork: true,
        profileSummary: 'Data analyst with strong analytical skills and experience in business intelligence.',
        userId: users[7].id,
        user: users[7],
      },
    ]);

    console.log('👤 Created candidate profiles');

    // Create jobs individually to trigger @BeforeInsert ID generation
    const jobRepository = dataSource.getRepository(Job);
    const jobs: Job[] = [];

    const jobData = [
      {
        title: 'Senior Full Stack Developer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        salary: '$120,000 - $160,000',
        type: JobType.FULL_TIME,
        deadline: new Date('2025-12-31'),
        description: `We are looking for a Senior Full Stack Developer to join our dynamic engineering team. You will be responsible for developing and maintaining web applications using modern technologies.

Key Responsibilities:
• Design and develop scalable web applications using React and Node.js
• Collaborate with cross-functional teams to deliver high-quality software
• Implement best practices for code quality, testing, and deployment
• Mentor junior developers and contribute to technical architecture decisions
• Participate in code reviews and maintain documentation

Requirements:
• 5+ years of experience in full-stack development
• Proficiency in React, Node.js, and TypeScript
• Experience with cloud platforms (AWS, GCP, or Azure)
• Strong understanding of database design and SQL
• Experience with agile development methodologies

Benefits:
• Competitive salary and equity package
• Health, dental, and vision insurance
• Flexible work arrangements and remote options
• Professional development budget
• Modern office with great amenities`,
        shortDescription: 'Join our engineering team as a Senior Full Stack Developer working on cutting-edge web applications.',
        responsibilities: `Design and develop scalable web applications using React and Node.js
Collaborate with cross-functional teams to deliver high-quality software
Implement best practices for code quality, testing, and deployment
Mentor junior developers and contribute to technical architecture decisions
Participate in code reviews and maintain documentation`,
        requirements: `5+ years of experience in full-stack development
Proficiency in React, Node.js, and TypeScript
Experience with cloud platforms (AWS, GCP, or Azure)
Strong understanding of database design and SQL
Experience with agile development methodologies`,
        benefits: `Competitive salary and equity package
Health, dental, and vision insurance
Flexible work arrangements and remote options
Professional development budget
Modern office with great amenities`,
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL', 'Docker'],
        experience: '5+ years',
        education: 'Bachelor\'s degree in Computer Science or related field',
        jobLevel: JobLevel.SENIOR,
        workType: WorkType.HYBRID,
        industry: 'Technology',
        companyDescription: 'TechCorp Solutions is a leading technology company specializing in enterprise software development and digital transformation solutions.',
        status: JobStatus.ACTIVE,
        companyId: companies[0].id,
        company: companies[0],
        postedById: users[0].id,
        postedBy: users[0],
        featured: true,
        applicants: 0,
        views: 0,
      },
      {
        title: 'DevOps Engineer',
        department: 'Infrastructure',
        location: 'New York, NY',
        salary: '$100,000 - $130,000',
        type: JobType.FULL_TIME,
        deadline: new Date('2025-11-30'),
        description: `We are seeking a skilled DevOps Engineer to help us build and maintain our cloud infrastructure. You will work closely with our development teams to ensure smooth deployment and operation of our applications.

Key Responsibilities:
• Design and implement CI/CD pipelines using modern tools
• Manage cloud infrastructure on AWS with Infrastructure as Code
• Monitor system performance and implement automated scaling solutions
• Ensure security best practices across all infrastructure components
• Collaborate with development teams to optimize application deployment

Requirements:
• 3+ years of experience in DevOps or infrastructure engineering
• Strong experience with AWS services and cloud architecture
• Proficiency in Infrastructure as Code tools (Terraform, CloudFormation)
• Experience with containerization (Docker, Kubernetes)
• Knowledge of monitoring and logging tools

Benefits:
• Competitive compensation package
• Comprehensive health benefits
• Flexible working hours and remote work options
• Learning and development opportunities
• Collaborative and innovative work environment`,
        shortDescription: 'Build and maintain our cloud infrastructure as a DevOps Engineer with focus on automation and scalability.',
        responsibilities: `Design and implement CI/CD pipelines using modern tools
Manage cloud infrastructure on AWS with Infrastructure as Code
Monitor system performance and implement automated scaling solutions
Ensure security best practices across all infrastructure components
Collaborate with development teams to optimize application deployment`,
        requirements: `3+ years of experience in DevOps or infrastructure engineering
Strong experience with AWS services and cloud architecture
Proficiency in Infrastructure as Code tools (Terraform, CloudFormation)
Experience with containerization (Docker, Kubernetes)
Knowledge of monitoring and logging tools`,
        benefits: `Competitive compensation package
Comprehensive health benefits
Flexible working hours and remote work options
Learning and development opportunities
Collaborative and innovative work environment`,
        skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Jenkins', 'Linux'],
        experience: '3+ years',
        education: 'Bachelor\'s degree in Computer Science or related field preferred',
        jobLevel: JobLevel.MID,
        workType: WorkType.REMOTE,
        industry: 'Technology',
        companyDescription: 'InnovateLabs Inc is a cutting-edge research and development company focused on AI and machine learning solutions.',
        status: JobStatus.ACTIVE,
        companyId: companies[1].id,
        company: companies[1],
        postedById: users[1].id,
        postedBy: users[1],
        featured: false,
        applicants: 0,
        views: 0,
      },
      {
        title: 'Financial Analyst',
        department: 'Finance',
        location: 'Austin, TX',
        salary: '$70,000 - $90,000',
        type: JobType.FULL_TIME,
        deadline: new Date('2025-10-31'),
        description: `Join our finance team as a Financial Analyst. You will be responsible for analyzing financial data, preparing reports, and supporting strategic decision-making processes.

Key Responsibilities:
• Analyze financial data and prepare detailed reports
• Assist in budgeting and forecasting activities
• Monitor financial performance and identify trends
• Prepare financial models and conduct variance analysis
• Support audit processes and regulatory compliance

Requirements:
• Bachelor's degree in Finance, Accounting, or related field
• 2+ years of experience in financial analysis
• Proficiency in Excel and financial modeling
• Strong analytical and problem-solving skills
• Experience with ERP systems is a plus

Benefits:
• Competitive salary and performance bonuses
• Health and retirement benefits
• Professional development opportunities
• Flexible work schedule
• Modern office environment`,
        shortDescription: 'Analyze financial data and support strategic decision-making as a Financial Analyst.',
        responsibilities: `Analyze financial data and prepare detailed reports
Assist in budgeting and forecasting activities
Monitor financial performance and identify trends
Prepare financial models and conduct variance analysis
Support audit processes and regulatory compliance`,
        requirements: `Bachelor's degree in Finance, Accounting, or related field
2+ years of experience in financial analysis
Proficiency in Excel and financial modeling
Strong analytical and problem-solving skills
Experience with ERP systems is a plus`,
        benefits: `Competitive salary and performance bonuses
Health and retirement benefits
Professional development opportunities
Flexible work schedule
Modern office environment`,
        skills: ['Excel', 'Financial Modeling', 'Data Analysis', 'Budgeting', 'Forecasting'],
        experience: '2+ years',
        education: 'Bachelor\'s degree in Finance, Accounting, or related field',
        jobLevel: JobLevel.MID,
        workType: WorkType.ONSITE,
        industry: 'Finance',
        companyDescription: 'Global Finance Group is an international financial services company providing comprehensive banking and investment solutions.',
        status: JobStatus.ACTIVE,
        companyId: companies[2].id,
        company: companies[2],
        postedById: users[2].id,
        postedBy: users[2],
        featured: false,
        applicants: 0,
        views: 0,
      },
    ];

    for (const jobInfo of jobData) {
      const job = jobRepository.create(jobInfo);
      const savedJob = await jobRepository.save(job);
      jobs.push(savedJob);
    }

    console.log('💼 Created jobs');

    // Create applications
    const applications = await dataSource.getRepository(Application).save([
      {
        status: ApplicationStatus.PENDING,
        jobId: jobs[0].id,
        job: jobs[0],
        candidateId: users[3].id, // Reference the user, not candidate profile
        candidate: users[3], // Reference the user, not candidate profile
        coverLetter: 'I am excited to apply for the Senior Full Stack Developer position at TechCorp Solutions. With 8 years of experience in full-stack development, I believe I would be a great fit for your team.',
        expectedSalary: '$140,000',
        appliedAt: new Date('2025-10-01'),
      },
      {
        status: ApplicationStatus.INTERVIEWED,
        jobId: jobs[0].id,
        job: jobs[0],
        candidateId: users[4].id, // Reference the user, not candidate profile
        candidate: users[4], // Reference the user, not candidate profile
        coverLetter: 'I am interested in the Senior Full Stack Developer role and believe my DevOps background would bring valuable infrastructure knowledge to your development team.',
        expectedSalary: '$130,000',
        appliedAt: new Date('2025-10-02'),
      },
      {
        status: ApplicationStatus.PENDING,
        jobId: jobs[1].id,
        job: jobs[1],
        candidateId: users[4].id, // Reference the user, not candidate profile
        candidate: users[4], // Reference the user, not candidate profile
        coverLetter: 'As an experienced DevOps Engineer, I am excited about the opportunity to work on innovative infrastructure solutions at InnovateLabs.',
        expectedSalary: '$115,000',
        appliedAt: new Date('2025-10-03'),
      },
      {
        status: ApplicationStatus.REVIEWED,
        jobId: jobs[2].id,
        job: jobs[2],
        candidateId: users[7].id, // Reference the user, not candidate profile
        candidate: users[7], // Reference the user, not candidate profile
        coverLetter: 'My background in data analysis and finance makes me excited to contribute to Global Finance Group as a Financial Analyst.',
        expectedSalary: '$75,000',
        appliedAt: new Date('2025-10-04'),
      },
    ]);

    console.log('📄 Created applications');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${addresses.length} addresses created`);
    console.log(`   • ${companies.length} companies created`);
    console.log(`   • ${users.length} users created`);
    console.log(`   • ${candidateProfiles.length} candidate profiles created`);
    console.log(`   • ${jobs.length} jobs created`);
    console.log(`   • ${applications.length} applications created`);

    console.log('\n🎯 Demo data ready for frontend development!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the seed function
seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
