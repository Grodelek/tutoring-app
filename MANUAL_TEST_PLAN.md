# Manual test plan

1. Register and log in without an Authorization header.
2. Verify `GET /api/users/{id}` returns 401 without a token and 200 with the owner’s valid JWT.
3. Verify another authenticated user receives 403 when updating or deleting the profile.
4. Create a Lesson as tutor A; verify tutor B cannot update it and the tutor remains A.
5. Send a TutorOffer as a student; verify only the lesson tutor can accept or decline it, and a second transition is rejected.
6. Send a message while supplying a forged `senderId`; verify the persisted/returned sender is the JWT user.
7. Verify non-participants cannot read history, create a conversation between two other users, or delete another user’s message.
8. Connect STOMP with a valid JWT and subscribe to `/user/queue/messages`; verify an unrelated user receives nothing.

Use only test accounts and secrets supplied through environment variables.
