# Manual test plan

For every case fill in: **Actual result:** ______; **Status (PASS/FAIL):** ______; **Device:** ______; **OS version:** ______; **Evidence/notes:** ______. Use test accounts only.

## MT-01 — Registration
**Goal:** create a student account. **Preconditions:** unused email. **Input:** username, unique email, valid password, STUDENT. **Steps:** 1. Open Register. 2. Enter data. 3. Submit. 4. Open Login. **Expected:** account is created once and login is available. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-02 — Login
**Goal:** authenticate a user. **Preconditions:** MT-01 account exists. **Input:** valid then invalid credentials. **Steps:** 1. Open Login. 2. Submit valid data. 3. Open a protected tab. 4. Log out/retry with invalid data. **Expected:** valid login permits protected data; invalid login is refused. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-03 — Logout
**Goal:** remove local session. **Preconditions:** logged in. **Input:** none. **Steps:** 1. Open settings. 2. Select logout. 3. Try a protected tab. **Expected:** login screen is shown and protected content is unavailable. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-04 — Tutor profile
**Goal:** complete tutor profile. **Preconditions:** tutor account. **Input:** availability, experience, lesson type. **Steps:** 1. Open profile. 2. Enter fields. 3. Save. 4. Reopen profile. **Expected:** values persist and tutor actions are available. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-05 — Lesson offer
**Goal:** publish tutor offer. **Preconditions:** completed tutor profile. **Input:** subject, description, duration, price. **Steps:** 1. Open dashboard. 2. Create lesson. 3. Enter data. 4. Save. 5. Browse offers. **Expected:** offer appears with current tutor as owner. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-06 — Tutor filtering
**Goal:** filter discovery. **Preconditions:** two distinct offers. **Input:** subject filter. **Steps:** 1. Open Explore. 2. Apply filter. 3. Check results. 4. Clear it. **Expected:** matching tutors appear; clearing restores list. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-07 — Favourite tutor
**Goal:** save/remove favourite. **Preconditions:** student logged in, tutor visible. **Input:** selected tutor. **Steps:** 1. Open details. 2. Add favourite. 3. Check favourites. 4. Remove it. **Expected:** tutor is added once and removal works. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-08 — Conversation
**Goal:** create a private chat. **Preconditions:** users A and B. **Input:** B selected by A. **Steps:** 1. A opens B. 2. Select Message. 3. Return to conversations. 4. Reopen. **Expected:** a single A–B conversation exists. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-09 — Message delivery
**Goal:** deliver private realtime text. **Preconditions:** A–B chat; network. **Input:** `MT-09 message`. **Steps:** 1. Keep B in chat. 2. A sends text. 3. Observe B. 4. Reload B chat. **Expected:** B receives exactly one message in that conversation and history retains it. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-10 — Conversation authorization
**Goal:** deny C access to A–B. **Preconditions:** existing A–B chat; C account. **Input:** A–B conversation/message identifier. **Steps:** 1. Log in as C. 2. Request A–B history. 3. Attempt delete of A message. **Expected:** requests are forbidden and data is unchanged. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-11 — TutorOffer creation
**Goal:** propose a session. **Preconditions:** lesson and A–B chat. **Input:** lesson and future time. **Steps:** 1. Select lesson. 2. Create offer. 3. Send. 4. Check recipient chat/bookings. **Expected:** one pending offer and invitation are visible to participants. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-12 — TutorOffer transition
**Goal:** authorize and limit offer transitions. **Preconditions:** pending offer. **Input:** Accept then second transition; a separate Decline. **Steps:** 1. Log in as tutor. 2. Accept. 3. View booking. 4. Retry transition. 5. Decline new pending offer. **Expected:** only tutor acts; acceptance creates scheduled session; repeated transition fails. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-13 — Bookings
**Goal:** show role-specific sessions. **Preconditions:** accepted offer. **Input:** student and tutor accounts. **Steps:** 1. Open bookings as student. 2. Note session. 3. Log in as tutor. 4. Open bookings. **Expected:** both see their own correct session only. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-14 — WebSocket authentication
**Goal:** reject anonymous chat. **Preconditions:** API test client/app without token. **Input:** missing then malformed JWT. **Steps:** 1. Clear session. 2. Attempt chat connection. 3. Repeat malformed token. **Expected:** CONNECT/SUBSCRIBE is refused and no private message arrives. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-15 — Android E2E
**Goal:** verify Android full flow. **Preconditions:** Android device/emulator, clean student and completed tutor accounts, tutor lesson. **Input:** matching filter, future time, `Android E2E`. **Steps:** 1. Register/log in as student. 2. Filter tutors. 3. Connect. 4. Send text. 5. Create TutorOffer. 6. Log in as tutor and accept. 7. Return as student and view bookings. **Expected:** intended participants see chat, offer and scheduled session only. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.

## MT-16 — iOS E2E
**Goal:** verify iOS full flow. **Preconditions:** iOS device/simulator, clean student and completed tutor accounts, tutor lesson. **Input:** matching filter, future time, `iOS E2E`. **Steps:** 1. Register/log in as student. 2. Filter tutors. 3. Connect. 4. Send text. 5. Create TutorOffer. 6. Log in as tutor and accept. 7. Return as student and view bookings. **Expected:** intended participants see private chat and scheduled session only. Actual result: ______; Status (PASS/FAIL): ______; Device: ______; OS version: ______; Evidence/notes: ______.
