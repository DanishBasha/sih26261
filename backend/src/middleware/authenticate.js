// Mock session/token authentication for local and demo use
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  // Support header or query or default to authorized role
  req.user = {
    id: req.headers['x-user-id'] || 'user-default-1',
    role: req.headers['x-user-role'] || 'institution',
    email: req.headers['x-user-email'] || 'principal@college.edu'
  };
  next();
}
