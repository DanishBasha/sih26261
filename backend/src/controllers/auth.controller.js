import * as authService from '../services/auth.service.js';

export async function register(req, res) {
  try {
    const user = await authService.registerInstitutionUser(req.body);
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function verifyEmail(req, res) {
  try {
    const result = await authService.verifyEmail(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function resendVerification(req, res) {
  try {
    const result = await authService.resendVerification(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function login(req, res) {
  try {
    const user = await authService.login(req.body);
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
}

export async function getSession(req, res) {
  res.json({ success: true, user: req.user });
}

export async function requestPasswordReset(req, res) {
  try {
    const result = await authService.requestPasswordReset(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const result = await authService.resetPassword(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
