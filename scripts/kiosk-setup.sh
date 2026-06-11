#!/usr/bin/env bash
#
# Konfiguracja trybu kiosku Projektora na Raspberry Pi OS (Bookworm).
# Instaluje zależności, kopiuje launcher i ustawia autostart.
#
# Użycie:
#   sudo bash scripts/kiosk-setup.sh
#   PROJECTOR_URL="http://localhost:10001/display" sudo -E bash scripts/kiosk-setup.sh
#
set -euo pipefail

PROJECTOR_URL="${PROJECTOR_URL:-http://localhost:10001/display}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_USER="${SUDO_USER:-$USER}"
USER_HOME="$(getent passwd "$TARGET_USER" | cut -d: -f6)"

echo ">> Instalacja zależności (chromium, unclutter, avahi)..."
apt-get update
apt-get install -y chromium-browser unclutter avahi-daemon x11-xserver-utils \
  || apt-get install -y chromium unclutter avahi-daemon x11-xserver-utils

echo ">> Włączanie avahi (mDNS, *.local)..."
systemctl enable --now avahi-daemon

echo ">> Instalacja launchera kiosku do /usr/local/bin/projector-kiosk.sh..."
install -m 0755 "$SCRIPT_DIR/projector-kiosk.sh" /usr/local/bin/projector-kiosk.sh

echo ">> Tworzenie systemd user unit dla użytkownika '$TARGET_USER'..."
UNIT_DIR="$USER_HOME/.config/systemd/user"
mkdir -p "$UNIT_DIR"
cat > "$UNIT_DIR/projector-kiosk.service" <<EOF
[Unit]
Description=Projector Kiosk (Chromium)
After=graphical-session.target
PartOf=graphical-session.target

[Service]
Environment=PROJECTOR_URL=${PROJECTOR_URL}
ExecStart=/usr/local/bin/projector-kiosk.sh
Restart=always
RestartSec=3

[Install]
WantedBy=graphical-session.target
EOF
chown -R "$TARGET_USER":"$TARGET_USER" "$USER_HOME/.config/systemd"

# Pozwól usłudze user działać bez aktywnej sesji logowania
loginctl enable-linger "$TARGET_USER" || true

echo ">> Włączanie usługi kiosku..."
sudo -u "$TARGET_USER" XDG_RUNTIME_DIR="/run/user/$(id -u "$TARGET_USER")" \
  systemctl --user enable projector-kiosk.service || true

# Fallback: autostart LXDE (gdy systemd user unit nie wystartuje w danym środowisku)
AUTOSTART_DIR="$USER_HOME/.config/autostart"
mkdir -p "$AUTOSTART_DIR"
cat > "$AUTOSTART_DIR/projector-kiosk.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Projector Kiosk
Exec=env PROJECTOR_URL=${PROJECTOR_URL} /usr/local/bin/projector-kiosk.sh
X-GNOME-Autostart-enabled=true
EOF
chown -R "$TARGET_USER":"$TARGET_USER" "$AUTOSTART_DIR"

cat <<EOF

Gotowe.
- URL kiosku:     ${PROJECTOR_URL}
- Launcher:       /usr/local/bin/projector-kiosk.sh
- systemd unit:   ~/.config/systemd/user/projector-kiosk.service
- Autostart LXDE: ~/.config/autostart/projector-kiosk.desktop

Zrestartuj RPi (sudo reboot), aby uruchomić kiosk.
EOF
