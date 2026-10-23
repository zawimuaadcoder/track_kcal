import { Alert, Platform } from 'react-native';

// Alert.alert no hace nada en web, así que allí usamos los diálogos del navegador.

export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') window.alert(message ? `${title}\n\n${message}` : title);
  else Alert.alert(title, message);
}

export function confirm(
  title: string,
  message: string | undefined,
  confirmLabel: string,
  onConfirm: () => void,
  cancelLabel = 'Cancelar',
) {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
