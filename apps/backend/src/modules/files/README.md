# Files Explorer API

Uniwersalny system zarządzania plikami dla całego folderu `data/` - w stylu "Google Drive lite".

## 🎯 Architektura

- **Cały folder data/** - obsługuje media, texts, scenarios, settings
- **Automatyczna detekcja typu** (image/video/audio/document/text/other) po MIME + rozszerzeniu
- **Soft delete** - usunięte pliki trafiają do `/data/trash`
- **Bezpieczeństwo** - walidacja ścieżek zapobiega directory traversal

## 📁 Struktura

```
/data
  /media
    /ogloszenia
      2026-01-20.jpg
      tlo.png
    /rekolekcje
      intro.mp4
  /texts
    /songs
      abba-ojcze.md
  /scenarios
    niedziela-1100.yaml
  /settings
    config.json
  /trash (ukryty w API)
```

## 🔧 API Endpointy

### 1. Listowanie folderu
```http
GET /api/files?path=<path>
```

**Parametry:**
- `path` (optional) - ścieżka względna, default: `""` (root = data/)

**Response:**
```json
{
  "path": "media/ogloszenia",
  "items": [
    {
      "path": "media/ogloszenia/tlo.png",
      "name": "tlo.png",
      "isDir": false,
      "kind": "image",
      "size": 12345,
      "modifiedAt": "2026-01-20T12:00:00.000Z"
    },
    {
      "path": "media/ogloszenia/archiwum",
      "name": "archiwum",
      "isDir": true
    }
  ]
}
```

### 2. Drzewo folderów (do sidebaru)
```http
GET /api/files/tree
```

**Response:**
```json
{
  "path": "",
  "folders": [
    { "path": "media", "name": "media" },
    { "path": "media/ogloszenia", "name": "ogloszenia" },
    { "path": "texts", "name": "texts" },
    { "path": "texts/songs", "name": "songs" },
    { "path": "scenarios", "name": "scenarios" }
  ]
}
```

### 3. Upload pliku
```http
POST /api/files/upload
Content-Type: multipart/form-data
```

**Form fields:**
- `path` - folder docelowy (np. `"media/ogloszenia"`)
- `file` - plik do uploadu

**Zasady:**
- Nazwa pliku jest slugify'owana (base name)
- Przy konflikcie dodawany jest suffix `__<ULID>`
- Rozszerzenie jest zachowywane

**Response:**
```json
{
  "node": {
    "path": "media/ogloszenia/tlo__01J0K....png",
    "name": "tlo__01J0K....png",
    "isDir": false,
    "kind": "image",
    "size": 12345,
    "modifiedAt": "2026-01-20T12:00:00.000Z"
  }
}
```

### 4. Tworzenie folderu
```http
POST /api/files/folders
Content-Type: application/json
```

**Body:**
```json
{ "path": "media/ogloszenia/nowe" }
```

**Response:**
```json
{ "success": true }
```

### 5. Rename
```http
POST /api/files/rename
Content-Type: application/json
```

**Body:**
```json
{
  "path": "media/ogloszenia/tlo.png",
  "newName": "tlo-nowe.png"
}
```

**Response:**
```json
{ "success": true }
```

### 6. Delete (soft delete)
```http
DELETE /api/files?path=<path>
```

**Zasady:**
- Plik/folder jest przenoszony do `/data/trash/`
- Nazwa w trash: `<timestamp>__<original_name>`

**Response:**
```json
{ "success": true }
```

### 7. Pobranie pliku (streaming)
```http
GET /api/files/file?path=<path>
```

**Response:**
- Binary file stream
- Content-Type ustawiony na podstawie rozszerzenia
- Content-Disposition: inline

## 🔒 Bezpieczeństwo

Backend automatycznie:
- Blokuje ścieżki absolutne (`/etc/passwd`)
- Blokuje sekwencje `..` (directory traversal)
- Blokuje Windows drive letters (`C:\`)
- Waliduje nazwy plików/folderów
- Zapewnia że wszystkie operacje są w `/data`
- **Ukrywa folder trash** w listowaniu

## 🎨 Typy FileKind

```typescript
type FileKind = "image" | "video" | "audio" | "document" | "text" | "other";
```

**Rozpoznawane rozszerzenia:**
- **image**: jpg, jpeg, png, gif, webp, bmp, svg, ico, tiff, tif
- **video**: mp4, webm, mov, avi, mkv, flv, wmv, m4v, mpg, mpeg
- **audio**: mp3, wav, ogg, m4a, flac, aac, wma, opus
- **document**: pdf, doc, docx, xls, xlsx, ppt, pptx, rtf, odt, ods, odp
- **text**: txt, md, yaml, yml, json, html, css, js, ts
- **other**: wszystkie pozostałe

## 📦 Użyte technologie

- **NestJS** - framework
- **Multer** - upload plików
- **class-validator** - walidacja DTO
- **ulid** - unikalne ID dla konfliktów nazw
- **fs/promises** - operacje na plikach

## 🚀 Przykłady użycia

### cURL

```bash
# Listowanie root (data/)
curl http://localhost:3000/api/files

# Listowanie media
curl 'http://localhost:3000/api/files?path=media'

# Listowanie podfolderu media
curl 'http://localhost:3000/api/files?path=media/ogloszenia'

# Listowanie tekstów
curl 'http://localhost:3000/api/files?path=texts/songs'

# Upload do media
curl -X POST http://localhost:3000/api/files/upload \
  -F 'path=media/ogloszenia' \
  -F 'file=@image.jpg'

# Tworzenie folderu
curl -X POST http://localhost:3000/api/files/folders \
  -H 'Content-Type: application/json' \
  -d '{"path":"media/nowy-folder"}'

# Rename
curl -X POST http://localhost:3000/api/files/rename \
  -H 'Content-Type: application/json' \
  -d '{"path":"media/stara-nazwa.jpg","newName":"nowa-nazwa.jpg"}'

# Delete
curl -X DELETE 'http://localhost:3000/api/files?path=media/ogloszenia/plik.jpg'

# Pobieranie pliku
curl 'http://localhost:3000/api/files/file?path=media/ogloszenia/plik.jpg' -o downloaded.jpg
```

### Frontend (fetch)

```typescript
// Listowanie root
const response = await fetch('/api/files');
const data: FileListResponse = await response.json();

// Listowanie media
const mediaResponse = await fetch('/api/files?path=media/ogloszenia');
const mediaData: FileListResponse = await mediaResponse.json();

// Upload
const formData = new FormData();
formData.append('path', 'media/ogloszenia');
formData.append('file', fileInput.files[0]);

await fetch('/api/files/upload', {
  method: 'POST',
  body: formData
});

// Delete
await fetch('/api/files?path=media/ogloszenia/plik.jpg', {
  method: 'DELETE'
});
```

## 🔮 Przyszłe rozszerzenia (opcjonalne)

- Thumbnail generation (`/api/files/thumbnail?path=...&w=256`)
- Range requests dla video (streaming)
- Magic bytes validation (file-type package)
- Przeszukiwanie plików
- Tagowanie/metadata
- Uprawnienia per folder
- Edycja plików tekstowych in-place

