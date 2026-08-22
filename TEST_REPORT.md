# Test report

Results below come from commands executed in this workspace (backend: 2026-08-23; frontend: 2026-08-22).

## Backend

Command: `./mvnw test` (from `backend/user-service/app`)

- Tests run: 30
- Failures: 0
- Errors: 0
- Skipped: 0

## JaCoCo

Command: `./mvnw jacoco:report`

- Line coverage: 59.81% (491 / 821)
- Branch coverage: 33.43% (117 / 350)
- Instruction coverage: 53.75% (2277 / 4236)

## Frontend

Command: `npm test` (from `frontend/tutoring-app`)

- Test suites: 1 passed / 1 total
- Tests: 2 passed / 2 total
- Failures: 0

## Scope notes

The backend test profile uses H2. The WebSocket interceptor tests cover missing, malformed and valid JWT CONNECT frames, plus anonymous SUBSCRIBE rejection. The live 100-message latency test was not rerun in this execution because it requires a running backend and configured test accounts; existing artifacts are retained without claiming a new run.
