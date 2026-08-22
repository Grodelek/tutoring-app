# Test report

## Backend

`mvn test` passes locally with the H2 `test` profile: 23 tests, 0 failures, 0 errors. JaCoCo is enabled in `pom.xml`; the latest report shows 47% instruction coverage and 26% branch coverage. Generate it with `mvn jacoco:report` from `backend/user-service/app`.

The test JVM is Java 24 in this workspace. The repository includes test-only Mockito configuration for environments where Byte Buddy inline attachment is unavailable.

## Frontend

Not executed in this workspace because frontend dependencies are not installed (`jest: not found`). Run `npm ci && npm test` from `frontend/tutoring-app`.

## WebSocket and latency

The automated latency script now uses authenticated STOMP `/user/queue/messages`. It requires a running backend and configured test users. No new latency result is claimed unless the script has completed against a live server.
