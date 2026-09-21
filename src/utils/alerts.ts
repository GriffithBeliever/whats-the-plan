// src/utils/alerts.ts
// Central place for the "this isn't wired to a real backend yet" messaging the
// guidelines ask for on every non-functional button, so the copy stays
// consistent everywhere it's used.
import { Alert } from 'react-native';

export function paymentStub(amount: number, label: string, onProceed: () => void) {
  Alert.alert(
    'Payment placeholder',
    `A real charge of $${amount.toFixed(2)} for "${label}" would happen here once a payment provider is connected. For testing, this has been recorded without charging you.`,
    [{ text: 'OK', onPress: onProceed }],
  );
}

export function notImplemented(feature: string) {
  Alert.alert(
    feature,
    `${feature} needs a real backend/service to work and isn't wired up yet. This button is a placeholder for testing.`,
  );
}

export function infoAlert(title: string, message: string) {
  Alert.alert(title, message);
}
