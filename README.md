# Kurstage-App – CAS Strategic Brand Management

Eigenständige Web-App für die Rückmeldung zu Kurstagen (Passt/Passt nicht, Kommentare, Swatch-Kontaktvorschläge). Alle Antworten werden dauerhaft in einer SQLite-Datenbank gespeichert und sind für alle Nutzer:innen live sichtbar (Polling alle 15 Sekunden).

## Lokal starten

```bash
npm install
npm start
```

Die App läuft danach auf [http://localhost:3000](http://localhost:3000). Die Datenbankdatei `kurstage.db` wird beim ersten Start automatisch im Projektordner angelegt.

### Lokal testen

1. Im Browser `http://localhost:3000` öffnen.
2. Bei ein paar Kurstagen "✓ Passt" / "✕ Passt nicht" klicken und einen Kommentar eintragen.
3. Die Seite in einem zweiten Browser-Tab (oder Browser) ebenfalls öffnen – die Rückmeldungen erscheinen dort nach spätestens 15 Sekunden ebenfalls (Live-Polling).
4. Server stoppen (`Strg+C`) und neu starten (`npm start`) – die Rückmeldungen sind weiterhin da (persistiert in `kurstage.db`).

## Deployment auf Railway

Railway ist die einfachste Option: kein eigener Server nötig, persistenter Speicher lässt sich mit einem Klick einrichten.

1. **Code auf GitHub hochladen.** Falls noch kein GitHub-Repo existiert:
   - Auf [github.com](https://github.com) einloggen, oben rechts auf **"+"** → **"New repository"** klicken, einen Namen vergeben (z.B. `kurstage-app`) und erstellen.
   - Danach entweder im Terminal im Projektordner:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/<dein-username>/kurstage-app.git
     git push -u origin main
     ```
   - Oder für kleine Projekte per Drag-and-Drop: Im leeren Repo auf GitHub auf "uploading an existing file" klicken und den Projektordner-Inhalt hineinziehen.
2. Auf [railway.app](https://railway.app) mit dem GitHub-Account anmelden.
3. **"New Project"** → **"Deploy from GitHub repo"** → das Repo `kurstage-app` auswählen.
4. Railway erkennt automatisch, dass es sich um eine Node.js-App handelt, installiert die Abhängigkeiten und startet sie.
5. Im Projekt auf **"Settings"** → **"Generate Domain"** klicken, um eine öffentliche URL zu erhalten.
6. **Wichtig für die dauerhafte Speicherung:** Im Projekt auf **"Add Volume"** klicken, es unter `/data` einhängen, und als Umgebungsvariable (unter **"Variables"**) `DB_PATH=/data/kurstage.db` setzen – sonst geht die Datenbank bei jedem neuen Deploy verloren.
7. Fertig – die URL aus Schritt 5 kann jetzt an alle Dozierenden verschickt werden.

## Umgebungsvariablen

| Variable  | Standardwert       | Beschreibung                                  |
|-----------|---------------------|------------------------------------------------|
| `DB_PATH` | `./kurstage.db`     | Pfad zur SQLite-Datenbankdatei                  |
| `PORT`    | `3000`              | Port, auf dem der Server lauscht (Railway setzt dies automatisch) |

## Technischer Hinweis zur Datenbank

Für die Persistenz wird das in Node.js eingebaute `node:sqlite`-Modul verwendet (kein separates Datenbank-Package nötig, keine native Kompilierung beim Deployment). Das erfordert **Node.js 22.5 oder neuer** – siehe `engines` in `package.json`. Railway installiert bei Bedarf automatisch eine passende Node-Version.

## Hinweise

- Keine Login/Auth – die Seite ist für eine kleine, bekannte Gruppe von Dozierenden gedacht, alle API-Endpunkte sind offen.
- Design, Texte und der komplette Kurstage-Datensatz entsprechen 1:1 dem ursprünglichen Prototyp.
