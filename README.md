# Projektor

System prezentacji dla kościoła: wyświetla teksty (pieśni, części stałe Mszy,
psalmy, czytania, ogłoszenia, modlitwy) oraz media (obrazy/wideo/audio) i kody
QR na telewizorze/rzutniku, sterowany z telefonu lub laptopa operatora.

## Architektura

Monorepo (Yarn 4 workspaces, node-modules linker):

- **apps/backend** — NestJS + Socket.IO. Trzyma stan ekranu (z persystencją na
  dysk), serwuje treści i media, emituje zmiany przez WebSocket.
- **apps/frontend** — React + TypeScript + Vite + Tailwind. Panel operatora
  (`/screen`), ekran publiczny (`/display`), katalog pieśni, scenariusze, pliki,
  ustawienia.

Dane (treści, scenariusze, ustawienia, media) leżą w katalogu `data/` na dysku
(pliki Markdown/YAML), konfigurowalnym przez zmienną `DATA_DIR`.

Porty: backend `10000`, frontend (nginx) `10001`. W produkcji wszystko idzie
przez nginx (ten sam origin); frontend proxuje `/api` i socket do backendu.

```
projectorv2/
├── apps/
│   ├── backend/    # NestJS (modules: texts, scenarios, player, settings,
│   │               #          files, notifications, backup, auth)
│   └── frontend/   # React + Vite
├── data/           # treści, scenariusze, ustawienia, media (na dysku)
├── docs/DEPLOY_RPI.md
└── docker-compose.yml
```

## Uruchomienie (dev)

Wymagania: Node.js 20+, Yarn 4 (przez corepack).

```bash
corepack enable
yarn install

# backend (port 10000)
yarn workspace backend run start:dev
# frontend (port 10001)
yarn workspace frontend run dev
```

- Panel operatora: http://localhost:10001/
- Ekran publiczny: http://localhost:10001/display
- Swagger API: http://localhost:10000/api

## Uruchomienie (Docker)

```bash
docker compose up -d --build
```

Obrazy multi-arch (amd64/arm64) są budowane w CI i publikowane do GHCR — na
Raspberry Pi wystarczy `docker compose pull && docker compose up -d`.

## Wdrożenie na Raspberry Pi (kiosk)

Pełny przewodnik (Docker, autostart Chromium w trybie kiosku, mDNS, ochrona
karty SD, multi-arch) znajduje się w [docs/DEPLOY_RPI.md](docs/DEPLOY_RPI.md).

## Najważniejsze funkcje

- **Sterowanie ekranem**: nawigacja stron/slajdów i kroków scenariusza, skróty
  klawiaturowe, szybkie wyszukiwanie pieśni (Ctrl+K), podgląd następnego slajdu,
  wskaźnik połączonego ekranu, czytelny stan „przygotowane vs widoczne".
- **Pieśni**: sekcje refren/zwrotka, „powiel refren", import hurtowy `.txt`,
  duplikowanie, podgląd z rzeczywistą paginacją.
- **Scenariusze (liturgie)**: kroki tekst/nagłówek/pusty/media/QR, data liturgii
  z sortowaniem (nadchodzące/archiwalne), duplikowanie.
- **Ekran publiczny**: tryb kiosku (ukryty kursor, Wake Lock, fullscreen), pilot
  USB (PageUp/PageDown/strzałki), płynne przejścia, auto-dopasowanie tekstu,
  zegar/logo na pustym ekranie, kody QR z etykietą.
- **Niezawodność**: samonaprawiający się socket + polling fallback, persystencja
  stanu ekranu, kopia zapasowa ZIP (eksport/import), opcjonalny PIN panelu,
  endpoint `/api/health`.

## Technologie

- Backend: NestJS 11, Socket.IO, class-validator, TypeScript 5.
- Frontend: React 19, Vite, React Router, TanStack Query, Socket.IO client,
  Tailwind, sonner (toasty), TypeScript 5.

## Testy

```bash
yarn workspace backend run test
```

## Licencja

MIT
