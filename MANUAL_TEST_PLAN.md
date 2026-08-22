# Manual test plan

W każdym przypadku wpisz: **rzeczywisty rezultat: ____; status PASS/FAIL: ____; uwagi: ____**.

| ID | Cel i warunki | Kroki | Oczekiwany rezultat |
|---|---|---|---|
| MT-01 | Rejestracja; nowy e-mail | Otwórz Rejestracja, wpisz poprawne dane, zatwierdź | Konto utworzone |
| MT-02 | Logowanie; istniejące konto | Wpisz e-mail i hasło | Token/sesja i ekran główny |
| MT-03 | Niepoprawne logowanie | Wpisz złe hasło | Komunikat błędu, brak sesji |
| MT-04 | Utworzenie Lesson; tutor z pełnym profilem | Dodaj lekcję z poprawnymi polami | Lekcja widoczna na liście |
| MT-05 | Filtrowanie ofert | Ustaw temat i zakres ceny | Wyniki zgodne z filtrami |
| MT-06 | Connect | Student wybiera tutora i rozpoczyna rozmowę | Jedna rozmowa dla tej pary |
| MT-07 | Czat; dwa konta/klienci | Wyślij kolejno trzy wiadomości | Oba klienty widzą treść i nadawcę |
| MT-08 | Historia | Zamknij i otwórz rozmowę | Wiadomości są w kolejności czasowej |
| MT-09 | TutorOffer | Utwórz ofertę dla lekcji | Status początkowy `PENDING` |
| MT-10 | Akceptacja | Student akceptuje ofertę | `ACCEPTED` |
| MT-11 | Odrzucenie | Student odrzuca nową ofertę | `DECLINED` |
| MT-12 | Cudze dane | Konto B próbuje edytować lekcję A | Operacja odrzucona |
| MT-13 | Utrata WebSocket | Podczas czatu wyłącz sieć | Stan rozłączenia i brak fałszywego potwierdzenia |
| MT-14 | Ponowne połączenie | Włącz sieć, odśwież rozmowę | Połączenie wraca, historia pozostaje |
| MT-15 | Android | Wykonaj MT-01–MT-12 na urządzeniu | Wszystkie krytyczne scenariusze działają |
| MT-16 | iOS/symulator | Wykonaj MT-01–MT-12 | Wszystkie krytyczne scenariusze działają |
