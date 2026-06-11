# Wdrożenie na Raspberry Pi (tryb kiosku)

Przewodnik wdrożenia Projektora na Raspberry Pi podłączonym po HDMI do
telewizora w kościele. Po skonfigurowaniu RPi po starcie sam uruchamia
aplikację i otwiera ekran `/display` na pełnym ekranie — bez ingerencji
operatora.

Założenia:
- Raspberry Pi 3/4/5 (zalecane 4 lub 5; 2 GB+ RAM) z Raspberry Pi OS
  (Bookworm, 64-bit). Wariant z pulpitem (Desktop) jest najprostszy dla kiosku.
- RPi w lokalnej sieci parafialnej, telewizor po HDMI.
- Operator łączy się telefonem/laptopem z panelem sterowania.

---

## 1. Architektura wdrożenia

- **backend** (NestJS) — port `10000`, dane w wolumenie `./data`.
- **frontend** (nginx + React) — port `10001`, proxsuje `/api` i socket do
  backendu. To ten adres otwiera się na telewizorze i u operatora.
- Ekran publiczny: `http://localhost:10001/display`
- Panel operatora: `http://<adres-rpi>:10001/`

Oba kontenery mają `restart: unless-stopped`, więc po restarcie RPi wstają same
(o ile usługa Dockera jest włączona — patrz niżej).

---

## 2. Instalacja Dockera

```bash
# Docker + compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"     # dodaj usera do grupy docker (wyloguj/zaloguj)

# Autostart usługi Dockera po starcie systemu
sudo systemctl enable docker
```

Wyloguj się i zaloguj ponownie, by zadziałało członkostwo w grupie `docker`.

---

## 3. Uruchomienie aplikacji

```bash
git clone <repo> ~/projector
cd ~/projector

# Build na samym RPi bywa wolny (zwłaszcza RPi 3). Patrz sekcja 7 —
# zalecane budowanie obrazów multi-arch na PC i `docker compose pull`.
docker compose up -d --build
```

Sprawdź:
```bash
docker compose ps
curl http://localhost:10000/api/health      # backend status
curl -I http://localhost:10001/             # frontend
```

---

## 4. Tryb kiosku (Chromium na pełnym ekranie)

Skrypty w `scripts/` automatyzują konfigurację kiosku:

- `scripts/projector-kiosk.sh` — uruchamia Chromium w trybie kiosku,
  z watchdogiem (restartuje przeglądarkę gdy padnie), ukrywa kursor i wyłącza
  wygaszacz/DPMS.
- `scripts/kiosk-setup.sh` — instaluje zależności (chromium, unclutter, avahi),
  kopiuje launcher i tworzy autostart (systemd user unit + fallback LXDE).

```bash
sudo bash scripts/kiosk-setup.sh
```

Skrypt domyślnie kieruje na `http://localhost:10001/display`. Adres można
nadpisać zmienną:
```bash
PROJECTOR_URL="http://localhost:10001/display" sudo -E bash scripts/kiosk-setup.sh
```

Kluczowe flagi Chromium (w launcherze):
```
chromium-browser --kiosk --noerrdialogs --disable-session-crashed-bubble \
  --autoplay-policy=no-user-gesture-required \
  --check-for-update-interval=31536000 \
  http://localhost:10001/display
```

> **Ważne:** `--autoplay-policy=no-user-gesture-required` jest niezbędna, żeby
> wideo/audio z `autoPlay` w ogóle ruszyło w kiosku (bez interakcji
> użytkownika przeglądarka domyślnie blokuje autoodtwarzanie).

Ukrycie kursora i wyłączenie wygaszacza/DPMS realizują `unclutter -idle 0`
oraz `xset s off -dpms` (uruchamiane przez launcher).

---

## 5. Stały adres (mDNS)

Operator nie powinien wpisywać `192.168.x.x` co tydzień. Instalujemy
`avahi-daemon` (robi to `kiosk-setup.sh`), dzięki czemu RPi jest dostępne pod
nazwą `*.local`:

```bash
sudo apt install -y avahi-daemon
sudo raspi-config    # System Options -> Hostname -> np. "projektor"
```

Po tym panel operatora jest pod `http://projektor.local:10001/`.

Dodatkowo zalecana **rezerwacja DHCP** na routerze (stały IP po MAC) jako
zapas, gdyby mDNS nie działał na danym telefonie.

---

## 6. Ochrona karty SD i logi

Karty SD padają od ciągłych zapisów. Limity logów Dockera są już ustawione w
`docker-compose.yml` (`max-size`/`max-file`). Dodatkowo:
- rozważ montaż `data/` na pendrive/SSD USB dla większej trwałości,
- regularnie rób kopię zapasową (przycisk „Pobierz kopię zapasową" w
  Ustawieniach — pakuje całe `data/` do ZIP).

---

## 7. Szybsze obrazy (multi-arch, budowanie na PC)

Build na RPi jest wolny. Zbuduj obrazy na PC i opublikuj do registry, a na RPi
tylko pobierz:

```bash
# Na PC (z buildx):
docker buildx build --platform linux/arm64 \
  -f apps/backend/Dockerfile -t ghcr.io/<user>/projector-backend:latest --push .
docker buildx build --platform linux/arm64 \
  -f apps/frontend/Dockerfile -t ghcr.io/<user>/projector-frontend:latest --push .

# Na RPi (po ustawieniu image: w docker-compose.yml):
docker compose pull
docker compose up -d
```

---

## 8. Diagnostyka

```bash
docker compose logs -f backend          # logi backendu
docker compose logs -f frontend         # logi nginx
systemctl --user status projector-kiosk # status kiosku (jeśli systemd user unit)
curl http://localhost:10000/api/health  # health backendu (uptime, liczba tekstów)
```

Restart całości:
```bash
docker compose restart
```
