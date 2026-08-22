# Raport testów frontendu

## Data i środowisko

- Data wykonania: 2026-08-12
- Projekt: Expo/React Native 54, TypeScript
- Runner: Jest 29
- Środowisko testowe: Node (`testEnvironment: node`)

## Uruchomiona komenda

```bash
npm test -- --runInBand
```

## Zakres testów

Przetestowano moduł `api/authEvents`, który przekazuje zdarzenia nieautoryzowania do aktualnie zarejestrowanego handlera.

| Test | Sprawdzane zachowanie | Wynik |
|---|---|---|
| `invokes the currently registered unauthorized handler` | Wywołanie `triggerUnauthorized()` uruchamia zarejestrowany handler dokładnie raz | PASS |
| `replaces a previous handler` | Rejestracja nowego handlera zastępuje poprzedni; wywołany zostaje tylko nowy | PASS |

## Wynik

- Suites: **1 passed / 1 total**
- Tests: **2 passed / 2 total**
- Failures: **0**
- Errors: **0**
- Snapshots: **0**
- Czas wykonania: **0,59 s**

## Podsumowanie

Testy odpowiedzialne za obsługę zdarzeń nieautoryzowania przechodzą pomyślnie. Konfiguracja Jest wyszukuje testy w katalogach `__tests__` z plikami `*.test.ts`; obecnie w tym zestawie znajduje się jeden plik testowy.

Raport obejmuje testy automatyczne dostępne w projekcie. Nie obejmuje testów uruchamiania aplikacji Expo na Androidzie/iOS, testów UI ani testów integracyjnych z działającym backendem.
