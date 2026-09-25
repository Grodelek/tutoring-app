# Test report

Results below come from commands executed in this workspace on 2026-08-24.

## Backend

Command: `./mvnw test` (from `backend/user-service/app`)

- Tests run: 34
- Failures: 0
- Errors: 0
- Skipped: 0

## JaCoCo

Command: `./mvnw jacoco:report`

- Line coverage: 65.25% (539 / 826)
- Branch coverage: 39.77% (140 / 352)
- Instruction coverage: 59.92% (2548 / 4252)

## Frontend

Command: `npm test` (from `frontend/tutoring-app`)

- Test suites: 1 passed / 1 total
- Tests: 2 passed / 2 total
- Failures: 0

## Scope notes

The backend test profile uses H2. The WebSocket interceptor tests cover missing, malformed and valid JWT CONNECT frames, plus anonymous SUBSCRIBE rejection. The live 100-message latency test was not rerun in this execution because it requires a running backend and configured test accounts; existing artifacts are retained without claiming a new run.
