# Chat latency test

## 1. Utworzenie lokalnej bazy PostgreSQL

Profil `latencytest` nie korzysta z produkcyjnego `application.properties`. Domyślnie używa:

```text
host: localhost
port: 5432
database: tutoring_latency_test
user: postgres
password: postgres
```

Utwórz bazę jedną z komend:

```bash
createdb -h localhost -U postgres tutoring_latency_test
```

albo:

```bash
psql -h localhost -U postgres -c "CREATE DATABASE tutoring_latency_test;"
```

Jeśli dane lokalnego PostgreSQL są inne, ustaw `LATENCY_DB_URL`, `LATENCY_DB_USERNAME`, `LATENCY_DB_PASSWORD` oraz opcjonalnie `LATENCY_DB_NAME`. Hibernate używa `create-drop`, więc schemat jest tworzony automatycznie i usuwany przy zatrzymaniu backendu.

## 2. Uruchomienie backendu

W `backend/user-service/app` uruchom:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=latencytest
```

Jeżeli lokalny wrapper nie ma praw wykonywania, użyj `bash mvnw ...` albo zainstalowanego `mvn`:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=latencytest
```

Backend będzie dostępny domyślnie pod `http://localhost:8091`.

## 3. Uruchomienie testu

W katalogu głównym repozytorium:

```bash
npm install
npm run test:chat-latency
```

Domyślne konta są automatycznie rejestrowane w lokalnej bazie jako studenci:

```text
latency.sender@local.test / LatencyTest123
latency.receiver@local.test / LatencyTest123
```

Można podać własne dane przez `CHAT_LATENCY_SENDER_EMAIL`, `CHAT_LATENCY_SENDER_PASSWORD`, `CHAT_LATENCY_RECEIVER_EMAIL` i `CHAT_LATENCY_RECEIVER_PASSWORD`. Przy innym adresie backendu ustaw `CHAT_LATENCY_BASE_URL`.

Test sprawdza dostępność backendu, loguje lub tworzy obu użytkowników, tworzy konwersację, łączy receivera z `/ws`, czeka na aktywację subskrypcji `/topic/notification`, a następnie wysyła 100 wiadomości przez `POST /api/messages/send` co 75 ms. `content` ma unikalną wartość `latency-001-...` … `latency-100-...`; dopasowanie odbioru odbywa się po `content`, `senderId` i `receiverId`. `MessageDTO.id` pozostaje backendowym UUID.

Pomiar używa wspólnego `performance.now()` w procesie Node.js. `sentAt` jest zapisywany bezpośrednio przed POST-em, a `receivedAt` przy callbacku STOMP. Pomiar kończy się na otrzymaniu `MessageDTO`, bez renderowania React Native. Globalny timeout wynosi 120 sekund, a brak pierwszego odbioru przez 5 sekund kończy test błędem.

## 4. Wyniki

Pliki są zapisywane w katalogu głównym repozytorium:

- `chat-latency-results.csv` — jeden wiersz na wiadomość: `id,sentAt,receivedAt,latencyMs,httpLatencyMs,httpStatus`;
- `chat-latency-summary.json` — statystyki `sent`, `received`, `uniqueReceived`, `lost`, `duplicates`, `ordered`, `minMs`, `maxMs`, `meanMs`, `medianMs`, `p95Ms` oraz `durationMs`, `testDatabase`, `backendUrl`, `messageIntervalMs`.

`latencyMs` to czas od rozpoczęcia wysyłania żądania do odebrania wiadomości przez subskrypcję WebSocket. `httpLatencyMs` to osobny czas samego żądania HTTP POST. W razie błędu powstaje raport częściowy, również gdy odbiorca nie odebrał jeszcze żadnej wiadomości.

Przy błędzie po wysłaniu i odebraniu przynajmniej jednej wiadomości powstaje raport częściowy ze statusem `incomplete`. Gdy nie odebrano żadnej wiadomości, raport nie jest generowany. Błąd POST pokazuje numer wiadomości, kod HTTP i body odpowiedzi.
