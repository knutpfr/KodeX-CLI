#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { MultiSelect, Select } = require('enquirer');
const chalk = require('chalk');

class ComponentBuilder {
    constructor() {
        this.componentsDir = path.join(process.cwd(), 'components');
        this.distDir = path.join(process.cwd(), 'dist');
        this.configPath = path.join(process.cwd(), 'config.json');
        this.components = [];
        this.config = this.loadConfig();
    }

    // Konfiguration laden
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configData = fs.readFileSync(this.configPath, 'utf8');
                return JSON.parse(configData);
            }
        } catch (error) {
            console.log('⚠️  Fehler beim Laden der Konfiguration, verwende Standardwerte');
        }
        
        // Fallback zu Standardkonfiguration
        return {
            ui: {
                colors: {
                    confirm: "#00ff00",
                    cancel: "#ff0000", 
                    selected: "#00bcd4",
                    unselected: "#666666"
                },
                typeColors: {
                    html: "#e34c26",
                    css: "#1572b6",
                    js: "#f7df1e",
                    javascript: "#f7df1e",
                    default: "#ffffff"
                }
            }
        };
    }

    // Farbe für Typ abrufen
    getTypeColor(type) {
        const typeColorMap = {
            html: 'red',
            css: 'blue', 
            js: 'yellow',
            javascript: 'yellow',
            typescript: 'cyan',
            json: 'gray',
            xml: 'magenta',
            php: 'magenta',
            python: 'green',
            java: 'yellow',
            go: 'cyan',
            rust: 'gray',
            c: 'gray',
            cpp: 'blue',
            default: 'white'
        };
        
        return typeColorMap[type.toLowerCase()] || typeColorMap.default;
    }

    // Farbiges Terminal-Text erstellen mit chalk
    colorText(text, colorName) {
        switch(colorName) {
            case 'red': return chalk.red(text);
            case 'blue': return chalk.blue(text);
            case 'yellow': return chalk.yellow(text);
            case 'green': return chalk.green(text);
            case 'cyan': return chalk.cyan(text);
            case 'magenta': return chalk.magenta(text);
            case 'gray': return chalk.gray(text);
            case 'white': return chalk.white(text);
            case 'confirm': return chalk.green(text);
            case 'cancel': return chalk.red(text);
            case 'selected': return chalk.cyan(text);
            default: return text;
        }
    }

    // Alle JSON-Komponenten laden
    loadComponents() {
        try {
            if (!fs.existsSync(this.componentsDir)) {
                console.log('❌ components/ Ordner nicht gefunden!');
                return false;
            }

            const files = fs.readdirSync(this.componentsDir)
                .filter(file => file.endsWith('.json'));

            if (files.length === 0) {
                console.log('❌ Keine JSON-Komponenten gefunden!');
                return false;
            }

            this.components = files.map(file => {
                const filePath = path.join(this.componentsDir, file);
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                return {
                    ...content,
                    filename: file
                };
            });

            return true;
        } catch (error) {
            console.log('❌ Fehler beim Laden der Komponenten:', error.message);
            return false;
        }
    }

    // Verfügbare Typen ermitteln
    getAvailableTypes() {
        const types = [...new Set(this.components.map(comp => comp.type))];
        return types.sort();
    }

    // Interaktive Komponentenauswahl mit Kategorien
    async selectComponents() {
        // Erste Auswahl: Kategorie (Typ) wählen
        const types = this.getAvailableTypes();
        
        if (types.length === 0) {
            console.log('❌ Keine Komponenten verfügbar');
            return [];
        }

        // Startup-Informationen anzeigen
        console.log(`📊 ${chalk.cyan(types.length)} Kategorien erkannt: ${types.map(t => this.colorText(t.toUpperCase(), this.getTypeColor(t))).join(', ')}`);
        console.log(`📦 ${chalk.cyan(this.components.length)} Komponenten insgesamt geladen`);
        
        // Steuerungsübersicht anzeigen
        console.log(`\n${chalk.gray('┌─ Steuerung ─────────────────────────────────┐')}`);
        console.log(`${chalk.gray('│')} ${chalk.cyan('Space')} - Element auswählen/abwählen          ${chalk.gray('│')}`);
        console.log(`${chalk.gray('│')} ${chalk.green('Enter')} - Auswahl bestätigen                  ${chalk.gray('│')}`);
        console.log(`${chalk.gray('│')} ${chalk.red('Esc')}   - Programm beenden                    ${chalk.gray('│')}`);
        console.log(`${chalk.gray('│')} ${chalk.cyan('↑↓')}    - Navigation                          ${chalk.gray('│')}`);
        console.log(`${chalk.gray('└─────────────────────────────────────────────┘')}\n`);

        // Wenn nur ein Typ vorhanden ist, direkt zu Komponenten
        let selectedTypes = types;
        if (types.length > 1) {
            const typeChoices = types.map(type => {
                const count = this.components.filter(c => c.type === type).length;
                const color = this.getTypeColor(type);
                return {
                    name: this.colorText(`${type.toUpperCase()}`, color) + ` (${count} Komponenten)`,
                    value: type
                };
            });

            const typePrompt = new MultiSelect({
                name: 'types',
                message: 'Welche Kategorien möchtest du auswählen?',
                choices: typeChoices,
                instructions: `
${chalk.gray('Legende:')}
  ${chalk.cyan('Space')} - Kategorie auswählen
  ${chalk.green('Enter')} - Kategorien bestätigen
  ${chalk.red('Esc')} - Programm schließen
  ${chalk.cyan('↑↓')} - Steuerung`,
                footer() {
                    const selected = this.selected.length;
                    return chalk.cyan(`[${selected} von ${types.length} Kategorien ausgewählt]`);
                },
                result(names) {
                    return Object.values(this.map(names));
                }
            });

            try {
                selectedTypes = await typePrompt.run();
                if (selectedTypes.length === 0) {
                    console.log('\n❌ Keine Kategorien ausgewählt');
                    return [];
                }
            } catch (error) {
                console.log('\n❌ Programm beendet');
                process.exit(0);
            }
        }

        // Zweite Auswahl: Komponenten aus gewählten Kategorien
        const choices = [];
        selectedTypes.forEach(type => {
            const typeColor = this.getTypeColor(type);
            
            // Kategorie-Header hinzufügen
            choices.push({
                name: this.colorText(`\n${type.toUpperCase()}`, typeColor),
                disabled: true,
                role: 'separator'
            });
            
            // Komponenten dieser Kategorie hinzufügen
            const componentsOfType = this.components.filter(comp => comp.type === type);
            componentsOfType.forEach(comp => {
                choices.push({
                    name: `${comp.title} - ${chalk.gray(comp.description)}`,
                    value: comp
                });
            });
        });

        const componentPrompt = new MultiSelect({
            name: 'components',
            message: 'Welche Komponenten möchtest du verwenden?',
            choices: choices,
            instructions: `
${chalk.gray('Legende:')}
  ${chalk.cyan('Space')} - Komponente auswählen
  ${chalk.green('Enter')} - Komponenten bestätigen
  ${chalk.red('Esc')} - Programm schließen
  ${chalk.cyan('↑↓')} - Steuerung`,
            footer() {
                const totalComponents = choices.filter(c => !c.disabled).length;
                return chalk.cyan(`[${this.selected.length} von ${totalComponents} Komponenten ausgewählt]`);
            },
            result(names) {
                return Object.values(this.map(names));
            }
        });

        try {
            const selected = await componentPrompt.run();
            return selected;
        } catch (error) {
            console.log('\n❌ Programm beendet');
            process.exit(0);
        }
    }

    // Bundle-Option abfragen
    async askForBundle() {
        const prompt = new Select({
            name: 'bundle',
            message: 'Dateien nach Typ bündeln?',
            choices: [
                { 
                    name: chalk.green('✓ Ja - Alle Dateien gleichen Typs zusammenfassen'), 
                    value: true 
                },
                { 
                    name: chalk.white('✗ Nein - Separate Dateien erstellen'), 
                    value: false 
                }
            ],
            instructions: `
${chalk.gray('Legende:')}
  ${chalk.cyan('↑↓')} - Navigation
  ${chalk.green('Enter')} - Bestätigen
  ${chalk.red('Esc')} - Programm schließen`
        });

        try {
            return await prompt.run();
        } catch (error) {
            console.log('\n❌ Programm beendet');
            process.exit(0);
        }
    }

    // Dateien generieren
    generateFiles(selectedComponents, bundle = false) {
        // Dist-Ordner erstellen falls nicht vorhanden
        if (!fs.existsSync(this.distDir)) {
            fs.mkdirSync(this.distDir);
        }

        if (bundle) {
            this.generateBundledFiles(selectedComponents);
        } else {
            this.generateSeparateFiles(selectedComponents);
        }
    }

    // Separate Dateien erstellen
    generateSeparateFiles(components) {
        const generatedFiles = [];

        components.forEach(comp => {
            const fileName = this.generateFileName(comp.title, comp.type);
            const filePath = path.join(this.distDir, fileName);
            
            fs.writeFileSync(filePath, comp.content, 'utf8');
            generatedFiles.push(fileName);
        });

        console.log('\n✅ Separate Dateien erstellt:');
        generatedFiles.forEach(file => console.log(`   📄 ${file}`));
    }

    // Gebündelte Dateien erstellen
    generateBundledFiles(components) {
        const typeGroups = {};
        
        // Nach Typ gruppieren
        components.forEach(comp => {
            if (!typeGroups[comp.type]) {
                typeGroups[comp.type] = [];
            }
            typeGroups[comp.type].push(comp);
        });

        const generatedFiles = [];

        // Für jeden Typ eine Datei erstellen
        Object.entries(typeGroups).forEach(([type, comps]) => {
            const fileName = `bundle.${type}`;
            const filePath = path.join(this.distDir, fileName);
            
            // Inhalte kombinieren mit Kommentaren
            const bundledContent = comps.map(comp => 
                `/* ${comp.title} - ${comp.description} */\n${comp.content}`
            ).join('\n\n');
            
            fs.writeFileSync(filePath, bundledContent, 'utf8');
            generatedFiles.push(fileName);
        });

        console.log('\n✅ Gebündelte Dateien erstellt:');
        generatedFiles.forEach(file => console.log(`   📦 ${file}`));
    }

    // Dateiname generieren
    generateFileName(title, type) {
        const sanitized = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        return `${sanitized}.${type}`;
    }

    // Verfügbare Komponenten auflisten
    listComponents() {
        if (!this.loadComponents()) return;

        console.log('\n📋 Verfügbare Komponenten:');
        console.log('=' .repeat(50));

        const types = this.getAvailableTypes();
        types.forEach(type => {
            const typeColor = this.getTypeColor(type);
            console.log(`\n🏷️  ${this.colorText(type.toUpperCase(), typeColor)}`);
            
            const compsOfType = this.components.filter(comp => comp.type === type);
            compsOfType.forEach(comp => {
                console.log(`   ${this.colorText('•', typeColor)} ${comp.title}`);
                console.log(`     ${chalk.gray(comp.description)}`);
            });
        });

        console.log(`\n📊 Gesamt: ${chalk.cyan(this.components.length.toString())} Komponenten in ${chalk.cyan(types.length.toString())} Kategorien`);
        
        // Konfigurationshilfe
        console.log(`\n⚙️  Konfiguration: ${chalk.cyan('config.json')} bearbeiten um Farben anzupassen`);
    }

    // Beispielkomponenten erstellen
    initProject() {
        console.log('🚀 Initialisiere Projekt...');
        
        // Components-Ordner erstellen
        if (!fs.existsSync(this.componentsDir)) {
            fs.mkdirSync(this.componentsDir);
            console.log('✅ components/ Ordner erstellt');
        }

        // Dist-Ordner erstellen
        if (!fs.existsSync(this.distDir)) {
            fs.mkdirSync(this.distDir);
            console.log('✅ dist/ Ordner erstellt');
        }

        console.log('✅ Projekt initialisiert! Beispielkomponenten sind bereits vorhanden.');
        console.log('\n🎯 Nächste Schritte:');
        console.log('   npm install');
        console.log('   npm start');
        console.log(`\n⚙️  Tipp: Bearbeite ${chalk.cyan('config.json')} um Farben und Steuerung anzupassen`);
    }

    // ASCII Art anzeigen
    showBanner() {
        console.log(chalk.cyan(`
  __    __                  __            __    __          ______   __        ______ 
/  |  /  |                /  |          /  |  /  |        /      \\ /  |      /      |
$$ | /$$/   ______    ____$$ |  ______  $$ |  $$ |       /$$$$$$  |$$ |      $$$$$$/ 
$$ |/$$/   /      \\  /    $$ | /      \\ $$  \\/$$/ ______ $$ |  $$/ $$ |        $$ |  
$$  $$<   /$$$$$$  |/$$$$$$$ |/$$$$$$  | $$  $$< /      |$$ |      $$ |        $$ |  
$$$$$  \\  $$ |  $$ |$$ |  $$ |$$    $$ |  $$$$  \\$$$$$$/ $$ |   __ $$ |        $$ |  
$$ |$$  \\ $$ \\__$$ |$$ \\__$$ |$$$$$$$$/  $$ /$$  |       $$ \\__/  |$$ |_____  _$$ |_ 
$$ | $$  |$$    $$/ $$    $$ |$$       |$$ |  $$ |       $$    $$/ $$       |/ $$   |
$$/   $$/  $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/         $$$$$$/  $$$$$$$$/ $$$$$$/ 
        `));
        console.log(chalk.gray('               Your Private Component Libary Bundler'));
        console.log(chalk.gray('                      Created by @knutpfr'));
        console.log(chalk.gray('               https://github.com/knutpfr/KodeX-CLI\n'));
    }

    // Hauptfunktion
    async run() {
        const args = process.argv.slice(2);
        const command = args[0] || 'build';

        // Banner nur bei 'start' oder 'build' anzeigen
        if (command === 'build' || args.length === 0) {
            this.showBanner();
        } else {
            console.log(chalk.cyan('🔧 CLI Component Builder'));
            console.log('=' .repeat(30));
        }

        switch (command) {
            case 'init':
                this.initProject();
                break;
            
            case 'list':
                this.listComponents();
                break;
            
            case 'config':
                console.log(`\n⚙️  Konfigurationsdatei: ${chalk.cyan('config.json')}`);
                console.log('\n📝 Verfügbare Einstellungen:');
                console.log('   • ui.typeColors - Farben für verschiedene Dateitypen');
                console.log('   • ui.colors - Allgemeine UI-Farben');
                console.log('   • output - Ausgabeeinstellungen');
                break;
            
            case 'build':
            default:
                if (!this.loadComponents()) return;

                const selected = await this.selectComponents();
                if (selected.length === 0) {
                    console.log('\n❌ Keine Komponenten ausgewählt');
                    return;
                }

                const bundle = await this.askForBundle();
                this.generateFiles(selected, bundle);

                console.log(`\n🎉 ${chalk.green(selected.length.toString())} Komponenten erfolgreich generiert!`);
                console.log(`📁 Dateien befinden sich in: ${chalk.cyan(this.distDir)}`);
                break;
        }
    }
}

// CLI ausführen
if (require.main === module) {
    const builder = new ComponentBuilder();
    builder.run().catch(error => {
        console.error('❌ Fehler:', error.message);
        process.exit(1);
    });
}

module.exports = ComponentBuilder;