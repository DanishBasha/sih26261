export function validateReviewInput({ application_id, reason }) {
  if (!application_id) return 'Application ID is required';
  if (!reason) return 'Review justification or deficiency reason is required';
  return null;
}
