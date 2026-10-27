export function validateApplicationInput({ institution_name, institution_email, category }) {
  if (!institution_name) return 'Institution name is required';
  if (!institution_email) return 'Institution contact email is required';
  if (!category) return 'Application category is required';
  return null;
}
