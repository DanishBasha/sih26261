# SIH26261 — Email Requirements and Decisions

**Project:** AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification  
**Problem statement:** SIH26261  
**Purpose:** Consolidate the email-related decisions discussed for the project.

> **Scope note:** This document records the email-related decisions currently available from the project discussion. Items marked **Not decided yet** were not settled and must not be treated as implemented requirements.

---

## 1. Decisions already made

### 1.1 Email notifications are required

The system must support both:
- **In-app notifications** in the portal.
- **Email notifications** sent to the relevant recipient.

Email is an additional notification channel; it does not replace the in-app notification centre.

### 1.2 Required decision emails

The system must send automated emails for these application decision outcomes:

1. **Approved**
2. **Approved with anomalies**
3. **Rejected**

The email should correspond to the decision recorded in the system. The application status, decision record, and notification history should remain consistent.

### 1.3 Approved institutions receive account access

When an institution is approved through the applicable approval process, the institution should receive account access according to the project's workflow.

The system must distinguish the institution's approval outcome from the creation of a usable login session. A recipient must still complete the required secure account setup before logging in.

### 1.4 Never email a password

**Do not send a password in an email.**

Instead, send the institution a **secure email link** that allows its authorized representative to create their own password before logging in.

The system must not generate a password and email it to the institution. It must not store or log plaintext passwords.

### 1.5 Approved-with-anomalies decisions require an additional alert

When an application is approved **with anomalies**, the system must alert the higher-level administrators.

This is an additional oversight notification. It is separate from the decision email sent to the institution.

The system should preserve the anomaly details and the authorized decision in its internal records so the alert can be traced to the relevant application and decision. The exact content of that alert has not yet been finalized.

---

## 2. Email workflows

### 2.1 Institution approval and account setup

```text
Authorized decision is recorded
            |
            v
Is the decision "Approved"?
            |
            v
System records the decision and application status
            |
            v
System creates or enables the institution's account-access
workflow according to the approved project rules
            |
            v
System sends an email with a secure account-setup link
            |
            v
Institution representative opens the link
            |
            v
Representative creates their own password
            |
            v
Authentication provider validates the setup process
            |
            v
Representative can sign in, subject to account and
institution status checks
```

The exact technical method for creating/enabling the account has not yet been finalized. The requirement that the representative creates their own password through a secure email link has been decided.

### 2.2 Approved-with-anomalies decision

```text
Authorized official records "Approved with anomalies"
            |
            v
System records the decision and relevant anomaly findings
            |
            +------------------------------+
            |                              |
            v                              v
Email the institution             Alert higher-level
about the decision                administrators
            |                              |
            v                              v
Institution receives              Higher administrators
the decision notification         receive an oversight alert
```

The institution-facing email and administrator alert serve different purposes. The institution receives its decision notification; higher-level administrators are separately alerted because anomalies were approved.

### 2.3 Rejected decision

```text
Authorized official records "Rejected"
            |
            v
System records the decision
and authorized reason/details
            |
            v
System sends a rejection email
to the relevant institution contact
            |
            v
In-app notification is also recorded
```

The exact rejection wording and whether additional review or resubmission is available depend on the approved business rules. Those details have not yet been finalized.

---

## 3. Email and in-app notification events

| Event | Email required from the discussion? | Additional detail |
|---|---|---|
| Application approved | **Yes** | Institution must receive the decision email. |
| Application approved with anomalies | **Yes** | Institution receives a decision email, and higher-level administrators receive an additional alert. |
| Application rejected | **Yes** | Institution receives the rejection email. |
| Institution account setup | **Yes** | Send a secure link so the representative creates their own password. Never email a password. |
| Other application updates | Not fully specified | In-app notifications and email are both part of the planned notification system, but the exact event-by-event email policy remains to be defined. |
| Reminders and escalations | Mentioned conceptually | Exact reminder intervals, recipients, and escalation rules have not been finalized. |

---

## 4. Security requirements for email

1. **Never email passwords.**
2. Use a secure email link for account setup so the recipient creates their own password.
3. Use the authentication provider's supported secure account setup/recovery mechanism rather than implementing an unsafe password-link system from scratch.
4. Do not put passwords, API keys, access tokens, or confidential document contents in email messages.
5. Do not let an email link alone grant an institution regulatory approval. Approval must be recorded by the authorized workflow.
6. After account setup, enforce normal authentication, account-status checks, and server-side authorization.
7. Keep an auditable record of the decision and notification delivery status.
8. The approved-with-anomalies path must alert higher-level administrators in addition to notifying the institution.
9. Do not expose one institution's application information to another institution through email recipients, links, or attachments.
10. Ensure secure links use the configured application domain and the authentication provider's approved redirect URLs.

**Implementation note:** Secure links should be time-limited and handled by the authentication provider where supported. Exact expiry and one-time-use settings have not yet been decided.

---

## 5. Email provider and configuration status

These implementation choices were **not decided yet** in the available discussion:

- Email delivery provider.
- Sender email address and sender display name.
- SMTP host, port, username, and other SMTP configuration, if SMTP is selected.
- Whether to use a transactional email API instead of SMTP.
- Domain verification and email authentication configuration.
- Exact email templates and branding.
- Exact reminder schedule and escalation intervals.
- Delivery retry schedule and maximum retry count.
- Whether OTP verification is required in addition to email links.
- Exact secure-link expiry period.
- Exact retention period for email delivery logs.
- Whether users can change email notification preferences.

Do not invent credentials, a sender address, or provider settings. These should be selected and configured before implementing real email delivery.

---

## 6. Planned backend and database support

The project design already includes these relevant database tables:

- `notifications` — notification records shown in the portal and associated with relevant events.
- `notification_preferences` — planned storage for notification preferences.
- `audit_events` — records important system and workflow actions.
- `decisions` — stores official application decisions.
- `applications` — stores application status and associated institution.
- `processing_jobs` — tracks asynchronous work, where applicable.

The exact email-delivery schema has not yet been finalized. The implementation will likely need to track delivery state, attempts, timestamps, provider message identifiers, and failures, but this is a **proposed implementation detail**, not a previously finalized database design.

Email delivery should not be considered successful merely because a notification row was created. The system should distinguish between a notification being created and an email provider accepting or failing the send request.

---

## 7. Proposed event-to-recipient map

| Trigger | Recipient | Channel | Status |
|---|---|---|---|
| Application approved | Relevant institution contact | Email; in-app notification is part of the planned notification system | Required |
| Application approved with anomalies | Relevant institution contact | Email; in-app notification is part of the planned notification system | Required |
| Application approved with anomalies | Higher-level administrators | Additional alert; delivery channel must be finalized | Alert required; exact channel not finalized |
| Application rejected | Relevant institution contact | Email; in-app notification is part of the planned notification system | Required |
| Institution is ready for account setup after the applicable approval | Authorized institution representative | Secure account-setup email link | Required |
| Password recovery is requested | Account holder | Secure recovery email flow | Included in the login/signup specification; implementation must use the authentication provider's secure flow |

---

## 8. Items to decide before production implementation

- [ ] Select the transactional email provider.
- [ ] Configure and verify the sending domain and sender address.
- [ ] Decide whether administrator anomaly alerts are delivered by email, in-app notification, or both.
- [ ] Approve the institution approval email template.
- [ ] Approve the institution approval-with-anomalies email template.
- [ ] Approve the rejection email template and define what reason/details may be included.
- [ ] Approve the secure account-setup email template.
- [ ] Decide the account-setup link expiry and resend behavior.
- [ ] Decide retry and failure-alert rules for email delivery.
- [ ] Define reminder timing and escalation recipients.
- [ ] Define how email delivery status is stored and audited.
- [ ] Test that no password, secret, token, or confidential document content is included in email messages.
- [ ] Test that anomaly approvals alert the higher-level administrators.
- [ ] Test that account setup requires the recipient to create their own password.
- [ ] Test all three decision emails: approved, approved with anomalies, and rejected.

---

## 9. Final agreed behavior

```text
APPROVED
  -> Record decision
  -> Send institution decision email
  -> Provide secure account-setup link when account access is enabled
  -> Representative creates their own password
  -> Representative signs in subject to authorization checks

APPROVED WITH ANOMALIES
  -> Record decision and anomalies
  -> Send institution decision email
  -> Alert higher-level administrators
  -> Keep the decision and alert traceable in internal records

REJECTED
  -> Record decision and authorized reason/details
  -> Send institution rejection email
  -> Record the notification in the system

FOR ALL EMAILS
  -> Never email a password
  -> Do not expose secrets or confidential documents
  -> Track notification/delivery state
  -> Keep authorization and regulatory decisions inside the application workflow
```

**Bottom line:** The decisions already made are that email notifications are required, automated emails must be sent for **approved**, **approved with anomalies**, and **rejected** decisions, approved institutions receive account access through a secure setup flow, passwords are never emailed, and anomaly approvals must alert higher-level administrators. The provider, sender address, exact templates, reminder schedule, and delivery configuration still need to be chosen.
