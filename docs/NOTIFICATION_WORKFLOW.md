# Notification Workflow

## 1. Supported Notification Channels
1. **In-App Alerts:** Displayed in the institution and reviewer dashboards.
2. **Email Delivery:** Powered by Gmail SMTP (via Nodemailer) with Google App Passwords.

## 2. Trigger Events
- **Application Initiated:** Sends confirmation email with Application Number to institution.
- **Application Submitted:** Sends formal submission acknowledgement.
- **Deficiency Raised:** Immediate high-priority email alert highlighting the specific AICTE handbook clause and required rectification.
- **Decision Recorded / Approved:** Congratulatory approval certificate email.

## 3. Privacy & Delivery Rules
- Emails must NEVER include plain-text passwords or full confidential document contents.
- Delivery attempts, message IDs, and failure reasons are logged to `public.notification_logs`.
