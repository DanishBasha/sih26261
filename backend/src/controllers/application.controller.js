import * as applicationService from '../services/application.service.js';
import { validateApplicationInput } from '../validators/application.validators.js';

export async function list(req, res) {
  const apps = await applicationService.listApplications();
  res.json({ success: true, applications: apps });
}

export async function create(req, res) {
  const err = validateApplicationInput(req.body);
  if (err) return res.status(400).json({ success: false, error: err });

  const app = await applicationService.createApplication(req.body);
  res.status(201).json({ success: true, application: app });
}

export async function getById(req, res) {
  const data = await applicationService.getApplicationById(req.params.id);
  if (!data) return res.status(404).json({ success: false, error: 'Application not found' });
  res.json({ success: true, ...data });
}

export async function submit(req, res) {
  const app = await applicationService.submitApplication(req.params.id);
  res.json({ success: true, application: app });
}
