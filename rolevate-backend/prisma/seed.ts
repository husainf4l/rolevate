import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create demo companies
  const roxateCompany = await prisma.company.create({
    data: {
      name: 'Roxate Ltd',
      displayName: 'Roxate Limited',
      industry: 'Technology',
      description: 'AI-powered solutions for the banking and financial services sector',
      website: 'https://roxate.com',
      location: 'Dubai, UAE',
      country: 'UAE',
      city: 'Dubai',
      size: 'MEDIUM',
      logo: 'https://example.com/roxate-logo.png',
    },
  });

  const bankCompany = await prisma.company.create({
    data: {
      name: 'MENA Bank',
      displayName: 'MENA Commercial Bank',
      industry: 'Banking & Financial Services',
      description: 'Leading commercial bank in the MENA region',
      website: 'https://menabank.com',
      location: 'Riyadh, Saudi Arabia',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      size: 'ENTERPRISE',
      logo: 'https://example.com/menabank-logo.png',
    },
  });

  // Create main user - Husain (Super Admin at Roxate)
  const husainUser = await prisma.user.create({
    data: {
      email: 'husain@roxate.com',
      username: 'husain',
      name: 'Husain Abdullah',
      firstName: 'Husain',
      lastName: 'Abdullah',
      password: hashedPassword,
      phoneNumber: '+971501234567',
      whatsappNumber: '+971501234567',
      profileImage: 'https://example.com/husain-avatar.jpg',
      bio: 'CEO and Founder of Roxate Ltd, passionate about AI in recruitment',
      role: 'SUPER_ADMIN',
      companyId: roxateCompany.id,
      isActive: true,
      isTwoFactorEnabled: false,
    },
  });

  // Create HR Manager at MENA Bank
  const hrManager = await prisma.user.create({
    data: {
      email: 'sarah.al-rashid@menabank.com',
      username: 'sarah.alrashid',
      name: 'Sarah Al-Rashid',
      firstName: 'Sarah',
      lastName: 'Al-Rashid',
      password: hashedPassword,
      phoneNumber: '+966501234567',
      whatsappNumber: '+966501234567',
      profileImage: 'https://example.com/sarah-avatar.jpg',
      bio: 'Senior HR Manager specializing in digital transformation recruitment',
      role: 'HR_MANAGER',
      companyId: bankCompany.id,
    },
  });

  // Create candidates
  const candidate1 = await prisma.candidate.create({
    data: {
      email: 'ahmed.hassan@email.com',
      name: 'Ahmed Hassan',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      phoneNumber: '+971509876543',
      whatsappNumber: '+971509876543',
      profileImage: 'https://example.com/ahmed-avatar.jpg',
      bio: 'Senior Software Engineer with 8 years experience in fintech',
    },
  });

  const candidate2 = await prisma.candidate.create({
    data: {
      email: 'fatima.al-zahra@email.com',
      name: 'Fatima Al-Zahra',
      firstName: 'Fatima',
      lastName: 'Al-Zahra',
      phoneNumber: '+966509876543',
      whatsappNumber: '+966509876543',
      profileImage: 'https://example.com/fatima-avatar.jpg',
      bio: 'Data Scientist specializing in AI and machine learning for banking',
    },
  });

  const candidate3 = await prisma.candidate.create({
    data: {
      email: 'omar.mahmoud@email.com',
      name: 'Omar Mahmoud',
      firstName: 'Omar',
      lastName: 'Mahmoud',
      phoneNumber: '+20109876543',
      whatsappNumber: '+20109876543',
      profileImage: 'https://example.com/omar-avatar.jpg',
      bio: 'Cybersecurity specialist with focus on financial systems',
    },
  });

  // Create job posts
  const jobPost1 = await prisma.jobPost.create({
    data: {
      title: 'Senior Backend Developer - Fintech',
      description: 'We are looking for a skilled Senior Backend Developer to join our fintech team. You will be responsible for developing and maintaining our core banking APIs and microservices.',
      requirements: 'Bachelor\'s degree in Computer Science or related field. 5+ years of experience in backend development. Strong knowledge of Node.js, TypeScript, PostgreSQL, and microservices architecture.',
      responsibilities: 'Design and implement scalable APIs, collaborate with frontend teams, ensure security best practices, optimize database performance, mentor junior developers.',
      benefits: 'Competitive salary, health insurance, flexible working hours, professional development budget, annual bonus.',
      skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'REST APIs', 'Microservices'],
      experienceLevel: 'SENIOR',
      location: 'Riyadh, Saudi Arabia',
      workType: 'HYBRID',
      salaryMin: 15000,
      salaryMax: 25000,
      currency: 'SAR',
      companyId: bankCompany.id,
      createdById: hrManager.id,
      enableAiInterview: true,
      interviewLanguages: ['ENGLISH', 'ARABIC'],
      interviewDuration: 45,
      technicalQuestions: {
        questions: [
          {
            id: 1,
            question: 'Explain the difference between microservices and monolithic architecture in banking systems.',
            category: 'Architecture',
            difficulty: 'Medium'
          },
          {
            id: 2,
            question: 'How would you implement secure API authentication for a banking application?',
            category: 'Security',
            difficulty: 'Hard'
          }
        ]
      },
      behavioralQuestions: {
        questions: [
          {
            id: 1,
            question: 'Describe a time when you had to work under pressure to meet a critical deadline.',
            category: 'Stress Management',
            difficulty: 'Medium'
          },
          {
            id: 2,
            question: 'How do you ensure code quality when working in a team?',
            category: 'Teamwork',
            difficulty: 'Easy'
          }
        ]
      },
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  const jobPost2 = await prisma.jobPost.create({
    data: {
      title: 'AI/ML Engineer - Risk Analytics',
      description: 'Join our AI team to develop machine learning models for risk assessment and fraud detection in banking operations.',
      requirements: 'Master\'s degree in Data Science, Computer Science, or related field. 3+ years of experience in ML/AI. Strong knowledge of Python, TensorFlow, scikit-learn, and SQL.',
      responsibilities: 'Develop and deploy ML models, analyze large datasets, collaborate with risk management teams, ensure model accuracy and performance.',
      benefits: 'Competitive salary, health insurance, learning budget, conference attendance, stock options.',
      skills: ['Python', 'TensorFlow', 'scikit-learn', 'SQL', 'Docker', 'AWS', 'Risk Analytics', 'Statistics'],
      experienceLevel: 'MID_LEVEL',
      location: 'Dubai, UAE',
      workType: 'REMOTE',
      salaryMin: 12000,
      salaryMax: 18000,
      currency: 'AED',
      companyId: bankCompany.id,
      createdById: hrManager.id,
      enableAiInterview: true,
      interviewLanguages: ['ENGLISH'],
      interviewDuration: 60,
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    },
  });

  const jobPost3 = await prisma.jobPost.create({
    data: {
      title: 'Cybersecurity Analyst',
      description: 'Protect our banking infrastructure from cyber threats. Monitor, detect, and respond to security incidents.',
      requirements: 'Bachelor\'s degree in Cybersecurity or related field. 2+ years of experience in cybersecurity. Knowledge of SIEM tools, penetration testing, and compliance frameworks.',
      responsibilities: 'Monitor security events, conduct vulnerability assessments, implement security controls, respond to incidents, maintain compliance documentation.',
      benefits: 'Competitive salary, health insurance, security certifications budget, flexible schedule.',
      skills: ['SIEM', 'Penetration Testing', 'ISO 27001', 'PCI DSS', 'Network Security', 'Incident Response'],
      experienceLevel: 'JUNIOR',
      location: 'Cairo, Egypt',
      workType: 'ONSITE',
      salaryMin: 8000,
      salaryMax: 12000,
      currency: 'EGP',
      companyId: bankCompany.id,
      createdById: hrManager.id,
      enableAiInterview: true,
      interviewLanguages: ['BILINGUAL'],
      interviewDuration: 30,
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
  });

  // Create applications
  const application1 = await prisma.application.create({
    data: {
      jobPostId: jobPost1.id,
      candidateId: candidate1.id,
      status: 'INTERVIEW_COMPLETED',
      cvUrl: 'https://example.com/cvs/ahmed-hassan-cv.pdf',
      cvFileName: 'ahmed-hassan-cv.pdf',
      coverLetter: 'I am excited to apply for the Senior Backend Developer position. With my extensive experience in fintech and Node.js development, I believe I would be a valuable addition to your team.',
      whatsappSent: true,
      whatsappSentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      whatsappStatus: 'REPLIED',
      isScreeningPassed: true,
      screeningNotes: 'Strong technical background, good communication skills',
    },
  });

  const application2 = await prisma.application.create({
    data: {
      jobPostId: jobPost2.id,
      candidateId: candidate2.id,
      status: 'CV_APPROVED',
      cvUrl: 'https://example.com/cvs/fatima-alzahra-cv.pdf',
      cvFileName: 'fatima-alzahra-cv.pdf',
      coverLetter: 'As a data scientist with a passion for AI in banking, I am thrilled to apply for this ML Engineer position.',
      whatsappSent: true,
      whatsappSentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      whatsappStatus: 'DELIVERED',
      isScreeningPassed: true,
      screeningNotes: 'Excellent ML background, relevant experience',
    },
  });

  const application3 = await prisma.application.create({
    data: {
      jobPostId: jobPost3.id,
      candidateId: candidate3.id,
      status: 'PENDING',
      cvUrl: 'https://example.com/cvs/omar-mahmoud-cv.pdf',
      cvFileName: 'omar-mahmoud-cv.pdf',
      coverLetter: 'I am interested in the Cybersecurity Analyst position and believe my experience aligns well with your requirements.',
      whatsappSent: false,
    },
  });

  // Create CV analyses
  const cvAnalysis1 = await prisma.cvAnalysis.create({
    data: {
      applicationId: application1.id,
      candidateId: candidate1.id,
      cvUrl: 'https://example.com/cvs/ahmed-hassan-cv.pdf',
      extractedText: 'Ahmed Hassan\nSenior Software Engineer\n8 years experience in fintech...',
      overallScore: 88.5,
      skillsScore: 92.0,
      experienceScore: 89.0,
      educationScore: 85.0,
      languageScore: 90.0,
      certificationScore: 80.0,
      summary: 'Strong candidate with excellent technical skills and relevant fintech experience. Demonstrates proficiency in required technologies.',
      strengths: [
        'Extensive Node.js and TypeScript experience',
        'Strong understanding of microservices architecture',
        'Previous fintech experience',
        'Good communication skills',
        'Leadership experience'
      ],
      weaknesses: [
        'Limited Kubernetes experience',
        'Could benefit from more cloud certifications'
      ],
      suggestedImprovements: [
        'Consider obtaining AWS/Azure certifications',
        'Expand Kubernetes knowledge',
        'Add more details about scalability achievements'
      ],
      skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Redis', 'REST APIs', 'Microservices', 'Git'],
      experience: {
        positions: [
          {
            title: 'Senior Software Engineer',
            company: 'FinTech Solutions',
            duration: '2020-2024',
            responsibilities: ['Led backend development team', 'Designed microservices architecture', 'Improved API performance by 40%']
          },
          {
            title: 'Software Engineer',
            company: 'Banking Corp',
            duration: '2018-2020',
            responsibilities: ['Developed core banking APIs', 'Implemented security features', 'Worked with payment systems']
          }
        ]
      },
      education: {
        degrees: [
          {
            degree: 'Bachelor of Computer Science',
            university: 'UAE University',
            year: '2016',
            gpa: '3.7'
          }
        ]
      },
      certifications: ['AWS Developer Associate', 'Certified Kubernetes Application Developer'],
      languages: {
        english: 'Fluent',
        arabic: 'Native'
      },
      aiModel: 'gpt-4-turbo',
      processingTime: 2500,
    },
  });

  const cvAnalysis2 = await prisma.cvAnalysis.create({
    data: {
      applicationId: application2.id,
      candidateId: candidate2.id,
      cvUrl: 'https://example.com/cvs/fatima-alzahra-cv.pdf',
      extractedText: 'Fatima Al-Zahra\nData Scientist\n5 years experience in AI/ML...',
      overallScore: 91.2,
      skillsScore: 94.0,
      experienceScore: 88.0,
      educationScore: 95.0,
      languageScore: 85.0,
      certificationScore: 92.0,
      summary: 'Outstanding candidate with strong ML background and proven track record in banking AI applications.',
      strengths: [
        'Advanced ML/AI expertise',
        'Strong mathematical background',
        'Experience with banking data',
        'Published research papers',
        'TensorFlow and PyTorch proficiency'
      ],
      weaknesses: [
        'Limited production deployment experience',
        'Could improve software engineering practices'
      ],
      suggestedImprovements: [
        'Gain more MLOps experience',
        'Learn Docker and Kubernetes',
        'Improve software engineering skills'
      ],
      skills: ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'SQL', 'R', 'Statistics', 'Deep Learning'],
      experience: {
        positions: [
          {
            title: 'Senior Data Scientist',
            company: 'AI Banking Solutions',
            duration: '2021-2024',
            responsibilities: ['Developed fraud detection models', 'Improved risk assessment accuracy by 25%', 'Led ML team of 4 people']
          },
          {
            title: 'Data Scientist',
            company: 'Tech Analytics',
            duration: '2019-2021',
            responsibilities: ['Built recommendation systems', 'Analyzed customer behavior', 'Created ML pipelines']
          }
        ]
      },
      education: {
        degrees: [
          {
            degree: 'Master of Data Science',
            university: 'King Abdullah University',
            year: '2019',
            gpa: '3.9'
          },
          {
            degree: 'Bachelor of Mathematics',
            university: 'Cairo University',
            year: '2017',
            gpa: '3.8'
          }
        ]
      },
      certifications: ['Google Cloud ML Engineer', 'AWS ML Specialty', 'TensorFlow Developer'],
      languages: {
        english: 'Fluent',
        arabic: 'Native'
      },
      aiModel: 'gpt-4-turbo',
      processingTime: 2800,
    },
  });

  // Create interviews
  const interview1 = await prisma.interview.create({
    data: {
      applicationId: application1.id,
      candidateId: candidate1.id,
      type: 'AI_SCREENING',
      language: 'ENGLISH',
      status: 'COMPLETED',
      scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2700000),
      duration: 45,
      expectedDuration: 45,
      roomName: `interview-${application1.id}-${Date.now()}`,
      roomId: 'room_abc123',
      recordingEnabled: true,
      recordingUrl: 'https://example.com/recordings/interview1.mp4',
      overallScore: 85.5,
      communicationScore: 88.0,
      technicalScore: 89.0,
      behavioralScore: 82.0,
      confidenceScore: 87.0,
      clarityScore: 90.0,
      responseTimeScore: 83.0,
      summary: 'Strong technical candidate with good communication skills. Demonstrated deep understanding of backend architecture and fintech domain.',
      keyHighlights: [
        'Excellent technical knowledge',
        'Clear communication',
        'Relevant experience',
        'Problem-solving skills'
      ],
      areasForImprovement: [
        'Could be more confident in answers',
        'Provide more specific examples'
      ],
      recommendations: 'Proceed to technical interview. Strong candidate for the role.',
      questionsAsked: {
        questions: [
          {
            question: 'Explain microservices architecture in banking',
            answer: 'Microservices allow banks to break down monolithic systems...',
            score: 90
          },
          {
            question: 'How do you handle API security?',
            answer: 'I implement OAuth 2.0, JWT tokens, rate limiting...',
            score: 85
          }
        ]
      },
      transcription: 'Interview transcript: Hello Ahmed, thank you for joining us today...',
      sentimentAnalysis: {
        overall: 'positive',
        confidence: 0.85,
        emotions: ['confident', 'enthusiastic', 'professional']
      },
      aiModel: 'gpt-4-turbo',
      processingTime: 3200,
    },
  });

  // Create fit scores
  const fitScore1 = await prisma.fitScore.create({
    data: {
      applicationId: application1.id,
      overallScore: 86.7,
      cvWeight: 0.4,
      interviewWeight: 0.6,
      cvScore: 88.5,
      interviewScore: 85.5,
      recommendation: 'HIRE',
      confidence: 0.87,
      reasoning: 'Strong technical candidate with excellent CV and good interview performance. Demonstrates relevant experience and skills for the role.',
      rankInPool: 1,
      percentile: 95.0,
      version: '1.0',
    },
  });

  const fitScore2 = await prisma.fitScore.create({
    data: {
      applicationId: application2.id,
      overallScore: 91.2,
      cvWeight: 0.4,
      interviewWeight: 0.6,
      cvScore: 91.2,
      interviewScore: null, // No interview yet
      recommendation: 'STRONG_HIRE',
      confidence: 0.92,
      reasoning: 'Outstanding candidate with exceptional ML background and perfect fit for the AI role. CV demonstrates all required skills and more.',
      rankInPool: 1,
      percentile: 98.0,
      version: '1.0',
    },
  });

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: husainUser.id,
      applicationId: application1.id,
      type: 'INTERVIEW_COMPLETED',
      title: 'Interview Completed',
      message: 'Ahmed Hassan has completed the AI screening interview for Senior Backend Developer position.',
      data: {
        score: 85.5,
        recommendation: 'HIRE'
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId: hrManager.id,
      applicationId: application2.id,
      type: 'CV_ANALYZED',
      title: 'CV Analysis Complete',
      message: 'Fatima Al-Zahra\'s CV has been analyzed with a score of 91.2/100.',
      data: {
        score: 91.2,
        recommendation: 'STRONG_HIRE'
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId: hrManager.id,
      applicationId: application3.id,
      type: 'APPLICATION_RECEIVED',
      title: 'New Application',
      message: 'Omar Mahmoud has applied for the Cybersecurity Analyst position.',
      isRead: false,
    },
  });

  console.log('🌱 Seed data created successfully!');
  console.log('📧 Demo login credentials:');
  console.log('   Email: husain@roxate.com');
  console.log('   Password: password123');
  console.log('   Role: SUPER_ADMIN');
  console.log('');
  console.log('🏢 Demo companies created:');
  console.log('   - Roxate Ltd (Technology)');
  console.log('   - MENA Bank (Banking & Financial Services)');
  console.log('');
  console.log('💼 Demo job posts created:');
  console.log('   - Senior Backend Developer - Fintech');
  console.log('   - AI/ML Engineer - Risk Analytics');
  console.log('   - Cybersecurity Analyst');
  console.log('');
  console.log('👥 Demo candidates with applications:');
  console.log('   - Ahmed Hassan (Interview Completed)');
  console.log('   - Fatima Al-Zahra (CV Approved)');
  console.log('   - Omar Mahmoud (Pending)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
