# Test report

## Środowisko

Backend: Java 21, Spring Boot 3.5.0, Maven Wrapper, H2 (profil `test`). Frontend: Expo/React Native 54, TypeScript. System wykonania: Windows.

## Zestawienie

| ID | Typ | Element | Dane | Oczekiwany wynik | Wynik |
|---|---|---|---|---|---|
| UT-01 | unit | UserService | użytkownik z `points=null` | DTO ma 0 punktów | PASS |
| UT-02 | unit | LessonService | cudza lekcja | odmowa zapisu | PASS |
| UT-03 | unit | TutorOfferService | tutor akceptuje własną ofertę | 403/wyjątek | PASS |
| UT-04 | unit | TutorOfferService | status ACCEPTED | brak ponownej zmiany | PASS |
| UT-05 | unit | MessageService | para użytkowników | brak duplikatu rozmowy | PASS |
| SEC-01 | integration | `/api/users/{id}` | brak/uszkodzony JWT | 401 | PASS |
| SEC-02 | integration | `/api/users/{id}` | poprawny JWT | 200 | PASS |
| INT-01 | integration | rejestracja | poprawne dane | 201 | PASS |
| INT-02 | integration | duplikat e-mail | istniejący e-mail | 409 | PASS |
| INT-03 | integration | logowanie | konto utworzone przez API | token | PASS |
| RL-01 | unit | RateLimitFilter | 5 logowań | przepuszczone | PASS |
| RL-02 | unit | RateLimitFilter | 6. logowanie | 429 | PASS |
| RL-03 | unit | RateLimitFilter | inny IP | niezależny limit | PASS |

## Rzeczywisty wynik automatyczny

Polecenie `mvn test` uruchomiono 2026-08-12. Wynik: **21 testów, 21 zaliczonych, 0 niezaliczonych, 0 błędów, 0 pominiętych**, czas 21.344 s. Raport JaCoCo został utworzony.

## JaCoCo

- Line coverage: **53%** — 390 z 739 linii
- Branch coverage: **27%** — 77 z 282 gałęzi
- Instruction coverage: **46%** — 1772 z 3792 instrukcji

Podział: 15 jednostkowych, 2 integracyjne REST/security i 1 test kontekstu Spring (w klasach znajduje się łącznie 21 metod testowych). Nie dodano automatycznego testu WebSocket ani pełnego przepływu REST oferty/wiadomości, ponieważ obecna warstwa HTTP nie sprawdza uczestnictwa w rozmowie ani tożsamości nadawcy; najpierw wymaga to decyzji projektowej i poprawki bezpieczeństwa.

## Wykryte problemy i poprawki

1. **Publiczny dostęp do wszystkich `/api/users/**`.** Przyczyną było `permitAll()` z wildcardem. Zawężono regułę wyłącznie do `add` i `login`; `SEC-01` jest testem regresyjnym.
2. **Możliwość nadpisania cudzej lekcji.** `LessonService.updateLesson` przypisywał bieżącego użytkownika jako właściciela. Dodano kontrolę właściciela i `UT-02`.
3. **Niedozwolone przejścia ofert.** Oferta mogła być zaakceptowana/odrzucona przez tutora lub po zmianie statusu. Operacje ograniczono do studenta i statusu `PENDING`; `UT-03` oraz `UT-04`.
4. **NullPointerException przy profilu z `points=null`.** Mapowanie DTO ma teraz wartość 0; `UT-01`.
5. **Brak JWT zwracał 403 zamiast 401.** Konfiguracja Spring Security nie miała jawnego `AuthenticationEntryPoint`. Dodano `HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)`; `INT-03` oraz pozostałe testy security przechodzą.

## Uruchamianie

```bash
cd backend/user-service/app
./mvnw test
./mvnw jacoco:report
```

Raport coverage po poprawnym przebiegu będzie w `backend/user-service/app/target/site/jacoco/index.html`.

```bash
cd frontend/tutoring-app
npm install
npm test
npm run test:coverage
```

Frontendowy Jest został skonfigurowany, ale nie uruchomiono go: zależności testowe nie są jeszcze zainstalowane w workspace.
