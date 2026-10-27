import * as institutionService from '../services/institution.service.js';

export async function getProfile(req, res) {
  const profile = await institutionService.getInstitutionProfile(req.params.id);
  res.json({ success: true, profile });
}

export async function updateProfile(req, res) {
  const profile = await institutionService.updateInstitutionProfile(req.params.id, req.body);
  res.json({ success: true, profile });
}
