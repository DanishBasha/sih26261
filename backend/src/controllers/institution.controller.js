import * as instService from '../services/institution.service.js';

export async function saveDetails(req, res) {
  try {
    const userId = req.user.id;
    const inst = await instService.saveDetails(userId, req.body);
    res.json({ success: true, institution: inst });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function submitVerification(req, res) {
  try {
    const userId = req.user.id;
    const inst = await instService.submitVerification(userId);
    res.json({ success: true, institution: inst });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getVerificationStatus(req, res) {
  try {
    const userId = req.user.id;
    const inst = await instService.getVerificationStatus(userId);
    res.json({ success: true, institution: inst });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
