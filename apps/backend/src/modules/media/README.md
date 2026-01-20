# Media Drive API

Minimalistyczny system zarządzania plikami w stylu "Google Drive lite".

## 🎯 Architektura

- **Jeden folder** `/data/media` dla wszystkich typów plików
- **Automatyczna detekcja typu** (image/video/audio/document/other) po MIME + rozszerzeniu
- **Soft delete** - usunięte pliki trafiają do `/data/trash/media`
- **Bezpieczeństwo** - walidacja ścieżek zapobiega directory traversal

## 📁 Struktura

```
/data/media
  /ogloszenia
    2026-01-20.jpg
    tlo.png
  /rekolekcje
    intro.mp4
  /papiez
    jp2.webp
```

## 🔧 API Endpointy

### 1. Listowanie folderu
```http
GET /api/media?path=<path>
```

**Parametry:**
- `path` (optional) - ścieżka względna, default: `""` (root)

**Response:**
```json
{
  "path": "ogloszenia",
  "items": [
    {
      "path": "ogloszenia/tlo.png",
      "name": "tlo.png",
      "isDir": false,
      "kind": "image",
      "size": 12345,
      "modifiedAt": "2026-01-20T12:00:00.000Z"
    },
    {
      "path": "ogloszenia/archiwum",
      "name": "archiwum",
      "isDir": true
    }
  ]
}
```

### 2. Drzewo folderów (do sidebaru)
```http
GET /api/media/tree
```

**Response:**
```json
{
  "path": "",
  "folders": [
    { "path": "ogloszenia", "name": "ogloszenia" },
    { "path": "rekolekcje", "name": "rekolekcje" }
  ]
}
```

### 3. Upload pliku
```http
POST /api/media/upload
Content-Type: multipart/form-data
```

**Form fields:**
- `path` - folder docelowy (np. `"ogloszenia"`)
- `file` - plik do uploadu

**Zasady:**
- Nazwa pliku jest slugify'owana (base name)
- Przy konflikcie dodawany jest suffix `__<ULID>`
- Rozszerzenie jest zachowywane

**Response:**
```json
{
  "node": {
    "path": "ogloszenia/tlo__01J0K....png",
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
POST /api/media/folders
Content-Type: application/json
```

**Body:**
```json
{ "path": "ogloszenia/nowe" }
```

**Response:**
```json
{ "success": true }
```

### 5. Rename
```http
POST /api/media/rename
Content-Type: application/json
```

**Body:**
```json
{
  "path": "ogloszenia/tlo.png",
  "newName": "tlo-nowe.png"
}
```

**Response:**
```json
{ "success": true }
```

### 6. Delete (soft delete)
```http
DELETE /api/media?path=<path>
```

**Zasady:**
- Plik/folder jest przenoszony do `/data/trash/media/`
- Nazwa w trash: `<timestamp>__<original_name>`

**Response:**
```json
{ "success": true }
```

### 7. Pobranie pliku (streaming)
```http
GET /api/media/file?path=<path>
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
- Zapewnia że wszystkie operacje są w `/data/media`

## 🎨 Typy MediaKind

```typescript
type MediaKind = "image" | "video" | "audio" | "document" | "other";
```

**Rozpoznawane rozszerzenia:**
- **image**: jpg, jpeg, png, gif, webp, bmp, svg, ico, tiff, tif
- **video**: mp4, webm, mov, avi, mkv, flv, wmv, m4v, mpg, mpeg
- **audio**: mp3, wav, ogg, m4a, flac, aac, wma, opus
- **document**: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, rtf, odt, ods, odp
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
# Listowanie root
curl http://localhost:3000/api/media

# Listowanie podfolderu
curl 'http://localhost:3000/api/media?path=ogloszenia'

# Upload
curl -X POST http://localhost:3000/api/media/upload \
  -F 'path=ogloszenia' \
  -F 'file=@image.jpg'

# Tworzenie folderu
curl -X POST http://localhost:3000/api/media/folders \
  -H 'Content-Type: application/json' \
  -d '{"path":"nowy-folder"}'

# Rename
curl -X POST http://localhost:3000/api/media/rename \
  -H 'Content-Type: application/json' \
  -d '{"path":"stara-nazwa.jpg","newName":"nowa-nazwa.jpg"}'

# Delete
curl -X DELETE 'http://localhost:3000/api/media?path=ogloszenia/plik.jpg'

# Pobieranie pliku
curl 'http://localhost:3000/api/media/file?path=ogloszenia/plik.jpg' -o downloaded.jpg
```

### Frontend (fetch)

```typescript
// Listowanie
const response = await fetch('/api/media?path=ogloszenia');
const data: MediaListResponse = await response.json();

// Upload
const formData = new FormData();
formData.append('path', 'ogloszenia');
formData.append('file', fileInput.files[0]);

await fetch('/api/media/upload', {
  method: 'POST',
  body: formData
});

// Delete
await fetch('/api/media?path=ogloszenia/plik.jpg', {
  method: 'DELETE'
});
```

## 🔮 Przyszłe rozszerzenia (opcjonalne)

- Thumbnail generation (`/api/media/thumbnail?path=...&w=256`)
- Range requests dla video (streaming)
- Magic bytes validation (file-type package)
- Przeszukiwanie plików
- Tagowanie/metadata
- Uprawnienia per folder

