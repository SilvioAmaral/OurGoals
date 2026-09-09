export function interpolate(text: string, partnerName: string | null | undefined): string {
  return text.replace(/\{partner\}/g, partnerName ?? 'Partner');
}
