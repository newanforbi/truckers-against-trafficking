import { Alert, Linking, Platform, Share } from 'react-native';

export async function openExternal(url: string): Promise<void> {
  const supported = await Linking.canOpenURL(url);
  if (!supported && Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  if (!supported) {
    Alert.alert('Cannot open link', url);
    return;
  }
  await Linking.openURL(url);
}

export async function callNumber(phone: string): Promise<void> {
  await openExternal(`tel:${phone}`);
}

export async function textNumber(phone: string, body: string): Promise<void> {
  const encoded = encodeURIComponent(body);
  const separator = Platform.OS === 'ios' ? '&' : '?';
  await openExternal(`sms:${phone}${separator}body=${encoded}`);
}

export async function shareText(message: string): Promise<void> {
  try {
    await Share.share({ message });
  } catch {
    Alert.alert('Share canceled');
  }
}
