import 'dart:io';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() async {
  // Test without auth
  print('Testing AI generation WITHOUT auth...');
  final response1 = await http.post(
    Uri.parse('https://rolevate.com/api/graphql'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'query': '''
        mutation GenerateJobAnalysis(\$input: JobAnalysisInput!) {
          generateJobAnalysis(input: \$input) {
            description
            shortDescription
          }
        }
      ''',
      'variables': {
        'input': {
          'jobTitle': 'Software Engineer',
          'location': 'Remote',
          'employeeType': 'FULL_TIME',
        }
      }
    }),
  ).timeout(Duration(seconds: 30));
  
  print('Status: ${response1.statusCode}');
  print('Response: ${response1.body.substring(0, 200)}...');
  
  exit(0);
}
