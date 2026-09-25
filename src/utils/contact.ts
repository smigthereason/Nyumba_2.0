import { Linking, Platform, Share } from 'react-native';

export function openPhone(phone: string) {
  const url = `tel:${phone}`;
  return Linking.openURL(url);
}

export function openWhatsApp(whatsapp: string, message?: string) {
  const text = encodeURIComponent(
    message ?? 'Hi, I found your listing on Nyumba and would like to know more.'
  );
  const digits = whatsapp.replace(/[^\d]/g, '');
  const url = `https://wa.me/${digits}?text=${text}`;
  return Linking.openURL(url);
}

export async function shareProperty(title: string, estate: string, priceLabel: string) {
  const message = `${title} in ${estate} — ${priceLabel}. Found on Nyumba.`;
  try {
    await Share.share(
      Platform.OS === 'ios'
        ? { message, url: 'https://nyumba.app' }
        : { message: `${message}\nhttps://nyumba.app` }
    );
  } catch {
    // user cancelled
  }
}
