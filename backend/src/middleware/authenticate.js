import { query } from '../config/supabase.js';

export async function authenticate(req, res, next) {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  if (userId) {
    req.user = {
      id: userId,
      role: userRole || 'institution_user',
      email: userEmail || 'user@example.com'
    };
    return next();
  }

  // Fallback demo user if none supplied
  req.user = {
    id: '22222222-2222-2222-2222-222222222222',
    role: 'institution_user',
    email: 'institution@apex.edu'
  };
  next();
}
