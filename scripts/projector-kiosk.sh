#!/usr/bin/env bash
#
# Uruchamia Projektor w trybie kiosku na Raspberry Pi.
# Watchdog: restartuje Chromium, gdy padnie.
#
# Adres można nadpisać zmienną PROJECTOR_URL.
#
set -u

PROJECTOR_URL="${PROJECTOR_URL:-http://localhost:10001/display}"

# Wybierz dostępny binary Chromium
CHROMIUM_BIN="$(command -v chromium-browser || command -v chromium || true)"
if [ -z "$CHROMIUM_BIN" ]; then
  echo "Nie znaleziono chromium-browser ani chromium. Zainstaluj Chromium." >&2
  exit 1
fi

# Wyłącz wygaszacz ekranu i DPMS (X11), ukryj kursor.
# Błędy ignorujemy (np. gdy brak X/uprawnień).
xset s off       2>/dev/null || true
xset -dpms       2>/dev/null || true
xset s noblank   2>/dev/null || true
command -v unclutter >/dev/null 2>&1 && (unclutter -idle 0 &) 2>/dev/null || true

# Katalog profilu kiosku (świeży stan flag „crash")
PROFILE_DIR="${HOME}/.config/projector-kiosk"
mkdir -p "$PROFILE_DIR"

launch_chromium() {
  # Usuń ślady poprzedniego (niepoprawnego) zamknięcia, by nie wyskoczył dymek
  sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]*"/"exit_type":"Normal"/' \
    "$PROFILE_DIR/Default/Preferences" 2>/dev/null || true

  "$CHROMIUM_BIN" \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-features=TranslateUI \
    --autoplay-policy=no-user-gesture-required \
    --check-for-update-interval=31536000 \
    --user-data-dir="$PROFILE_DIR" \
    "$PROJECTOR_URL"
}

# Watchdog — jeśli Chromium zakończy działanie, uruchom ponownie po 3 s
while true; do
  launch_chromium
  echo "Chromium zakończył działanie — restart za 3 s..." >&2
  sleep 3
done
