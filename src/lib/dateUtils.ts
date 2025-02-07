import { formatDistanceToNow as formatDistance } from 'date-fns';

export function formatDistanceToNow(date: Date): string {
  return formatDistance(date, new Date(), { addSuffix: false });
}