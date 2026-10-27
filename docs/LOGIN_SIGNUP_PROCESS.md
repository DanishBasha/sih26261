# SIH26261 — Login and Signup Process (Complete Functional Specification)

**Project:** AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification  
**Problem statement:** SIH26261  
**Document purpose:** Define exactly how signup, login, account verification, institution verification, role access, password recovery, and account status should work.

> **Important scope note:** This document defines the proposed software workflow for the SIH26261 project. It is not an official AICTE account-registration policy. Real institution-verification requirements and identity checks must be confirmed with the project mentor and applicable AICTE procedures before production use.

---

# 1. The three user roles

The application has three main portal roles.

```text
SIH26261 PORTAL
│
├── 1. Institution User
│   ├── Registers an institution portal account
│   ├── Verifies email
│   ├── Submits institution details for verification
│   ├── Completes profile after verification
│   ├── Creates and submits applications
│   ├── Uploads required documents
│   ├── Views validation findings and deficiencies
│   └── Tracks application status and notifications
│
├── 2. Official / Reviewer
│   ├── Does NOT get unrestricted public signup
│   ├── Account is created or invited by an authorized administrator
│   ├── Signs in and verifies account
│   ├── Reviews assigned applications
│   ├── Checks documents and rule-linked findings
│   ├── Raises deficiencies / requests clarification
│   └── Records authorized review actions and decisions
│
└── 3. Administrator / Oversight User
    ├── Does NOT get unrestricted public signup
    ├── Account is provisioned through a controlled process
    ├── Signs in with stronger security
    ├── Manages approved user access and roles
    ├── Oversees rule versions, processing jobs, and audit logs
    └── Does not automatically gain every regulatory decision power
```

## Critical rule

**A person must never be able to select “Administrator” or “Official” on a public signup form and grant that role to themselves.**

Public signup is for an institution representative only. Official and administrator accounts must be provisioned by an authorized process. All role checks must be enforced by the backend, not just by hiding frontend pages.

---

# 2. Website entry page

When anyone opens the website, show a public landing page.

```text
SIH26261
AI-Powered Application Validation and Regulatory Compliance

[ Home ] [ How It Works ] [ Help ]

             Welcome to SIH26261

 Review application requirements.
 Submit supporting documents.
 Track validation findings and official review.

 [ Institution Login ]  [ Register Institution ]

For authorized officials: [ Official Login ]
For administrators: access through the authorized login route.
```

The public landing page must not display private application information or document contents.

## Buttons and their behavior

- **Institution Login** opens the institution login page.
- **Register Institution** opens the institution signup process.
- **Official Login** opens the same secure authentication system, but only accounts with an authorized official role can enter the official portal.
- **Administrator access** is not a public role-selection option. An administrator can use the secure login route if the project chooses to expose one, but the role must already be assigned securely.

---

# 3. Institution signup — step by step

The institution signup process creates a user account for a representative. It does not automatically mean that the institution is verified or approved by AICTE.

## Step 1 — Open the registration page

The user clicks **Register Institution**.

Show this heading:

```text
Register an Institution Account

Create an account for an institution representative.
Email verification and institution verification may be required
before application submission is enabled.

[ Continue ]
[ Already registered? Login ]
```

Do not ask the user to choose an official or administrator role.

## Step 2 — Enter the representative's account details

Required fields:

```text
Full Name                 [________________________]
Official Work Email       [________________________]
Mobile Number             [________________________]
Password                  [________________________]
Confirm Password          [________________________]

[ ] I agree to the Terms of Use and Privacy Notice.

[ Create Account ]
```

### Field rules

- **Full name:** required; trim leading/trailing whitespace.
- **Official work email:** required; validate format and normalize case for comparison.
- **Mobile number:** required only if the project's approved policy uses it; validate format.
- **Password:** follow the authentication provider's current password rules. Do not store plaintext passwords.
- **Confirm password:** must match the password; do not store this field.
- **Terms checkbox:** must be selected before registration.
- Do not ask for or collect unnecessary personal information.

The server must validate the submitted fields again. Frontend validation alone is not sufficient.

## Step 3 — Create an unverified account

When the user clicks **Create Account**:

1. Validate all fields on the server.
2. Check whether the email is already registered.
3. Create the authentication account using the selected authentication provider, such as Supabase Auth.
4. Assign no privileged role from user input.
5. Set the initial role to `institution_user` through trusted server-side logic or a secure database trigger.
6. Set email verification status to pending.
7. Create the user's profile record.
8. Record an audit event for account registration.
9. Send an email verification link or OTP through the authentication provider.
10. Show the email verification screen.

Never accept `role: "admin"` or `role: "official"` from a signup request as a trusted role assignment.

## Step 4 — Verify email

Show:

```text
Verify Your Email

We sent a verification link or code to:
u***@institution-domain.example

[ Enter verification code ]   (if OTP is enabled)
[ Verify Email ]

[ Resend verification email ]
[ Change email address ]
```

The masked email above is an example, not a real address.

Behavior:

1. The user opens the verification link or enters the code.
2. The authentication provider validates it.
3. If valid, mark the email as verified.
4. If invalid or expired, display a clear error and allow a safe retry.
5. Apply rate limits to repeated code requests and verification attempts.
6. Do not reveal whether another person's email is registered through overly specific public error messages.

**Email verification is not institution verification.** It only confirms control of the email address.

## Step 5 — Enter institution details

After email verification, direct the user to an institution profile form.

```text
Institution Details

Institution Legal Name        [________________________]
Institution Type              [ Select type             ]
AICTE Permanent ID / ID        [________________________] (if applicable)
State                         [ Select state            ]
District                      [________________________]
Official Institution Email    [________________________]
Institution Website           [________________________] (optional)
Authorized Representative Role[________________________]
Official Contact Number       [________________________]

[ Save and Continue ]
```

### Important design rules

- Only collect fields that are relevant to the selected application category and approved verification process.
- Do not assume every institution has the same identifier or supporting records.
- If a unique official institution identifier is applicable, validate its format and use it to detect duplicate institution records.
- If the identifier is not applicable, provide the approved alternative verification route.
- Do not mark an institution verified merely because the user typed an institution name or identifier.
- Institution details should be checked against an approved source or reviewed by authorized staff.

## Step 6 — Submit institution verification

The user reviews the entered information and selects:

```text
[ Submit Institution Details for Verification ]
```

The system then:

1. Validates required institution fields.
2. Checks for possible duplicate institution records.
3. Saves the institution record with a pending verification status.
4. Records the submission time and submitting account.
5. Creates a verification task for authorized staff if manual review is required.
6. Sends an in-app or email confirmation.
7. Displays the current verification status.

Suggested institution verification statuses:

```text
draft
  ↓
pending_verification
  ├──→ verified
  ├──→ additional_information_required
  └──→ rejected_with_reason
```

A user may correct information and resubmit if the process allows it. Every verification action must be recorded in the audit history.

## Step 7 — What can the institution user access before verification?

Before email verification:
- The user cannot access protected portal features.
- The user can request a new verification email or restart a valid recovery flow.

After email verification but before institution verification:
- The user can sign in.
- The user can view and update permitted institution profile fields.
- The user can view the verification status and respond to requests for additional information.
- The user cannot submit a regulatory application unless the approved business policy explicitly allows a limited draft workflow.
- The UI must clearly explain which actions are blocked and why.

After institution verification:
- The user can access the institution dashboard.
- The user can create applications for that institution, subject to assigned permissions.
- The system loads the correct checklist for the selected application category and applicable approved rules.
- The user can upload documents, submit applications, respond to deficiencies, and track progress.

Institution verification only verifies portal/institution identity for the system. It is not an AICTE regulatory approval or approval of an application.

---

# 4. Institution login — step by step

## Step 1 — Open login page

```text
Institution Login

Email Address      [________________________]
Password           [________________________]

[ Sign In ]

[ Forgot Password? ]
[ Register Institution ]
```

Do not include a role dropdown that lets users choose which role they want to become.

## Step 2 — Authenticate credentials

When **Sign In** is clicked:

1. Validate the request format.
2. Send credentials to the authentication provider securely over HTTPS.
3. Verify the credentials.
4. Apply rate limits and protection against repeated failed attempts.
5. Return a generic login error for invalid credentials.
6. Never log passwords, access tokens, or verification codes.
7. Establish the authenticated session using the authentication provider's supported secure flow.

If the authentication provider returns an error, show a safe, understandable message without exposing internal details.

## Step 3 — Check email verification

After successful credential authentication:

- If the email is not verified, show the email verification screen and provide a safe resend option.
- Do not treat successful password authentication as email verification.

## Step 4 — Check account and institution status

After authentication, the backend loads the trusted user profile and checks permissions and account status.

Suggested routing:

```text
User signs in
    ↓
Authentication succeeds?
    ├── No → Show login error
    └── Yes
          ↓
Email verified?
    ├── No → Email verification page
    └── Yes
          ↓
Account active?
    ├── No → Restricted-access page with safe explanation
    └── Yes
          ↓
Institution profile complete?
    ├── No → Complete institution profile
    └── Yes
          ↓
Institution verified?
    ├── No → Institution verification status page
    └── Yes → Institution dashboard
```

If the account is suspended, disabled, or locked, do not grant access to protected operations. Provide the approved recovery/support route.

## Step 5 — Institution dashboard

After all required checks pass, show:

```text
Institution Dashboard

Institution: [Verified Institution Name]
Verification: Verified

[ Create Application ]

My Applications
- Draft
- Submitted
- Processing
- Review Required
- Deficiency Raised
- Decision Recorded

[ Required Actions ]
[ Notifications ]
[ Institution Profile ]
[ Sign Out ]
```

The dashboard must only show applications belonging to the institution(s) the user is authorized to access.

---

# 5. Official / reviewer account creation and login

## No open official signup

A public visitor must not be able to create an official account simply by choosing “Official” in a signup form.

## Proposed official provisioning process

1. An authorized administrator starts the staff account creation process.
2. The administrator enters the official's approved work email and required staff details.
3. The system records who initiated the invitation and why.
4. The system sends a time-limited invitation link through the authentication provider.
5. The official verifies the email and completes account setup.
6. The official is assigned the least-privilege role approved for their duties.
7. If required by policy, a second authorized person approves the role assignment.
8. The official signs in through the secure login page.
9. The backend checks the trusted role, account status, and application assignment permissions.
10. The official is directed to the reviewer dashboard only if authorized.

### Official login screen

```text
Official / Reviewer Login

Work Email        [________________________]
Password          [________________________]

[ Sign In ]
[ Forgot Password? ]
```

### Official dashboard

```text
Reviewer Dashboard

[ Assigned Applications ]
[ Pending Reviews ]
[ Overdue Reviews ]
[ Resubmissions ]
[ Deficiencies ]
[ Notifications ]
[ Review History ]
```

A reviewer can only access records and actions allowed by their permissions. An oversight role does not automatically permit final regulatory decisions or unrestricted access to every document.

---

# 6. Administrator account creation and login

## No public administrator signup

Never create an administrator account from a public signup form. Do not use a secret URL alone as the security mechanism.

## Proposed provisioning process

1. A designated authorized operator provisions the first administrator through a controlled setup process.
2. The initial setup process is disabled or locked after successful provisioning.
3. Additional administrators are created through an audited, authorized workflow.
4. Administrator identity and role are verified according to the project's approved security policy.
5. Require multi-factor authentication (MFA) for privileged accounts where supported and configured.
6. Log administrator invitations, role changes, suspensions, and privileged actions.
7. Use the least privilege necessary; separate oversight and decision-making permissions where appropriate.

### Administrator login

```text
Authorized Administrator Login

Work Email        [________________________]
Password          [________________________]

[ Sign In ]
[ Forgot Password? ]

[MFA challenge appears if configured]
```

After authentication, the backend verifies that the user has an active administrator role before returning administrator-only data.

### Administrator dashboard

```text
Administration / Oversight Dashboard

[ User and Role Management ]
[ Institution Verification Queue ]
[ Rule Management ]
[ Rule Change Requests ]
[ Processing Job Monitor ]
[ Notification Delivery Monitor ]
[ Audit Logs ]
[ System Health ]
```

Role assignment and sensitive configuration changes must create audit records.

---

# 7. Forgot password and account recovery

The login page includes **Forgot Password?**

## Password recovery flow

```text
Login page
   ↓
User selects "Forgot Password?"
   ↓
Enters email address
   ↓
System sends recovery instructions if the account is eligible
   ↓
User opens the secure, time-limited recovery link
   ↓
Authentication provider validates the link
   ↓
User sets a new password
   ↓
System confirms completion
   ↓
User signs in again
```

### Recovery form

```text
Reset Password

Email Address     [________________________]

[ Send Recovery Link ]
```

After opening the link:

```text
Create a New Password

New Password          [________________________]
Confirm New Password  [________________________]

[ Update Password ]
```

Security requirements:

- Recovery links must be time-limited and single-use where supported.
- Apply rate limits.
- Use generic public messages to reduce account enumeration.
- Never email the existing password.
- Never store plaintext passwords.
- Consider revoking existing sessions after a password reset, according to the chosen authentication provider's capabilities and policy.
- Send a notification after a successful password reset.
- Do not automatically change an account's role or institution verification status during password recovery.

---

# 8. Sign out and session expiration

When a user selects **Sign Out**:

1. Call the authentication provider's sign-out function.
2. Clear client-side session state using the supported authentication SDK.
3. Remove protected page data from the active UI.
4. Redirect to the public landing or login page.
5. Ensure protected API requests fail after the session expires or is revoked.
6. Do not rely on frontend redirects alone for security.

When a session expires:
- Ask the user to sign in again.
- Preserve only safe, non-sensitive draft input if explicitly supported.
- Never keep showing private application data after authentication is no longer valid.

---

# 9. Account status is different from regulatory status

These statuses must not be mixed together.

## User account status

```text
invited
pending_email_verification
active
suspended
disabled
```

## Institution verification status

```text
draft
pending_verification
additional_information_required
verified
rejected_with_reason
```

## Application status

```text
draft
submitted
queued
processing
review_required
under_official_review
deficiency_raised
resubmitted
processing_failed
decision_recorded
withdrawn
```

The exact enum values should be aligned with the database schema and backend implementation. Do not create different spellings in the frontend, backend, and database.

**Important:** A cancelled institution or institution whose regulatory approval has expired should not automatically lose its historical portal records. Account access, institution verification, and regulatory approval status are separate concepts. Any access restriction must follow an explicit, audited policy.

---

# 10. Suggested database relationships

The authentication provider manages credentials and authentication sessions. The application database stores the profile and business data.

```text
Authentication Provider User
        │
        │ user_id
        ▼
user_profiles
        │
        ├── role
        ├── account_status
        └── display/profile details
                 │
                 ▼
             institutions
                 │
                 ├── institution verification status
                 ├── institution identifiers
                 └── verified institution details
                          │
                          ▼
                      applications
                          │
                          ├── application_documents
                          ├── application_checklist_items
                          ├── validation_findings
                          ├── deficiencies
                          ├── review_actions
                          ├── decisions
                          └── notifications
```

## Required data and permission principles

- Use the authentication provider's immutable user ID as the identity link.
- Never store a plaintext password in `user_profiles`.
- Never let a user update their own `role`, account status, or institution verification status through ordinary profile editing.
- Institution users must only access their own institution and authorized applications.
- Officials must only perform actions granted to their role and assignments.
- Administrator permissions must be checked on the server.
- Record changes to roles, institution verification, and account status in `audit_events`.
- Use database constraints and policies as defense in depth, not as a substitute for backend authorization.

---

# 11. Suggested API endpoint map

These are proposed endpoint names. Implement and test them before treating them as available.

## Authentication and profile

```text
GET    /api/health
GET    /api/auth/me
PATCH  /api/auth/profile
POST   /api/auth/resend-verification
POST   /api/auth/request-password-reset
POST   /api/auth/logout
```

Signup, email confirmation, sign-in, and password reset may be handled directly by the Supabase Auth client when appropriate. If they are proxied through the backend, follow the provider's documented secure flow. Do not build a custom password system unnecessarily.

## Institution registration and verification

```text
POST   /api/institutions
GET    /api/institutions/me
PATCH  /api/institutions/me
POST   /api/institutions/me/submit-verification
GET    /api/institutions/me/verification-status
POST   /api/institutions/me/verification-response
```

## Authorized verification administration

```text
GET    /api/admin/institution-verifications
GET    /api/admin/institution-verifications/:id
POST   /api/admin/institution-verifications/:id/approve
POST   /api/admin/institution-verifications/:id/request-information
POST   /api/admin/institution-verifications/:id/reject
```

These endpoints must require appropriate permissions and capture reviewer identity, timestamp, and reason.

## Official account provisioning

```text
POST   /api/admin/users/invite-official
POST   /api/admin/users/invite-administrator
PATCH  /api/admin/users/:id/role
PATCH  /api/admin/users/:id/status
```

These routes must be administrator-only or require the specific privileged permission. They must not be accessible to public signup users.

---

# 12. Authentication and authorization rules

1. Use HTTPS in deployed environments.
2. Use a trusted authentication provider such as Supabase Auth rather than storing passwords yourself.
3. Verify authentication tokens on protected backend endpoints.
4. Load the user's role from trusted server-side data.
5. Do not trust a role supplied in request JSON, query parameters, or browser state.
6. Use server-side authorization for every protected operation.
7. Restrict institution users to their own institution and applications.
8. Restrict officials to assigned work and authorized review actions.
9. Restrict administrator operations by specific permissions.
10. Keep service-role credentials and Groq API keys on the server.
11. Use private storage and short-lived signed URLs for documents.
12. Rate-limit login, signup, verification resend, and recovery endpoints.
13. Record security-relevant events without logging passwords, recovery tokens, or sensitive document contents.
14. Configure email redirect URLs to approved domains in the authentication provider.
15. Test that changing a frontend route or manually calling an API cannot bypass authorization.

---

# 13. Required test cases for login and signup

## Institution signup

- [ ] Valid registration creates an unverified institution-user account.
- [ ] Invalid email is rejected.
- [ ] Missing required fields are rejected.
- [ ] Password confirmation mismatch is rejected.
- [ ] Terms acceptance is required.
- [ ] Public signup cannot create an official or administrator.
- [ ] Verification email/link is sent.
- [ ] Expired or invalid verification link is handled safely.
- [ ] Repeated resend requests are rate-limited.
- [ ] Duplicate institution identifiers are flagged for review.
- [ ] Email verification does not automatically verify the institution.

## Institution login

- [ ] Valid verified user can sign in.
- [ ] Invalid credentials return a safe error.
- [ ] Unverified email is sent to verification flow.
- [ ] Pending institution verification shows the status page.
- [ ] Verified institution user reaches the institution dashboard.
- [ ] Suspended/disabled account cannot access protected operations.
- [ ] Institution user cannot read another institution's application.
- [ ] Session expiry prevents access to protected APIs.

## Official and administrator access

- [ ] Public user cannot self-assign official/admin roles.
- [ ] Only authorized administrators can invite privileged users.
- [ ] Invitation expiry is handled safely.
- [ ] Official can access only permitted review tasks.
- [ ] Administrator actions require the correct permission.
- [ ] Role changes are audited.
- [ ] MFA is enforced for privileged users if configured as required.

## Password recovery and sign-out

- [ ] Recovery request displays a safe response.
- [ ] Valid recovery link permits password reset.
- [ ] Invalid or expired recovery link is rejected.
- [ ] Old password no longer works after a successful reset.
- [ ] Sign-out clears the active session.
- [ ] Protected API calls fail after sign-out or session expiry.

---

# 14. Recommended implementation sequence

Build and verify the login process in this order:

1. Create the Supabase project and configure authentication providers.
2. Configure allowed redirect URLs for local development and deployment.
3. Create `user_profiles` and institution verification fields/tables required by the approved schema.
4. Implement trusted role assignment and safe profile policies.
5. Build institution signup and email verification.
6. Build institution login and session handling.
7. Build institution details form and verification status page.
8. Build the authorized institution verification queue for staff.
9. Build invitation-based official account provisioning.
10. Build administrator provisioning with additional safeguards.
11. Implement password recovery and sign-out.
12. Protect backend routes with authentication and role authorization.
13. Test every role and every status transition.
14. Only then connect login to application creation and document upload.

---

# 15. Final behavior summary

```text
PUBLIC VISITOR
    │
    ├── Register Institution
    │       ↓
    │   Create institution-user account
    │       ↓
    │   Verify email
    │       ↓
    │   Submit institution details
    │       ↓
    │   Institution verification
    │       ↓
    │   Institution dashboard (after required checks)
    │
    ├── Institution Login
    │       ↓
    │   Authenticate + verify account status
    │       ↓
    │   Institution dashboard or appropriate status page
    │
    └── Official/Admin Login
            ↓
        Authenticate
            ↓
        Check trusted, pre-assigned role and permissions
            ↓
        Authorized reviewer/admin dashboard only
```

**Final rule:** Account creation is not institution verification; institution verification is not regulatory approval; successful login is not permission to access every record. Each step must be independently checked and audited.
