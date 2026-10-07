import 'package:flutter_test/flutter_test.dart';
import 'package:fuel_queue_worker/main.dart';

void main() {
  testWidgets('renders worker shell', (tester) async {
    await tester.pumpWidget(const WorkerApp());
    expect(find.text('Fuel Queue Worker'), findsOneWidget);
  });
}

