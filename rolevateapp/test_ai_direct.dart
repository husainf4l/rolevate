import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:gql_exec/gql_exec.dart';
import 'dart:async';

// Exact copy of your TimeoutLink
class TimeoutLink extends Link {
  final Link _link;
  final Duration timeout;

  TimeoutLink(this._link, {this.timeout = const Duration(seconds: 120)});

  @override
  Stream<Response> request(Request request, [NextLink? forward]) async* {
    final StreamController<Response> controller = StreamController<Response>();
    StreamSubscription<Response>? subscription;
    Timer? timer;
    
    try {
      timer = Timer(timeout, () {
        print('⏰ TIMEOUT TRIGGERED after ${timeout.inSeconds} seconds!');
        controller.addError(
          TimeoutException('GraphQL request timeout after ${timeout.inSeconds} seconds'),
        );
        controller.close();
        subscription?.cancel();
      });
      
      subscription = _link.request(request, forward).listen(
        (response) {
          print('✅ Response received, canceling timer');
          timer?.cancel();
          controller.add(response);
        },
        onError: (error) {
          print('❌ Error received: $error');
          timer?.cancel();
          controller.addError(error);
        },
        onDone: () {
          print('✅ Stream done');
          timer?.cancel();
          controller.close();
        },
      );
      
      await for (final response in controller.stream) {
        yield response;
      }
    } finally {
      timer?.cancel();
      await subscription?.cancel();
      await controller.close();
    }
  }
}

void main() async {
  print('🧪 Testing AI Generation with TimeoutLink...\n');
  
  await initHiveForFlutter();
  
  final httpLink = HttpLink('https://rolevate.com/api/graphql');
  final timeoutLink = TimeoutLink(httpLink);
  
  final client = GraphQLClient(
    link: timeoutLink,
    cache: GraphQLCache(store: HiveStore()),
  );
  
  const mutation = '''
    mutation GenerateJobAnalysis(\$input: JobAnalysisInput!) {
      generateJobAnalysis(input: \$input) {
        description
        shortDescription
        responsibilities
        requirements
      }
    }
  ''';
  
  final variables = {
    'input': {
      'jobTitle': 'Software Engineer',
      'location': 'Remote',
      'employeeType': 'FULL_TIME',
    }
  };
  
  print('📤 Sending request at ${DateTime.now()}');
  print('   Input: $variables\n');
  
  try {
    final result = await client.mutate(
      MutationOptions(
        document: gql(mutation),
        variables: variables,
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );
    
    print('\n📥 Response received at ${DateTime.now()}');
    
    if (result.hasException) {
      print('❌ Exception: ${result.exception}');
      print('   GraphQL Errors: ${result.exception?.graphqlErrors}');
      print('   Link Exception: ${result.exception?.linkException}');
    } else {
      print('✅ Success!');
      print('   Data keys: ${result.data?.keys}');
      if (result.data?['generateJobAnalysis'] != null) {
        final analysis = result.data!['generateJobAnalysis'];
        print('   Description length: ${analysis['description']?.toString().length ?? 0}');
      }
    }
  } catch (e) {
    print('\n❌ Caught exception: $e');
    print('   Type: ${e.runtimeType}');
  }
}
