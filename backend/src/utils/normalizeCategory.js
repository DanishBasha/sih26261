export function normalizeCategory(category) {
  if (!category) return 'New Technical Institution';
  const c = category.trim().toLowerCase();
  if (c.includes('new') || c.includes('institution')) return 'New Technical Institution';
  if (c.includes('eoa') || c.includes('extension')) return 'EoA / break in preceding academic years / restoration of intake';
  return category;
}
