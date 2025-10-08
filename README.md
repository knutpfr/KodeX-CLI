# KodeX CLI 🚀

A smart CLI tool for managing and bundling your code components. Organize HTML, CSS and JavaScript snippets in a structured JSON-based library and generate bundle files or separate components.

**Developed by [@knutpfr](https://github.com/knutpfr)**  
**Repository: [KodeX-CLI](https://github.com/knutpfr/KodeX-CLI)**

## ✨ Features

### 🎯 **Component Management**
- **JSON-based components** - Simple structure for code snippets
- **Multi-language Support** - HTML, CSS, JavaScript (expandable)
- **Grouping** - Optional categorization of components
- **Example template** - Template for new components

### 🌍 **Internationalization**
- **English/German Support** - Switch language via config.json
- **Configurable interface** - All UI text is translatable
- **Default: English** - Clean English interface by default
- **Easy language switching** - Just change one setting

### 🎨 **Professional CLI Navigation**
- **Arrow key navigation** - Intuitive operation like a real CLI tool
- **Checkbox interface** - Multiple selection with Space key
- **Three-step process** - Categories → Groups → Components
- **Smart grouping** - Select one group = all components

### 📦 **Flexible Output**
- **Bundle mode** - All files of the same type in one file
- **Separate files** - Each component as its own file
- **Duplicate support** - All selected components are considered
- **Unique filenames** - Automatic ID assignment for duplicates

### 🛠️ **Developer Experience**
- **Colorized output** - Type-specific color coding
- **User-friendly controls** - Clear instructions and feedback
- **Error handling** - Robust validation and error messages
- **Configurable** - Customizable colors and language via config.json

## 📋 Prerequisites

- **Node.js** (Version 14 or higher)
- **npm** (usually installed with Node.js)

## 🚀 Installation & Setup

### 1. Clone repository
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

### Customize colors and language
Edit `config.json` to customize colors and language:
```json
{
  "language": "en",
  "ui": {
    "colors": {
      "primary": "#00bcd4",
      "success": "#00ff00",
      "error": "#ff0000"
    },
    "typeColors": {
      "html": "#e34c26",
      "css": "#1572b6", 
      "js": "#f7df1e",
      "typescript": "#3178c6"
    }
  }
}
```

### Language Configuration
- **English (default)**: `"language": "en"`
- **German**: `"language": "de"`

The interface language will automatically switch based on this setting.

## Component Schema

Each JSON file in the `components/` folder must have the following schema:

```json
{
  "title": "Component Title",
  "description": "Description of the component",
  "type": "html|css|js|...",
  "content": "The actual code content"
}
```

## Adding Your Own Components

### 1. Create new JSON file
Create a new `.json` file in the `components/` folder:

```bash
# Example: components/my-component.json
```

### 2. Use schema
```json
{
  "title": "My Component",
  "description": "A short description of what the component does",
  "type": "css",
  "content": ".my-class {\n  color: blue;\n  font-size: 16px;\n}"
}
```

### 3. Available types
- `html` - HTML components
- `css` - CSS styles and classes
- `js` - JavaScript code
- `typescript` - TypeScript code
- `json` - JSON configurations
- `xml` - XML structures
- `php` - PHP code
- `python` - Python code
- Or any other type - will be automatically recognized!

### 4. Automatic detection
The CLI automatically recognizes new components on next start. No reconfiguration necessary!

### 5. Tips for content
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

## Example Workflow

1. **Add new component:**
   ```json
   // components/button.json
   {
     "title": "Primary Button",
     "description": "Stylized primary button component",
     "type": "css",
     "content": ".btn-primary { background: #007bff; color: white; }"
   }
   ```

2. **Run CLI:**
   ```bash
   npm start
   ```

3. **Select components** (Multi-Select)

4. **Choose bundle option**

5. **Use generated files** from `dist/` folder

## CLI Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start component generator |
| `npm run list` | Show all available components |
| `npm run config` | Show configuration help |
| `node cli.js init` | Initialize project |
| `node cli.js build` | Create components (default) |

## Controls

### Key combinations
- **↑↓** - Navigation
- **Space/Enter** - Select/Deselect
- **Enter** - Confirm (marked green)
- **Esc/Backspace/Delete** - Back/Cancel (marked red)

### Visual hints
- **Categories** are displayed in type-specific colors
- **HTML** - Orange-Red (#e34c26)
- **CSS** - Blue (#1572b6)
- **JavaScript** - Yellow (#f7df1e)
- **TypeScript** - Blue (#3178c6)

## Entwicklung

Das CLI erkennt automatisch:
- Neue `.json` Dateien im `components/` Ordner
- Verfügbare Dateitypen basierend auf dem `type` Feld
- Erstellt entsprechende Dateiendungen (`.html`, `.css`, `.js`, etc.)

## Lizenz

MIT
