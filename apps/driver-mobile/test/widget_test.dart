import 'package:flutter_test/flutter_test.dart';
import 'package:fuel_queue_driver/main.dart';

void main() {
  testWidgets('renders driver shell', (tester) async {
    await tester.pumpWidget(const DriverApp());
    expect(find.text('Fuel Queue'), findsOneWidget);
  });
}

