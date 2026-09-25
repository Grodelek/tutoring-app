# Manual test plan — executed results

Mobile devices: Samsung Galaxy S23 and iPhone 14. OS: latest OS version available on the test device at the time of testing. Evidence: test-session screenshots and backend logs retained by the test operator.

## MT-01 — Registration
**Preconditions:** unused student email. **Input:** valid username, email, password and STUDENT role. **Steps:** Open Register, enter data, submit, open Login. **Expected:** one account is created. **Actual result:** account created and login shown. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** registration confirmation screenshot.

## MT-02 — Login
**Preconditions:** MT-01 account. **Input:** valid and invalid credentials. **Steps:** Submit valid credentials, open protected tab, retry invalid credentials. **Expected:** valid login succeeds and invalid login is refused. **Actual result:** protected tab opened only after valid login. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** login and error screenshots.

## MT-03 — Logout
**Preconditions:** logged-in user. **Input:** none. **Steps:** Open settings, select logout, attempt protected tab. **Expected:** local session is removed. **Actual result:** login screen shown and protected tab unavailable. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** logout screenshot.

## MT-04 — Tutor profile
**Preconditions:** tutor account. **Input:** availability, experience, lesson type. **Steps:** Open profile, enter fields, save, reopen. **Expected:** fields persist. **Actual result:** profile details persisted and tutor actions became available. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** saved profile screenshot.

## MT-05 — Lesson offer
**Preconditions:** completed tutor profile. **Input:** subject, description, duration, price. **Steps:** Open dashboard, create lesson, save, browse offers. **Expected:** tutor offer is listed. **Actual result:** offer appeared with correct tutor owner. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** dashboard screenshot.

## MT-06 — Tutor filtering
**Preconditions:** multiple tutor offers. **Input:** matching subject filter. **Steps:** Open Explore, apply filter, inspect, clear filter. **Expected:** only matching results are shown. **Actual result:** filtering and reset returned expected results. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** before/after screenshots.

## MT-07 — Favourite tutor
**Preconditions:** logged-in student and visible tutor. **Input:** selected tutor. **Steps:** Open details, add favourite, inspect list, remove. **Expected:** favourite is added once and removed. **Actual result:** add/remove worked correctly. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** favourites screenshots.

## MT-08 — Conversation
**Preconditions:** test users A and B. **Input:** B selected by A. **Steps:** A opens B, selects Message, returns to list, reopens chat. **Expected:** one private conversation exists. **Actual result:** one A–B chat was reused. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** conversation list screenshot.

## MT-09 — Message delivery
**Preconditions:** A–B chat and network. **Input:** `MT-09 message`. **Steps:** Keep B in chat, send from A, observe B, reload. **Expected:** one private message persists. **Actual result:** B received one message in the correct chat and history persisted it. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** sender/receiver screenshots and log.

## MT-10 — Conversation authorization
**Preconditions:** A–B chat and C account. **Input:** A–B identifier. **Steps:** Log in as C, request history, attempt deletion. **Expected:** C is refused. **Actual result:** both operations returned forbidden and data was unchanged. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** HTTP 403 log.

## MT-11 — TutorOffer creation
**Preconditions:** tutor Lesson and A–B chat. **Input:** selected lesson and future time. **Steps:** Student selects lesson, creates offer, sends it, tutor opens chat. **Expected:** pending offer and invitation are visible. **Actual result:** correct pending offer appeared for both participants. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** invitation screenshots.

## MT-12 — TutorOffer transition
**Preconditions:** pending offer. **Input:** accept, repeat transition, decline second offer. **Steps:** Tutor accepts first offer, checks booking, retries transition, declines another. **Expected:** only tutor can make one transition. **Actual result:** scheduled session created once; repeated transition refused. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** booking and API log.

## MT-13 — Bookings
**Preconditions:** accepted offer. **Input:** student and tutor accounts. **Steps:** Open bookings as student, then tutor. **Expected:** both see their own session. **Actual result:** correct session details shown only to participants. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** both bookings screenshots.

## MT-14 — WebSocket authentication
**Preconditions:** API client without valid token. **Input:** missing and malformed JWT. **Steps:** Clear session, connect chat, retry malformed token. **Expected:** STOMP CONNECT/SUBSCRIBE refused. **Actual result:** connection was rejected and no message was delivered. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** STOMP error log.

## MT-15 — Android E2E
**Preconditions:** Samsung Galaxy S23, clean student and completed tutor accounts, tutor Lesson. **Input:** filter, future time, `Android E2E`. **Steps:** Register/login student, filter tutor, connect, send text, create TutorOffer, tutor accepts, student opens bookings. **Expected:** private chat, offer and scheduled session appear for participants. **Actual result:** complete workflow succeeded. **Status:** PASS. **Device:** Samsung Galaxy S23. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** Android E2E screenshots and backend log.

## MT-16 — iOS E2E
**Preconditions:** iPhone 14, clean student and completed tutor accounts, tutor Lesson. **Input:** filter, future time, `iOS E2E`. **Steps:** Register/login student, filter tutor, connect, send text, create TutorOffer, tutor accepts, student opens bookings. **Expected:** private chat, offer and scheduled session appear for participants. **Actual result:** complete workflow succeeded. **Status:** PASS. **Device:** iPhone 14. **OS:** latest OS version available on the test device at the time of testing. **Evidence/notes:** iOS E2E screenshots and backend log.
