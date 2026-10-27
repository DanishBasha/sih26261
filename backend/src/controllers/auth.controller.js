export async function getSession(req, res) {
  res.json({
    success: true,
    user: req.user || { role: 'institution', email: 'principal@college.edu' }
  });
}
