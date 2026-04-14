export function rewardEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('coffee')) return '☕';
  if (lower.includes('book')) return '📚';
  if (lower.includes('movie') || lower.includes('cinema')) return '🎬';
  if (lower.includes('food') || lower.includes('meal')) return '🍽️';
  if (lower.includes('voucher') || lower.includes('coupon')) return '🎫';
  if (lower.includes('tech') || lower.includes('gadget')) return '💻';
  if (lower.includes('gift')) return '🎁';
  return '🏆';
}
