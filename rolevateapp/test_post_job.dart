import 'package:get_storage/get_storage.dart';

void main() async {
  await GetStorage.init();
  
  final storage = GetStorage();
  
  // Create a test job
  final testJob = {
    'id': 'test-job-${DateTime.now().millisecondsSinceEpoch}',
    'slug': 'english-teacher',
    'title': 'English Teacher',
    'department': 'Education',
    'location': 'Dubai, UAE',
    'salary': 'AED 10,000 - 15,000',
    'type': 'FULL_TIME',
    'jobLevel': 'MID',
    'workType': 'ONSITE',
    'status': 'ACTIVE',
    'description': 'We are looking for an experienced English Teacher to join our team.',
    'shortDescription': 'Teach English to students in Dubai',
    'responsibilities': '• Plan and deliver English lessons\n• Assess student progress\n• Communicate with parents',
    'requirements': '• Bachelor\'s degree in Education or English\n• 2+ years teaching experience\n• Native or fluent English speaker',
    'benefits': '• Health insurance\n• Annual flight allowance\n• Professional development opportunities',
    'skills': ['Teaching', 'English', 'Communication', 'Curriculum Development'],
    'deadline': DateTime.now().add(const Duration(days: 30)).toIso8601String(),
    'createdAt': DateTime.now().toIso8601String(),
    'updatedAt': DateTime.now().toIso8601String(),
    'featured': false,
    'applicants': 0.0,
    'views': 0.0,
    'company': {
      'id': 'mock-company-id',
      'name': 'Dubai International School',
      'description': 'Leading educational institution in Dubai',
      'logo': null,
      'industry': 'Education',
      'size': '51-200',
      'location': 'Dubai, UAE',
    },
    'postedBy': {
      'id': 'mock-user-id',
      'userType': 'BUSINESS',
      'name': 'HR Manager',
    },
  };
  
  // Get existing jobs
  final stored = storage.read<List>('mock_created_jobs') ?? [];
  final jobs = stored.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  
  // Add test job
  jobs.add(testJob);
  
  // Save back to storage
  storage.write('mock_created_jobs', jobs);
  
  print('✅ Test job created successfully!');
  print('📝 Job Title: ${testJob['title']}');
  print('📊 Total jobs in storage: ${jobs.length}');
  print('\nNow open the app and navigate to Manage Jobs to see your English Teacher job!');
}
