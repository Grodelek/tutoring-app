# Środowisko manualnych testów

Dokument opisuje środowisko przeznaczone do wykonania scenariuszy z [MANUAL_TEST_PLAN.md](./MANUAL_TEST_PLAN.md).

## Zakres projektu

| Obszar | Środowisko zgodne z projektem |
|---|---|
| Frontend | Expo 54, React Native 0.81.5, TypeScript 5.9, React 19.1 |
| Uruchamianie frontendu | Expo Go lub development build; tryb portrait, Metro bundler |
| Backend | Spring Boot 3.5.0, Java 21, REST API i WebSocket |
| Baza danych | PostgreSQL z połączeniem SSL; do testów automatycznych używany jest H2 |
| Port backendu | `8090` |
| Autoryzacja | JWT; osobne konta testowe typu STUDENT i TUTOR |
| Testy dwóch użytkowników | Dwa konta oraz dwa niezależne klienty aplikacji, potrzebne do testów rozmowy i czatu |

## Urządzenia mobilne

### iOS

- Urządzenie: **iPhone 14**
- System: aktualna wersja iOS dostępna na urządzeniu testowym
- Orientacja: portrait
- Sposób uruchomienia: Expo Go lub development build
- Połączenie: ta sama sieć Wi-Fi co komputer uruchamiający backend/Metro, jeśli aplikacja korzysta z lokalnego adresu API

### Android

- Urządzenie: **Samsung Galaxy S23**
- System: aktualna wersja Android dostępna na urządzeniu testowym
- Orientacja: portrait
- Sposób uruchomienia: Expo Go lub development build
- Połączenie: ta sama sieć Wi-Fi co komputer uruchamiający backend/Metro, jeśli aplikacja korzysta z lokalnego adresu API

## Przygotowanie

1. Uruchom backend na porcie `8090` i sprawdź dostęp do bazy danych.
2. Zainstaluj zależności frontendu:

   ```bash
   cd frontend/tutoring-app
   npm install
   ```

3. Uruchom Expo:

   ```bash
   npx expo start
   ```

4. Połącz iPhone 14 oraz Samsung Galaxy S23 z aplikacją przez Expo Go/development build.
5. Przygotuj:
   - konto studenta,
   - konto tutora z uzupełnionym profilem tutora,
   - drugiego klienta lub drugie urządzenie do testów czatu,
   - dane lekcji i ofert potrzebne do scenariuszy MT-04–MT-11.

## Scenariusze objęte środowiskiem

- MT-01–MT-03: rejestracja i logowanie,
- MT-04–MT-05: lekcje i filtrowanie,
- MT-06–MT-08: rozmowy, czat i historia,
- MT-09–MT-11: oferty i zmiana ich statusu,
- MT-12: kontrola dostępu do cudzych danych,
- MT-13–MT-14: utrata i przywrócenie połączenia WebSocket,
- MT-15: wykonanie scenariuszy na Samsung Galaxy S23,
- MT-16: wykonanie scenariuszy na iPhone 14.

## Kryterium zaliczenia

Każdy scenariusz należy zakończyć wpisem: rzeczywisty rezultat, status `PASS`/`FAIL` oraz uwagi. Testy krytyczne uznaje się za zaliczone, gdy rejestracja, logowanie, autoryzacja, obsługa lekcji, czat i ponowne połączenie działają na obu urządzeniach.

Dokument opisuje przygotowane środowisko; nie stanowi potwierdzenia, że wszystkie scenariusze manualne zostały już wykonane.
