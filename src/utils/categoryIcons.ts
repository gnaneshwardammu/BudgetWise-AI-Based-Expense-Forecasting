export const CATEGORY_ICONS: Record<string, string> = {
  Income: '💰',
  Food: '🍔',
  Transport: '🚗',
  Rent: '🏠',
  Housing: '🏠',
  Utilities: '⚡',
  Shopping: '🛒',
  Entertainment: '🎬',
  Health: '🏥',
  Education: '📚',
  Travel: '✈️',
  Savings: '💎',
  Other: '📦',
};

export const getCategoryIcon = (category: string): string =>
  CATEGORY_ICONS[category] ?? '📦';
