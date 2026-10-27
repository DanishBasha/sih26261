import * as rulesService from '../services/rules.service.js';

export async function getCategories(req, res) {
  const categories = await rulesService.getDistinctCategories();
  res.json({ success: true, categories });
}

export async function getChecklist(req, res) {
  const checklist = await rulesService.getChecklistByCategory(req.params.category);
  res.json({ success: true, count: checklist.length, checklist });
}

export async function list(req, res) {
  const data = await rulesService.listRules(req.query);
  res.json({ success: true, ...data });
}
