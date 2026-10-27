export async function processApplicationJob(applicationId) {
  console.log(`[JOB] Background batch document processing for application ${applicationId}`);
  return { status: 'completed' };
}
