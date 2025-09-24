import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Rolevate HR System database seeding...');

  // 1. Create User Types
  console.log('Creating user types...');
  const candidateUserType = await prisma.userType.upsert({
    where: { code: 'candidate' },
    update: {},
    create: {
      name_en: 'Candidate',
      name_ar: 'مرشح',
      code: 'candidate',
      description: 'Job seekers and candidates',
      isDefault: true,
    },
  });

  const businessUserType = await prisma.userType.upsert({
    where: { code: 'business' },
    update: {},
    create: {
      name_en: 'Business',
      name_ar: 'أعمال',
      code: 'business',
      description: 'Business users and employers',
      isDefault: false,
    },
  });

  const adminUserType = await prisma.userType.upsert({
    where: { code: 'admin' },
    update: {},
    create: {
      name_en: 'Administrator',
      name_ar: 'مدير',
      code: 'admin',
      description: 'System administrators',
      isDefault: false,
    },
  });

  // 2. Create Company Sizes
  console.log('Creating company sizes...');
  const companySizes = [
    { name_en: 'Startup', name_ar: 'شركة ناشئة', code: 'startup', minSize: 1, maxSize: 10 },
    { name_en: 'Small', name_ar: 'صغيرة', code: 'small', minSize: 11, maxSize: 50 },
    { name_en: 'Medium', name_ar: 'متوسطة', code: 'medium', minSize: 51, maxSize: 200 },
    { name_en: 'Large', name_ar: 'كبيرة', code: 'large', minSize: 201, maxSize: 1000 },
    { name_en: 'Enterprise', name_ar: 'مؤسسة', code: 'enterprise', minSize: 1001, maxSize: null },
  ];

  for (const size of companySizes) {
    await prisma.companySize.upsert({
      where: { code: size.code },
      update: {},
      create: size,
    });
  }

  // 3. Create Industries
  console.log('Creating industries...');
  const industries = [
    { name_en: 'Technology', name_ar: 'تكنولوجيا', code: 'technology' },
    { name_en: 'Healthcare', name_ar: 'رعاية صحية', code: 'healthcare' },
    { name_en: 'Finance', name_ar: 'مالية', code: 'finance' },
    { name_en: 'Education', name_ar: 'تعليم', code: 'education' },
    { name_en: 'Manufacturing', name_ar: 'تصنيع', code: 'manufacturing' },
    { name_en: 'Retail', name_ar: 'تجارة التجزئة', code: 'retail' },
    { name_en: 'Construction', name_ar: 'بناء', code: 'construction' },
    { name_en: 'Transportation', name_ar: 'نقل', code: 'transportation' },
    { name_en: 'Hospitality', name_ar: 'ضيافة', code: 'hospitality' },
    { name_en: 'Government', name_ar: 'حكومية', code: 'government' },
  ];

  for (const industry of industries) {
    await prisma.industry.upsert({
      where: { code: industry.code },
      update: {},
      create: industry,
    });
  }

  // 4. Create Employment Statuses
  console.log('Creating employment statuses...');
  const employmentStatuses = [
    { name_en: 'Active', name_ar: 'نشط', code: 'active' },
    { name_en: 'On Leave', name_ar: 'في إجازة', code: 'on_leave' },
    { name_en: 'Terminated', name_ar: 'منتهي الخدمة', code: 'terminated' },
    { name_en: 'Suspended', name_ar: 'موقوف', code: 'suspended' },
    { name_en: 'Probation', name_ar: 'تحت التجربة', code: 'probation' },
  ];

  for (const status of employmentStatuses) {
    await prisma.employmentStatus.upsert({
      where: { code: status.code },
      update: {},
      create: status,
    });
  }

  // 5. Create Job Types
  console.log('Creating job types...');
  const jobTypes = [
    { name_en: 'Full Time', name_ar: 'دوام كامل', code: 'full_time' },
    { name_en: 'Part Time', name_ar: 'دوام جزئي', code: 'part_time' },
    { name_en: 'Contract', name_ar: 'عقد', code: 'contract' },
    { name_en: 'Internship', name_ar: 'تدريب', code: 'internship' },
    { name_en: 'Freelance', name_ar: 'عمل حر', code: 'freelance' },
    { name_en: 'Temporary', name_ar: 'مؤقت', code: 'temporary' },
  ];

  for (const type of jobTypes) {
    await prisma.jobType.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    });
  }

  // 6. Create Job Levels
  console.log('Creating job levels...');
  const jobLevels = [
    { name_en: 'Entry Level', name_ar: 'مستوى مبتدئ', code: 'entry' },
    { name_en: 'Junior', name_ar: 'مبتدئ', code: 'junior' },
    { name_en: 'Mid Level', name_ar: 'متوسط', code: 'mid' },
    { name_en: 'Senior', name_ar: 'كبير', code: 'senior' },
    { name_en: 'Lead', name_ar: 'قائد فريق', code: 'lead' },
    { name_en: 'Manager', name_ar: 'مدير', code: 'manager' },
    { name_en: 'Director', name_ar: 'مدير تنفيذي', code: 'director' },
    { name_en: 'Executive', name_ar: 'تنفيذي', code: 'executive' },
  ];

  for (const level of jobLevels) {
    await prisma.jobLevel.upsert({
      where: { code: level.code },
      update: {},
      create: level,
    });
  }

  // 7. Create Job Locations
  console.log('Creating job locations...');
  const jobLocations = [
    { name_en: 'Remote', name_ar: 'عن بعد', code: 'remote' },
    { name_en: 'On-site', name_ar: 'في الموقع', code: 'onsite' },
    { name_en: 'Hybrid', name_ar: 'مختلط', code: 'hybrid' },
  ];

  for (const location of jobLocations) {
    await prisma.jobLocation.upsert({
      where: { code: location.code },
      update: {},
      create: location,
    });
  }

  // 8. Create Job Statuses
  console.log('Creating job statuses...');
  const jobStatuses = [
    { name_en: 'Draft', name_ar: 'مسودة', code: 'draft' },
    { name_en: 'Published', name_ar: 'منشور', code: 'published' },
    { name_en: 'Closed', name_ar: 'مغلق', code: 'closed' },
    { name_en: 'Cancelled', name_ar: 'ملغى', code: 'cancelled' },
    { name_en: 'On Hold', name_ar: 'معلق', code: 'on_hold' },
  ];

  for (const status of jobStatuses) {
    await prisma.jobStatus.upsert({
      where: { code: status.code },
      update: {},
      create: status,
    });
  }

  // 9. Create Application Statuses
  console.log('Creating application statuses...');
  const applicationStatuses = [
    { name_en: 'Submitted', name_ar: 'مقدم', code: 'submitted', isFinal: false },
    { name_en: 'Under Review', name_ar: 'قيد المراجعة', code: 'under_review', isFinal: false },
    { name_en: 'Shortlisted', name_ar: 'مرشح', code: 'shortlisted', isFinal: false },
    { name_en: 'Interview Scheduled', name_ar: 'مجدولة مقابلة', code: 'interview_scheduled', isFinal: false },
    { name_en: 'Interviewed', name_ar: 'تمت المقابلة', code: 'interviewed', isFinal: false },
    { name_en: 'Hired', name_ar: 'تم التوظيف', code: 'hired', isFinal: true },
    { name_en: 'Rejected', name_ar: 'مرفوض', code: 'rejected', isFinal: true },
    { name_en: 'Withdrawn', name_ar: 'منسحب', code: 'withdrawn', isFinal: true },
  ];

  for (const status of applicationStatuses) {
    await prisma.applicationStatus.upsert({
      where: { code: status.code },
      update: {},
      create: status,
    });
  }

  // 10. Create Interview Types
  console.log('Creating interview types...');
  const interviewTypes = [
    { name_en: 'Phone Interview', name_ar: 'مقابلة هاتفية', code: 'phone' },
    { name_en: 'Video Interview', name_ar: 'مقابلة فيديو', code: 'video' },
    { name_en: 'On-site Interview', name_ar: 'مقابلة في الموقع', code: 'onsite' },
    { name_en: 'Technical Interview', name_ar: 'مقابلة تقنية', code: 'technical' },
    { name_en: 'HR Interview', name_ar: 'مقابلة موارد بشرية', code: 'hr' },
    { name_en: 'Panel Interview', name_ar: 'مقابلة لجنة', code: 'panel' },
  ];

  for (const type of interviewTypes) {
    await prisma.interviewType.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    });
  }

  // 11. Create Interview Statuses
  console.log('Creating interview statuses...');
  const interviewStatuses = [
    { name_en: 'Scheduled', name_ar: 'مجدولة', code: 'scheduled' },
    { name_en: 'In Progress', name_ar: 'جارية', code: 'in_progress' },
    { name_en: 'Completed', name_ar: 'مكتملة', code: 'completed' },
    { name_en: 'Cancelled', name_ar: 'ملغاة', code: 'cancelled' },
    { name_en: 'No Show', name_ar: 'عدم حضور', code: 'no_show' },
    { name_en: 'Rescheduled', name_ar: 'معاد جدولتها', code: 'rescheduled' },
  ];

  for (const status of interviewStatuses) {
    await prisma.interviewStatus.upsert({
      where: { code: status.code },
      update: {},
      create: status,
    });
  }

  // 12. Continue with existing Permission Actions, Resources, Categories
  console.log('Creating permission actions...');
  const actions = [
    { name_en: 'Create', name_ar: 'إنشاء', code: 'create' },
    { name_en: 'Read', name_ar: 'قراءة', code: 'read' },
    { name_en: 'Update', name_ar: 'تحديث', code: 'update' },
    { name_en: 'Delete', name_ar: 'حذف', code: 'delete' },
    { name_en: 'Approve', name_ar: 'موافقة', code: 'approve' },
    { name_en: 'Reject', name_ar: 'رفض', code: 'reject' },
    { name_en: 'Publish', name_ar: 'نشر', code: 'publish' },
    { name_en: 'Archive', name_ar: 'أرشفة', code: 'archive' },
    { name_en: 'Export', name_ar: 'تصدير', code: 'export' },
    { name_en: 'Import', name_ar: 'استيراد', code: 'import' },
    { name_en: 'Schedule', name_ar: 'جدولة', code: 'schedule' },
    { name_en: 'Review', name_ar: 'مراجعة', code: 'review' },
  ];

  for (const action of actions) {
    await prisma.permissionAction.upsert({
      where: { code: action.code },
      update: {},
      create: action,
    });
  }

  // 13. Create Permission Resources
  console.log('Creating permission resources...');
  const resources = [
    { name_en: 'User', name_ar: 'مستخدم', code: 'user' },
    { name_en: 'Role', name_ar: 'دور', code: 'role' },
    { name_en: 'Permission', name_ar: 'صلاحية', code: 'permission' },
    { name_en: 'Group', name_ar: 'مجموعة', code: 'group' },
    { name_en: 'Company', name_ar: 'شركة', code: 'company' },
    { name_en: 'Department', name_ar: 'قسم', code: 'department' },
    { name_en: 'Employee', name_ar: 'موظف', code: 'employee' },
    { name_en: 'Candidate', name_ar: 'مرشح', code: 'candidate' },
    { name_en: 'Job', name_ar: 'وظيفة', code: 'job' },
    { name_en: 'Application', name_ar: 'طلب', code: 'application' },
    { name_en: 'Interview', name_ar: 'مقابلة', code: 'interview' },
    { name_en: 'Report', name_ar: 'تقرير', code: 'report' },
    { name_en: 'Setting', name_ar: 'إعداد', code: 'setting' },
  ];

  for (const resource of resources) {
    await prisma.permissionResource.upsert({
      where: { code: resource.code },
      update: {},
      create: resource,
    });
  }

  // 14. Create Permission Categories
  console.log('Creating permission categories...');
  const categories = [
    { name_en: 'User Management', name_ar: 'إدارة المستخدمين', code: 'user_management' },
    { name_en: 'Role & Permission Management', name_ar: 'إدارة الأدوار والصلاحيات', code: 'rbac_management' },
    { name_en: 'Company Management', name_ar: 'إدارة الشركات', code: 'company_management' },
    { name_en: 'Employee Management', name_ar: 'إدارة الموظفين', code: 'employee_management' },
    { name_en: 'Job Management', name_ar: 'إدارة الوظائف', code: 'job_management' },
    { name_en: 'Application Management', name_ar: 'إدارة الطلبات', code: 'application_management' },
    { name_en: 'Interview Management', name_ar: 'إدارة المقابلات', code: 'interview_management' },
    { name_en: 'Reporting', name_ar: 'التقارير', code: 'reporting' },
    { name_en: 'System Administration', name_ar: 'إدارة النظام', code: 'system_admin' },
  ];

  for (const category of categories) {
    await prisma.permissionCategory.upsert({
      where: { code: category.code },
      update: {},
      create: category,
    });
  }

  // 15. Create Groups (Organizational Structure for Rolevate)
  console.log('Creating organizational groups...');
  const rootGroup = await prisma.group.upsert({
    where: { code: 'rolevate' },
    update: {},
    create: {
      name_en: 'Rolevate Organization',
      name_ar: 'مؤسسة رولفيت',
      code: 'rolevate',
      description: 'Root organizational unit for Rolevate HR System',
    },
  });

  const adminGroup = await prisma.group.upsert({
    where: { code: 'admin' },
    update: {},
    create: {
      name_en: 'Administration',
      name_ar: 'الإدارة',
      code: 'admin',
      description: 'Administrative group',
      parentId: rootGroup.id,
    },
  });

  const hrGroup = await prisma.group.upsert({
    where: { code: 'hr' },
    update: {},
    create: {
      name_en: 'Human Resources',
      name_ar: 'الموارد البشرية',
      code: 'hr',
      description: 'Human Resources Department',
      parentId: rootGroup.id,
    },
  });

  // 16. Create Basic Roles for HR System
  console.log('Creating HR system roles...');
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'super_admin' },
    update: {},
    create: {
      name_en: 'Super Administrator',
      name_ar: 'مدير عام',
      code: 'super_admin',
      description: 'Full system access for Rolevate platform',
      isSystem: true,
    },
  });

  const hrManagerRole = await prisma.role.upsert({
    where: { code: 'hr_manager' },
    update: {},
    create: {
      name_en: 'HR Manager',
      name_ar: 'مدير الموارد البشرية',
      code: 'hr_manager',
      description: 'Human Resources Manager with full HR access',
      parentId: superAdminRole.id,
    },
  });

  const recruiterRole = await prisma.role.upsert({
    where: { code: 'recruiter' },
    update: {},
    create: {
      name_en: 'Recruiter',
      name_ar: 'موظف توظيف',
      code: 'recruiter',
      description: 'Recruitment specialist',
      parentId: hrManagerRole.id,
    },
  });

  const companyAdminRole = await prisma.role.upsert({
    where: { code: 'company_admin' },
    update: {},
    create: {
      name_en: 'Company Administrator',
      name_ar: 'مدير الشركة',
      code: 'company_admin',
      description: 'Administrator for company-specific operations',
    },
  });

  const hiringManagerRole = await prisma.role.upsert({
    where: { code: 'hiring_manager' },
    update: {},
    create: {
      name_en: 'Hiring Manager',
      name_ar: 'مدير التوظيف',
      code: 'hiring_manager',
      description: 'Manager responsible for hiring decisions',
      parentId: companyAdminRole.id,
    },
  });

  const candidateRole = await prisma.role.upsert({
    where: { code: 'candidate' },
    update: {},
    create: {
      name_en: 'Candidate',
      name_ar: 'مرشح',
      code: 'candidate',
      description: 'Job candidate with limited access',
      isSystem: true,
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { code: 'employee' },
    update: {},
    create: {
      name_en: 'Employee',
      name_ar: 'موظف',
      code: 'employee',
      description: 'Company employee',
      isSystem: true,
    },
  });

  console.log('✅ Rolevate HR System database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log('- User Types: 3');
  console.log('- Company Sizes: 5');
  console.log('- Industries: 10');
  console.log('- Employment Statuses: 5');
  console.log('- Job Types: 6');
  console.log('- Job Levels: 8');
  console.log('- Job Locations: 3');
  console.log('- Job Statuses: 5');
  console.log('- Application Statuses: 8');
  console.log('- Interview Types: 6');
  console.log('- Interview Statuses: 6');
  console.log('- Permission Actions: 12');
  console.log('- Permission Resources: 13');
  console.log('- Permission Categories: 9');
  console.log('- Groups: 3');
  console.log('- Roles: 7');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });