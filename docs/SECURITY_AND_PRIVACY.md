# Security & Privacy Guidelines

1. **Private Credentials:**
   - Groq API keys, Supabase passwords, and Google App Passwords must NEVER be placed in client-side code or committed to version control.
   - All secrets must be loaded exclusively on the backend via `.env`.
   - `.env` is explicitly ignored by `.gitignore`.

2. **Server-Side Authorization:**
   - Client-side role checks (`ProtectedRoute.jsx`) are for UX navigation only; all regulatory actions (approve, raise deficiency, override) are enforced by backend APIs.

3. **Confidential File Privacy:**
   - Uploaded PDF certificates are stored privately.
   - Extracted text snippets in logs are sanitized to avoid leaking sensitive credentials or passwords.

4. **Audit Trail:**
   - Every official review action, approval, deficiency notice, and override captures the actor identity, timestamp, and justification reason.
