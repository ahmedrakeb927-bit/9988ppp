# Phase 02 Security Specification (`security_spec.md`)

## 1. Core Data & Authorization Invariants

1. **Exclusive Administrator Identity**:
   - Only the single authorized administrator identity (`a.r.identity007@gmail.com` / Professor Redouane Rakeb, or a UID registered in `/admins/{uid}`) holds administrative privileges.
   - No client can self-register as `role: "admin"` in `/users/{userId}` unless verified as the exclusive administrator.
2. **Strict Student Profile Isolation (PII Protection)**:
   - Students can `get` only their own `/users/{userId}` document (`request.auth.uid == userId`).
   - Students cannot `get` or `list` other students' profiles.
3. **Educational Structure Integrity**:
   - A student profile MUST strictly pair:
     - `educationalLevel == '1bac'` with `branch == 'Sciences'` and `group in ['G1', 'G2', 'G3', 'G4']`, OR
     - `educationalLevel == '2bac'` with `branch == 'Arts and Humanities'` and `group in ['G1', 'G2', 'G3', 'G4']`.
   - Any cross-branch combination (e.g., `1bac` with `Arts and Humanities` or `G5`) is rejected at both the validation layer and Firestore rules layer.
4. **Role & Ownership Immutability (Anti-Privilege Escalation)**:
   - Students updating `/users/{userId}` can ONLY modify `['fullName', 'educationalLevel', 'branch', 'group', 'preferredLanguage', 'notificationPreferences', 'accountStatus', 'updatedAt']`.
   - Fields `uid`, `email`, `role`, `isSelfDeclared`, and `createdAt` are strictly immutable for students.
5. **Published Content Enforcement**:
   - Students can read documents in `/subjects`, `/units`, `/lessons`, `/resources`, `/examinations`, and `/announcements` ONLY when `resource.data.status == 'published'`. Draft, scheduled, and archived items are restricted exclusively to the administrator.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 01 — Student Role Escalation on Registration**:
   `{ uid: "stu_1", role: "admin", educationalLevel: "1bac", branch: "Sciences", group: "G1", ... }` -> `PERMISSION_DENIED`.
2. **Payload 02 — Student Role Escalation on Profile Update**:
   Student updates `/users/stu_1` with `{ role: "admin" }` -> `PERMISSION_DENIED`.
3. **Payload 03 — Invalid Level/Branch Combination**:
   `{ uid: "stu_1", role: "student", educationalLevel: "1bac", branch: "Arts and Humanities", group: "G1", ... }` -> `PERMISSION_DENIED`.
4. **Payload 04 — Invalid Academic Group (`G5`)**:
   `{ uid: "stu_1", role: "student", educationalLevel: "2bac", branch: "Arts and Humanities", group: "G5", ... }` -> `PERMISSION_DENIED`.
5. **Payload 05 — Cross-User Profile Read (PII Leak)**:
   Authenticated student `stu_1` attempts `get(/users/stu_2)` -> `PERMISSION_DENIED`.
6. **Payload 06 — Shadow Field Injection on Profile Update**:
   Student updates `/users/stu_1` with `{ fullName: "Valid Name", isOfficiallyVerified: true }` -> `PERMISSION_DENIED`.
7. **Payload 07 — Falsified Self-Declared Flag**:
   Student creates `/users/stu_1` with `{ isSelfDeclared: false }` -> `PERMISSION_DENIED`.
8. **Payload 08 — Student Modifying `websiteSettings`**:
   Student attempts `update(/websiteSettings/global)` -> `PERMISSION_DENIED`.
9. **Payload 09 — Student Creating an Announcement or Lesson**:
   Student attempts `create(/announcements/ann_1)` -> `PERMISSION_DENIED`.
10. **Payload 10 — Student Reading Unpublished Draft Announcement**:
    Student attempts `get(/announcements/draft_1)` where `status == 'draft'` -> `PERMISSION_DENIED`.
11. **Payload 11 — Forged `createdAt` Timestamp**:
    Student attempts `create(/users/stu_1)` with a past or future `createdAt != request.time` -> `PERMISSION_DENIED`.
12. **Payload 12 — Oversized String Resource Exhaustion (Denial of Wallet)**:
    Student attempts `update(/users/stu_1)` with `fullName` of 5,000 characters (`> 120`) -> `PERMISSION_DENIED`.
