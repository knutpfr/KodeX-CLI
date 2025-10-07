# KodeX CLI 🚀

Ein intelligenter CLI-Tool zum Verwalten und Bündeln deiner Code-Komponenten. Organisiere HTML, CSS und JavaScript Snippets in einer strukturierten JSON-basierten Bibliothek und generiere daraus Bundle-Dateien oder separate Komponenten.

**Entwickelt von [@knutpfr](https://github.com/knutpfr)**  
**Repository: [KodeX-CLI](https://github.com/knutpfr/KodeX-CLI)**

## ✨ Features

### 🎯 **Komponentenverwaltung**
- **JSON-basierte Komponenten** - Einfache Struktur für Code-Snippets
- **Multi-Language Support** - HTML, CSS, JavaScript (erweiterbar)
- **Gruppierung** - Optionale Kategorisierung von Komponenten
- **Beispiel-Template** - Vorlage für neue Komponenten

<<<<<<< HEAD
### 🎨 **Professionelle CLI-Navigation**
- **Pfeiltasten-Navigation** - Intuitive Bedienung wie ein echtes CLI-Tool
- **Checkbox-Interface** - Mehrfachauswahl mit Space-Taste
- **Drei-Schritt-Prozess** - Kategorien → Gruppen → Komponenten
- **Intelligente Gruppierung** - Eine Gruppe auswählen = alle Komponenten
=======
## Screenshot

<img width="720" height="557" alt="grafik" src="https://github.com/user-attachments/assets/63623094-89b1-458d-889a-cc57da008388" />


## Installation
>>>>>>> 3b24f11b60abce96da39dc4a45afcc4b82bc022d

### 📦 **Flexible Ausgabe**
- **Bundle-Modus** - Alle Dateien gleichen Typs in einer Datei
- **Separate Dateien** - Jede Komponente als eigene Datei
- **Duplikat-Support** - Alle ausgewählten Komponenten werden berücksichtigt
- **Eindeutige Dateinamen** - Automatische ID-Vergabe bei Duplikaten

### 🛠️ **Developer Experience**
- **Farbige Ausgabe** - Typ-spezifische Farbkodierung
- **Benutzerfreundliche Steuerung** - Klare Anweisungen und Feedback
- **Fehlerbehandlung** - Robuste Validierung und Error Messages
- **Konfigurierbar** - Anpassbare Farben über config.json

## 📋 Voraussetzungen

- **Node.js** (Version 14 oder höher)
- **npm** (normalerweise mit Node.js installiert)

## 🚀 Installation & Setup

### 1. Repository klonen
```bash
git clone https://github.com/knutpfr/KodeX-CLI.git
cd KodeX-CLI
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. CLI-Tool starten
```bash
npm start
```

## 📖 Getting Started

### Demo-Komponenten verwenden
Das Projekt enthält vorgefertigte Demo-Komponenten zum Ausprobieren:

```bash
npm start  # Startet mit Demo-Komponenten
```

### Eigene Komponenten erstellen
1. **Demo-Komponenten löschen** (optional):
   ```bash
   # Windows PowerShell
   Remove-Item "components\*.json" -Exclude "example-template.json"
   
   # macOS/Linux
   find components -name "*.json" ! -name "example-template.json" -delete
   ```

2. **Neue Komponente erstellen**:
   - Kopiere `components/example-template.json`
   - Benenne sie um (z.B. `my-button.json`)
   - Bearbeite die JSON-Struktur

### Farben anpassen
Bearbeite `config.json` um die Farben anzupassen:
```json
{
  "ui": {
    "typeColors": {
      "html": "#e34c26",
      "css": "#1572b6", 
      "js": "#f7df1e",
      "typescript": "#3178c6"
    }
  }
}
```

## Komponenten-Schema

Jede JSON-Datei im `components/` Ordner muss folgendes Schema haben:

```json
{
  "title": "Komponenten-Titel",
  "description": "Beschreibung der Komponente",
  "type": "html|css|js|...",
  "content": "Der eigentliche Code-Inhalt"
}
```

## Eigene Komponenten hinzufügen

### 1. Neue JSON-Datei erstellen
Erstelle eine neue `.json` Datei im `components/` Ordner:

```bash
# Beispiel: components/my-component.json
```

### 2. Schema verwenden
```json
{
  "title": "Meine Komponente",
  "description": "Eine kurze Beschreibung was die Komponente macht",
  "type": "css",
  "content": ".my-class {\n  color: blue;\n  font-size: 16px;\n}"
}
```

### 3. Verfügbare Typen
- `html` - HTML-Komponenten
- `css` - CSS-Styles und Klassen
- `js` - JavaScript-Code
- `typescript` - TypeScript-Code
- `json` - JSON-Konfigurationen
- `xml` - XML-Strukturen
- `php` - PHP-Code
- `python` - Python-Code
- Oder jeden anderen Typ - wird automatisch erkannt!

### 4. Automatische Erkennung
Das CLI erkennt neue Komponenten automatisch beim nächsten Start. Keine Neukonfiguration notwendig!

### 5. Tipps für den Content
```json
{
  "content": "Mehrzeiliger Content\nmit \\n für Zeilenumbrüche\nund \\t für Tabs"
}
```

## Ordnerstruktur

```
CLI-Tool/
├── cli.js              # Haupt-CLI-Script
├── package.json        # NPM-Konfiguration
├── config.json         # Farbkonfiguration
├── components/         # JSON-Komponenten
│   ├── html-sample.json
│   ├── css-sample.json
│   └── js-sample.json
├── dist/              # Generierte Dateien
└── README.md
```

## Beispiel-Workflow

1. **Neue Komponente hinzufügen:**
   ```json
   // components/button.json
   {
     "title": "Primary Button",
     "description": "Stylized primary button component",
     "type": "css",
     "content": ".btn-primary { background: #007bff; color: white; }"
   }
   ```

2. **CLI ausführen:**
   ```bash
   npm start
   ```

3. **Komponenten auswählen** (Multi-Select)

4. **Bundle-Option wählen**

5. **Generierte Dateien** im `dist/` Ordner verwenden

## CLI-Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `npm start` | Komponenten-Generator starten |
| `npm run list` | Alle verfügbaren Komponenten anzeigen |
| `npm run config` | Konfigurationshilfe anzeigen |
| `node cli.js init` | Projekt initialisieren |
| `node cli.js build` | Komponenten erstellen (Standard) |

## Steuerung

### Tastenkombinationen
- **↑↓** - Navigation
- **Space/Enter** - Auswahl/Abwahl
- **Enter** - Bestätigen (grün markiert)
- **Esc/Backspace/Delete** - Zurück/Abbrechen (rot markiert)

### Visuelle Hinweise
- **Kategorien** werden in typspezifischen Farben angezeigt
- **HTML** - Orange-Rot (#e34c26)
- **CSS** - Blau (#1572b6)
- **JavaScript** - Gelb (#f7df1e)
- **TypeScript** - Blau (#3178c6)

## Entwicklung

Das CLI erkennt automatisch:
- Neue `.json` Dateien im `components/` Ordner
- Verfügbare Dateitypen basierend auf dem `type` Feld
- Erstellt entsprechende Dateiendungen (`.html`, `.css`, `.js`, etc.)

## Lizenz

MIT
