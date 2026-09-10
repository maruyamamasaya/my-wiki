export const WIKI_TIME_ZONE = 'Asia/Tokyo';

export function dateInJapan(value: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: WIKI_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function dateTimeInJapan(value: Date | string) {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: WIKI_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(typeof value === 'string' ? new Date(value) : value);
}
