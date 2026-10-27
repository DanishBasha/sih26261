import * as valService from '../services/validation.service.js';

export async function check(req, res) {
  const result = await valService.validateDocument(req.body);
  res.json({ success: true, ...result });
}
