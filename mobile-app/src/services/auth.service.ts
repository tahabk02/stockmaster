import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';

export class BiometricService {
  static async isAvailable() {
    if (Platform.OS === 'web') return false;
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  static async authenticate() {
    const available = await this.isAvailable();
    if (!available) return false;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authentification Oracle SCM',
        fallbackLabel: 'Utiliser le mot de passe',
        disableDeviceFallback: false,
      });

      if (result.success) {
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return true;
      } else {
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return false;
      }
    } catch (error) {
      console.error('[Biometrics] Error:', error);
      return false;
    }
  }
}
