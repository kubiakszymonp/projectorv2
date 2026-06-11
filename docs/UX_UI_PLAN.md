# Plan poprawy UI/UX — czytelność i obsługa na smartfonie

Dokument analizuje obecny stan panelu operatora (`apps/frontend`) i proponuje
konkretne, priorytetyzowane zmiany. Nacisk: **czytelność**, **obsługa dotykiem
na telefonie** oraz uporządkowanie relacji **Media ↔ Edytor plików**.

> Kontekst: aplikacja to panel sterowania prezentacją w kościele. Operator
> najczęściej steruje z **telefonu** (patrz QR „Połącz telefonem" w menu).
> Tymczasem większość widoków jest zaprojektowana pod desktop, a na mobile
> degraduje się przez ukrywanie etykiet i wciskanie desktopowych układów.

---

## 1. TL;DR — najważniejsze wnioski

1. **Media i „Edytor plików" to ten sam komponent** (`FilesExplorer`) — tylko
   inny folder startowy i tytuł. To myli i jest ryzykowne (operator widzi surowe
   pliki `.yaml`/`.md`). → Rozdzielić koncepcyjnie: **Media = wizualna galeria**,
   **Edytor plików = narzędzie zaawansowane**, schowane poza główną nawigacją.
2. **Nawigacja na telefonie to 7 ikon bez podpisów** w poziomym scrollu
   (`hidden sm:inline`). Nie da się zgadnąć, co robią. → **Dolny pasek zakładek
   (bottom nav) z podpisami**.
3. **Sidebar menedżera plików** jest wstawiony „w treść" (`w-64`, domyślnie
   otwarty), więc na telefonie zjada ~70% szerokości i ściska listę. → Na mobile
   ma być **wysuwaną szufladą (drawer)** z tłem i auto-zamykaniem.
4. **Przyciski bez tekstu** w wielu miejscach (kosz, odśwież, szukaj, wyczyść,
   menu pliku). Tooltipy **nie działają na dotyku**. → Etykiety widoczne na
   mobile + większe pola dotyku (min. 44px).
5. **Menu akcji pliku (⋮) jest niewidoczne na telefonie** —
   `opacity-0 sm:group-hover:opacity-100`, a telefon nie ma hovera. → Zawsze
   widoczne na mobile.
6. **Ustawienia** są gęste i miejscami przepełniają się w nagłówku na wąskich
   ekranach. → Responsywny nagłówek, większe pola, krótsze sekcje.

---

## 2. Decyzja koncepcyjna: Media vs „Edytor plików"

### Stan obecny
- `apps/frontend/src/views/MediaExplorer.tsx` = `<FilesExplorer initialPath="media" title="Media" />`.
- `apps/frontend/src/views/FilesExplorer.tsx` z domyślnym `initialPath=""`,
  `title="Edytor plików"` — pokazuje **cały** katalog `data/`: scenariusze
  (`.yaml`), teksty pieśni (`.md`), ustawienia, kosz itd.
- Oba w głównej nawigacji (`navbar.tsx`): „Media" i „Pliki".

### Problem
- **Redundancja** — dwa wpisy w menu prowadzą do tego samego ekranu.
- **Ryzyko** — operator (osoba nietechniczna) dostaje surowy dostęp do plików
  konfiguracyjnych i danych. Łatwo coś zepsuć (zmiana/usunięcie `.yaml`).
- **Zły dobór widoku dla mediów** — `FileList`/`FileItem` to płaska lista z małą
  ikonką. Dla obrazów/wideo brak **miniatur**, brak siatki (grid) — a media to
  treść wizualna, którą wybiera się „na oko".

### Rekomendacja
**Tak, „edytor plików" powinien zostać — ale jako narzędzie zaawansowane, nie
jako codzienny widok.**

- **Media** → osobne, wizualne doświadczenie:
  - widok **siatki z miniaturami** (obraz = podgląd, wideo = klatka/ikona,
    audio = ikona + nazwa),
  - duże kafelki = wygodne na dotyk,
  - akcje wprost na kafelku: **Rzutuj na ekran**, **Dodaj do scenariusza**,
  - upload z drag&drop / przyciskiem,
  - bez drzewa surowych folderów `data/` — tylko podfoldery `media/`.
- **Edytor plików** → przenieść z głównej nawigacji do
  **Ustawienia → System → „Zaawansowane: pliki"** (lub za flagą/PIN-em).
  Zostaje pełny dostęp do `data/` dla power-usera/serwisanta, ale nie kusi
  zwykłego operatora i nie zajmuje miejsca w nawigacji mobilnej.

> Efekt: nawigacja chudnie z 7 do ~6 pozycji (lepsza na telefonie), a Media
> stają się przyjazne dotykowi.

---

## 3. Zinwentaryzowane problemy (z odniesieniami do kodu)

### 3.1 Nawigacja — `components/ui/navbar.tsx`
- Podpisy ukryte poniżej `sm` (`<span className="hidden sm:inline">`, linia 54)
  → na telefonie **7 nieopisanych ikon** w poziomym scrollu.
- Pasek górny zabiera wysokość (h-14) na i tak małym ekranie telefonu.
- Brak wskazania, że pasek się przewija w poziomie (`overflow-x-auto`).

### 3.2 Menedżer plików / Media — `views/FilesExplorer.tsx`
- Sidebar to inline `<aside className="w-64 …">` (linia 343), domyślnie otwarty
  (`sidebarOpen = true`, linia 74). Na telefonie ściska listę plików do
  resztki szerokości. Brak trybu „overlay/drawer", brak tła, brak auto-zamknięcia
  po wyborze folderu.
- Toolbar: „Upload"/„Folder" mają podpisy `hidden sm:inline` (linie 383, 398) →
  na mobile same ikony.
- Nagłówek: **Kosz** i **Odśwież** to wyłącznie ikony z `Tooltip` (linie
  312–335). Tooltipy nie działają na dotyku → operator nie wie, co to za przyciski.

### 3.3 Pozycja pliku — `components/files/FileItem.tsx`
- Przycisk menu (⋮): `opacity-0 sm:group-hover:opacity-100` (linia 169) — **na
  telefonie nie pojawia się nigdy** (brak hovera). Akcje (Rzutuj, Dodaj do
  scenariusza, Zmień nazwę, Usuń) dostępne tylko przez long-press context menu,
  co jest nieoczywiste.
- Rozmiar/data ukryte na mobile (`hidden sm:block`/`hidden md:block`) — OK, ale
  przez to lista jest „naga", bez kontekstu.
- Pole dotyku ikony ⋮: `h-8 w-8` (32px) < zalecane 44px.

### 3.4 Sterowanie ekranem — `views/ScreenControl.tsx`
- Nagłówek: **Szukaj** i **Wyczyść** jako ikony z `title=` (linie 246–266) —
  niewidoczny opis na dotyku.
- Sekcja stanu i nawigacji jest desktopowo gęsta; przyciski nawigacji
  `h-14 w-14` są dobre na dotyk (plus), ale układ wymaga sprawdzenia na 360px.
- To **najważniejszy ekran operatora na telefonie** — musi być wzorcowy.

### 3.5 Ustawienia — `views/Settings.tsx` + `components/settings/*`
- `SettingsHeader` (linie 22–65): dwa przyciski z tekstem („Resetuj",
  „Zapisz", `min-w-[120px]`) + tytuł „Konfiguracja" w jednym, niełamiącym się
  rzędzie → na wąskich telefonach napis może się przepełniać / ściskać.
- Domyślnie otwarte sekcje `display` i `wifi` (linia 37) → bardzo długi scroll
  na starcie na telefonie.
- Pola formularza (`SettingsFormFields.tsx`): `NumberInput`/`ColorInput` zwarte;
  inputy bez wyraźnego, dużego pola dotyku; `select` natywny `h-10` OK.
- Treść `max-w-3xl` wyrównana do lewej — na desktopie pусto po prawej (kosmetyka).

### 3.6 Spójność i czytelność (całość)
- Tooltipy używane jako jedyny nośnik opisu — antywzorzec na dotyku.
- Dużo tekstu `text-muted-foreground` (#a1a1aa) na tłach `muted` (#27272a) —
  niski kontrast dla treści drugorzędnej (WCAG AA bywa na granicy).
- Pola dotyku często 32px (`size="icon"` h-8 w-8) — poniżej 44px.
- Brak jednego, spójnego wzorca „nagłówek widoku" (każdy widok robi swój header).

---

## 4. Plan ulepszeń (priorytetyzowany)

Legenda: **P0** = krytyczne dla obsługi na telefonie, **P1** = duża poprawa,
**P2** = polish/spójność.

### P0 — Nawigacja mobilna (bottom nav)
- Na mobile (`useIsMobile`, breakpoint 768) zamienić górny pasek na **dolny pasek
  zakładek** z **ikoną + krótkim podpisem** (Start, Sterowanie, Pieśni,
  Scenariusze, Media; reszta pod „Więcej").
- Aktywna zakładka wyróżniona kolorem + podpisem.
- Na desktopie zostaje obecny górny pasek (z podpisami — usunąć `hidden sm:inline`,
  bo i tak mieści się na szerokim ekranie; ewentualnie zwęzić do ikon dopiero
  przy bardzo wąskim oknie desktopu).
- Plik: `components/ui/navbar.tsx` (+ ewentualnie nowy `MobileTabBar.tsx`).
- Pamiętać o `padding-bottom` na widokach `h-screen`, by treść nie chowała się
  pod dolnym paskiem.

### P0 — Sidebar menedżera plików → szuflada (drawer) na mobile
- Na mobile: `aside` jako **overlay** (`fixed inset-y-0 left-0 z-40`, własne tło),
  z **półprzezroczystym backdropem**, **domyślnie zamknięty**, **auto-zamykany**
  po wyborze folderu (`handleSelectFolder`).
- Na desktopie: zostaje inline `w-64`.
- Sterować przez `useIsMobile`; `sidebarOpen` domyślnie `false` na mobile.
- Plik: `views/FilesExplorer.tsx` (linie 74, 340–370).

### P0 — Menu akcji pliku widoczne na telefonie
- Zmienić `opacity-0 sm:group-hover:opacity-100` tak, by na mobile ⋮ był **zawsze
  widoczny** (np. `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`).
- Powiększyć pole dotyku do min. 44px.
- Plik: `components/files/FileItem.tsx` (linia 169).

### P0 — Etykiety zamiast „gołych" ikon na kluczowych akcjach
- Pokazywać podpisy na mobile dla akcji pierwszorzędnych: Upload, Nowy folder,
  Kosz, Odśwież, Szukaj, Wyczyść, Zapisz.
- Reguła: **akcja pierwszorzędna = ikona + tekst**; tylko uniwersalne (✕ zamknij)
  mogą zostać ikoną. Tooltip = dodatek, nigdy jedyny opis.
- Pliki: `views/FilesExplorer.tsx`, `views/ScreenControl.tsx`,
  `components/files/TextEditor.tsx`, `components/settings/SettingsHeader.tsx`.

### P1 — Media jako wizualna galeria (siatka + miniatury)
- Nowy widok/tryb dla `/media`: **grid kafelków** z miniaturami (obraz przez
  `getFileUrl`, wideo — klatka lub ikona typu, audio — ikona). Duże kafelki,
  akcje „Rzutuj"/„Dodaj do scenariusza" wprost na kafelku.
- Przełącznik lista/siatka; na mobile domyślnie siatka 2 kolumny.
- Upload widoczny i duży; opcjonalnie drag&drop.
- Pliki: `views/MediaExplorer.tsx` (rozdzielić od `FilesExplorer`), nowy
  `components/media/MediaGrid.tsx` / `MediaTile.tsx`.

### P1 — „Edytor plików" jako narzędzie zaawansowane
- Usunąć „Pliki" z głównej nawigacji; wejście przenieść do
  Ustawienia → System.
- Zostawić route `/files` (działa z linków, np. „Otwórz w edytorze plików"
  w `ScenarioEditor`).
- Pliki: `components/ui/navbar.tsx`, `views/MainMenu.tsx` (kafelek „Edytor
  plików" → przenieść/oznaczyć jako zaawansowane),
  `components/settings/SystemStatusSection.tsx` (dodać link).

### P1 — Ustawienia responsywne i mniej gęste
- `SettingsHeader`: pozwolić na zawijanie / skrócić przyciski na mobile (ikona +
  krótszy tekst lub `flex-wrap`); zapewnić, że tytuł nie wypycha przycisków.
- Domyślnie otwarta tylko jedna sekcja (np. `display`) — krótszy start na mobile.
- Większe pola dotyku w `NumberInput`/`ColorInput`; etykiety i opisy z większym
  odstępem.
- Pliki: `components/settings/SettingsHeader.tsx`, `views/Settings.tsx` (linia 37),
  `components/settings/SettingsFormFields.tsx`.

### P2 — Spójny system i czytelność
- **Wspólny komponent `ViewHeader`** (tytuł + akcje) z jednolitym zachowaniem
  responsywnym — zamiast osobnych nagłówków w każdym widoku.
- **Standard pól dotyku**: domyślny rozmiar „icon" na mobile ≥ 44px.
- **Kontrast**: podnieść kolor tekstu drugorzędnego na tłach `muted` (np. jaśniejszy
  `muted-foreground` lub ciemniejsze tło sekcji) — sprawdzić WCAG AA.
- **Typografia**: bazowy `font-size` 16px na mobile (uniknąć auto-zoomu iOS na
  inputach < 16px).
- **Spójne ikony↔etykiety**: jeden zestaw reguł w całej apce.
- Pliki: `index.css`, `components/ui/button.tsx`, nowy `components/ui/view-header.tsx`.

---

## 5. Konkretne zmiany plik po pliku (skrót do realizacji)

| Plik | Zmiana | Priorytet |
|------|--------|-----------|
| `components/ui/navbar.tsx` | Dolny tab-bar na mobile z podpisami; usunąć „Pliki" z głównego menu | P0 |
| `views/FilesExplorer.tsx` | Sidebar → drawer na mobile (overlay+backdrop+auto-close, domyślnie zamknięty); podpisy na Upload/Folder/Kosz/Odśwież | P0 |
| `components/files/FileItem.tsx` | ⋮ zawsze widoczne na mobile; pole dotyku ≥44px | P0 |
| `views/ScreenControl.tsx` | Podpisy/większe pola dla Szukaj/Wyczyść; weryfikacja układu 360px | P0 |
| `components/files/TextEditor.tsx` | „Zapisz" z tekstem także na mobile | P1 |
| `views/MediaExplorer.tsx` (+ `components/media/*`) | Osobny widok galerii z miniaturami i akcjami na kafelku | P1 |
| `components/settings/SettingsHeader.tsx` | Responsywny nagłówek (wrap / krótsze etykiety) | P1 |
| `views/Settings.tsx` | Domyślnie 1 otwarta sekcja; padding pod bottom nav | P1 |
| `components/settings/SettingsFormFields.tsx` | Większe pola dotyku, odstępy | P1 |
| `views/MainMenu.tsx` | „Edytor plików" jako zaawansowane (przenieść/oznaczyć) | P1 |
| `index.css` / `components/ui/button.tsx` | Kontrast, bazowa typografia 16px, rozmiary dotyku | P2 |
| nowy `components/ui/view-header.tsx` | Wspólny nagłówek widoku | P2 |

---

## 6. Sugerowana kolejność wdrożenia (etapy)

**Etap 1 — „Telefon używalny" (P0)**
1. Dolny tab-bar (`navbar.tsx`).
2. Sidebar plików → drawer (`FilesExplorer.tsx`).
3. ⋮ widoczne na mobile (`FileItem.tsx`).
4. Etykiety na kluczowych akcjach (FilesExplorer, ScreenControl).

**Etap 2 — „Media i Pliki uporządkowane" (P1)**
5. Wydzielić Media jako galerię z miniaturami.
6. Schować „Edytor plików" do Ustawień.
7. Ustawienia responsywne.

**Etap 3 — „Spójność i polish" (P2)**
8. Wspólny `ViewHeader`, standard pól dotyku, kontrast, typografia.

---

## 7. Checklista akceptacji (na telefonie 360–390px)

- [ ] Każda pozycja nawigacji ma czytelny podpis (nie sama ikona).
- [ ] Lista plików zajmuje pełną szerokość; drzewo otwiera się jako szuflada.
- [ ] Z poziomu listy plików da się dotykiem otworzyć menu akcji pliku.
- [ ] Każda akcja pierwszorzędna ma widoczny opis (nie tylko tooltip/`title`).
- [ ] Media: wybór „na oko" po miniaturach, akcje „Rzutuj"/„Dodaj" pod ręką.
- [ ] Pola dotyku ≥ 44px dla przycisków akcji.
- [ ] Ustawienia: nagłówek się nie przepełnia; start nie jest nieskończenie długi.
- [ ] „Edytor plików" nie jest w głównej nawigacji (jest w Ustawieniach).
- [ ] Treść nie chowa się pod dolnym paskiem nawigacji.

---

## 8. Uwagi techniczne

- Mamy już `hooks/useIsMobile.ts` (breakpoint 768) — użyć go spójnie zamiast
  rozsypanych klas `hidden sm:*` tam, gdzie potrzebne jest realne przełączanie
  układu (drawer/bottom-nav), a nie tylko ukrywanie tekstu.
- Komponenty bazowe (`button`, `dialog`, `dropdown-menu`, `tooltip`, `scroll-area`)
  już są — zmiany to głównie kompozycja + warianty responsywne, bez nowych
  zależności.
- Zachować istniejące skróty klawiaturowe operatora (laptop) — dotyczą desktopu,
  nie kolidują z mobile.
