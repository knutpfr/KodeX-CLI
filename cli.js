#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
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

    // Verfügbare Gruppen für ausgewählte Typen ermitteln
    getAvailableGroups(selectedTypes) {
        const groups = new Set();
        
        this.components
            .filter(comp => selectedTypes.includes(comp.type))
            .forEach(comp => {
                if (comp.group) {
                    groups.add(`${comp.type}:${comp.group}`);
                }
            });
        
        return Array.from(groups).map(groupKey => {
            const [type, group] = groupKey.split(':');
            return { type, group };
        });
    }

    // Komponenten nach Gruppen strukturieren
    getComponentsByGroup(selectedTypes, selectedGroups = null) {
        const structure = {};
        
        this.components
            .filter(comp => selectedTypes.includes(comp.type))
            .forEach(comp => {
                const type = comp.type;
                const group = comp.group || null;
                
                // Wenn Gruppen ausgewählt wurden, nur diese berücksichtigen
                if (selectedGroups && group && !selectedGroups.some(g => g.type === type && g.group === group)) {
                    return;
                }
                
                if (!structure[type]) {
                    structure[type] = {};
                }
                
                if (group) {
                    if (!structure[type][group]) {
                        structure[type][group] = [];
                    }
                    structure[type][group].push(comp);
                } else {
                    if (!structure[type]['_ungrouped']) {
                        structure[type]['_ungrouped'] = [];
                    }
                    structure[type]['_ungrouped'].push(comp);
                }
            });
        
        return structure;
    }

    // Interaktive Komponentenauswahl mit Kategorien und optionalen Gruppen
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
        console.log(`${chalk.gray('│')} ${chalk.red('Ctrl+C')} - Programm beenden                  ${chalk.gray('│')}`);
        console.log(`${chalk.gray('│')} ${chalk.cyan('↑↓')}    - Navigation                          ${chalk.gray('│')}`);
        console.log(`${chalk.gray('└─────────────────────────────────────────────┘')}\n`);

        // Schritt 1: Kategorien auswählen
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

            const { types: selectedTypesResult } = await inquirer.prompt([{
                type: 'checkbox',
                name: 'types',
                message: 'Schritt 1/3: Welche Kategorien möchtest du auswählen?',
                choices: typeChoices,
                default: types, // Alle standardmäßig ausgewählt
                validate: (input) => {
                    return input.length > 0 ? true : 'Bitte wähle mindestens eine Kategorie aus.';
                }
            }]);

            selectedTypes = selectedTypesResult;
        }

        // Schritt 2: Gruppen auswählen (falls vorhanden)
        const availableGroups = this.getAvailableGroups(selectedTypes);
        let selectedGroups = null;

        if (availableGroups.length > 0) {
            console.log(`\n✨ ${chalk.cyan(availableGroups.length)} Gruppen gefunden`);
            
            const groupChoices = [
                {
                    name: chalk.white('✓ Alle Gruppen einschließen'),
                    value: 'all'
                },
                ...availableGroups.map(({ type, group }) => {
                    const typeColor = this.getTypeColor(type);
                    const componentsInGroup = this.components.filter(c => c.type === type && c.group === group).length;
                    return {
                        name: `${this.colorText(type.toUpperCase(), typeColor)} › ${chalk.white(group)} (${componentsInGroup} Komponenten)`,
                        value: { type, group }
                    };
                })
            ];

            const { groups } = await inquirer.prompt([{
                type: 'checkbox',
                name: 'groups',
                message: 'Schritt 2/3: Welche Gruppen möchtest du einschließen?',
                choices: groupChoices,
                default: ['all'], // Alle standardmäßig ausgewählt
                validate: (input) => {
                    return input.length > 0 ? true : 'Bitte wähle mindestens eine Gruppe aus.';
                }
            }]);

            // Wenn "all" nicht ausgewählt wurde, nur spezifische Gruppen verwenden
            if (!groups.includes('all')) {
                selectedGroups = groups.filter(g => g !== 'all');
            }
        }

        // Schritt 3: Komponenten mit robustem inquirer System auswählen
        return await this.selectComponentsWithInquirer(selectedTypes, selectedGroups);
    }

    // Robuste Komponentenauswahl mit inquirer
    async selectComponentsWithInquirer(selectedTypes, selectedGroups) {
        const componentStructure = this.getComponentsByGroup(selectedTypes, selectedGroups);
        const choices = [];
        const componentMap = new Map();
        const groupMap = new Map();

        // Choices für inquirer erstellen
        Object.entries(componentStructure).forEach(([type, groups]) => {
            const typeColor = this.getTypeColor(type);
            
            // Kategorie-Header (Sprache) - nur bei mehreren Sprachen
            if (selectedTypes.length > 1) {
                choices.push(new inquirer.Separator(`\n${this.colorText(`── ${type.toUpperCase()} ──`, typeColor)}`));
            }

            Object.entries(groups).forEach(([groupName, components]) => {
                // Gruppen-Header für echte Gruppen
                if (groupName !== '_ungrouped') {
                    const groupKey = `group_${type}_${groupName}`;
                    groupMap.set(groupKey, components);
                    
                    choices.push({
                        name: `${this.colorText(`📁 ${groupName.toUpperCase()}`, typeColor)} ${chalk.gray(`(${components.length} Komponenten)`)}`,
                        value: groupKey,
                        short: `Gruppe: ${groupName}`
                    });
                }

                // Komponenten hinzufügen
                components.forEach((comp, index) => {
                    const isGrouped = groupName !== '_ungrouped';
                    const prefix = isGrouped ? '  ' : '';
                    const bullet = this.colorText('•', typeColor);
                    
                    const compKey = `comp_${type}_${groupName}_${index}`;
                    componentMap.set(compKey, comp);
                    
                    choices.push({
                        name: `${prefix}${bullet} ${comp.title} - ${chalk.gray(comp.description)}`,
                        value: compKey,
                        short: comp.title
                    });
                });
            });
        });

        // Inquirer Prompt für Komponentenauswahl
        const { selectedItems } = await inquirer.prompt([{
            type: 'checkbox',
            name: 'selectedItems',
            message: 'Schritt 3/3: Welche Komponenten möchtest du verwenden?',
            choices: choices,
            pageSize: 15, // Mehr Items pro Seite anzeigen
            validate: (input) => {
                return input.length > 0 ? true : 'Bitte wähle mindestens eine Komponente oder Gruppe aus.';
            }
        }]);

        // Ausgewählte Items verarbeiten
        const finalComponents = [];
        let componentIndex = 0; // Eindeutiger Index für jede Komponente

        selectedItems.forEach(itemKey => {
            if (itemKey.startsWith('group_')) {
                // Gruppe ausgewählt - alle Komponenten hinzufügen
                const components = groupMap.get(itemKey);
                if (components) {
                    components.forEach(comp => {
                        // Jede Komponente bekommt einen eindeutigen Index
                        finalComponents.push({
                            ...comp,
                            _uniqueId: componentIndex++
                        });
                    });
                    console.log(`✅ Gruppe ausgewählt: ${chalk.green(components.length)} Komponenten hinzugefügt`);
                }
            } else if (itemKey.startsWith('comp_')) {
                // Einzelne Komponente ausgewählt
                const comp = componentMap.get(itemKey);
                if (comp) {
                    // Jede Komponente bekommt einen eindeutigen Index
                    finalComponents.push({
                        ...comp,
                        _uniqueId: componentIndex++
                    });
                }
            }
        });

        console.log(`\n🎉 ${chalk.green(finalComponents.length)} Komponenten insgesamt ausgewählt`);
        return finalComponents;
    }

    // Bundle-Option abfragen
    async askForBundle() {
        const { bundle } = await inquirer.prompt([{
            type: 'confirm',
            name: 'bundle',
            message: 'Möchtest du die Dateien nach Typ bündeln?',
            default: false
        }]);

        return bundle;
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
            // Eindeutigen Dateinamen erstellen (mit Index falls identische Titel)
            const uniqueFileName = comp._uniqueId !== undefined 
                ? `${comp.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${comp._uniqueId}.${comp.type}`
                : this.generateFileName(comp.title, comp.type);
                
            const filePath = path.join(this.distDir, uniqueFileName);
            
            fs.writeFileSync(filePath, comp.content, 'utf8');
            generatedFiles.push(uniqueFileName);
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
            
            // Inhalte kombinieren mit Kommentaren (auch identische Komponenten)
            const bundledContent = comps.map(comp => 
                `/* ${comp.title} - ${comp.description} ${comp._uniqueId !== undefined ? `(ID: ${comp._uniqueId})` : ''} */\n${comp.content}`
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
            
            // Nach Gruppen organisieren
            const grouped = {};
            compsOfType.forEach(comp => {
                const group = comp.group || '_ungrouped';
                if (!grouped[group]) grouped[group] = [];
                grouped[group].push(comp);
            });

            Object.entries(grouped).forEach(([groupName, components]) => {
                if (groupName !== '_ungrouped') {
                    console.log(`   ${chalk.gray('└─')} ${chalk.white(groupName)}`);
                }
                
                components.forEach(comp => {
                    const prefix = groupName !== '_ungrouped' ? '     ' : '   ';
                    console.log(`${prefix}${this.colorText('•', typeColor)} ${comp.title}`);
                    console.log(`${prefix}  ${chalk.gray(comp.description)}`);
                });
            });
        });

        console.log(`\n📊 Gesamt: ${chalk.cyan(this.components.length.toString())} Komponenten in ${chalk.cyan(types.length.toString())} Kategorien`);
        
        // Gruppenzählung
        const totalGroups = new Set();
        this.components.forEach(comp => {
            if (comp.group) totalGroups.add(`${comp.type}:${comp.group}`);
        });
        
        if (totalGroups.size > 0) {
            console.log(`🗂️  ${chalk.cyan(totalGroups.size.toString())} Gruppen verfügbar`);
        }
        
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