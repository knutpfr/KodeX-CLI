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
        this.localesDir = path.join(__dirname, 'locales');
        this.components = [];
        this.config = this.loadConfig();
        this.locale = this.loadLocale();
    }

    // Load configuration
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configData = fs.readFileSync(this.configPath, 'utf8');
                return JSON.parse(configData);
            }
        } catch (error) {
            console.log(this.t('errors.configLoadFailed'));
        }
        
        // Default configuration fallback
        return {
            language: "en",
            ui: {
                colors: {
                    confirm: "#00ff00",
                    cancel: "#ff0000", 
                    selected: "#00bcd4",
                    unselected: "#666666",
                    primary: "#00bcd4",
                    secondary: "#ffffff",
                    success: "#00ff00",
                    error: "#ff0000",
                    warning: "#ffa500",
                    info: "#0080ff"
                },
                typeColors: {
                    html: "#e34c26",
                    css: "#1572b6",
                    js: "#f7df1e",
                    javascript: "#f7df1e",
                    typescript: "#3178c6",
                    json: "#000000",
                    xml: "#ff6600",
                    php: "#777bb4",
                    python: "#3776ab",
                    java: "#ed8b00",
                    go: "#00add8",
                    rust: "#000000",
                    c: "#a8b9cc",
                    cpp: "#00599c",
                    default: "#ffffff"
                }
            },
            output: {
                bundleByDefault: false,
                createSubfolders: false,
                timestampFiles: false
            }
        };
    }

    // Load locale file
    loadLocale() {
        const language = this.config.language || 'en';
        const localePath = path.join(this.localesDir, `${language}.json`);
        
        try {
            if (fs.existsSync(localePath)) {
                const localeData = fs.readFileSync(localePath, 'utf8');
                return JSON.parse(localeData);
            }
        } catch (error) {
            console.warn(`Warning: Could not load locale ${language}, falling back to English`);
        }
        
        // Fallback to English
        try {
            const fallbackPath = path.join(this.localesDir, 'en.json');
            if (fs.existsSync(fallbackPath)) {
                const localeData = fs.readFileSync(fallbackPath, 'utf8');
                return JSON.parse(localeData);
            }
        } catch (error) {
            console.error('Could not load any locale files');
        }
        
        return {};
    }

    // Translate function with placeholder replacement
    t(key, replacements = {}) {
        const keys = key.split('.');
        let value = this.locale;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        
        // Replace placeholders
        if (typeof value === 'string') {
            return value.replace(/\{(\w+)\}/g, (match, placeholder) => {
                return replacements[placeholder] || match;
            });
        }
        
        return value || key;
    }

    // Get type color
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

    // Create colorized terminal text with chalk
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

    // Create formatted controls box with proper alignment
    createControlsBox() {
        const boxWidth = 45;
        const controls = [
            { key: this.t('ui.controls.space'), action: this.t('ui.controls.selectElement'), color: 'cyan' },
            { key: this.t('ui.controls.enter'), action: this.t('ui.controls.confirmSelection'), color: 'green' },
            { key: this.t('ui.controls.ctrlc'), action: this.t('ui.controls.cancel'), color: 'red' },
            { key: this.t('ui.controls.arrows'), action: this.t('ui.controls.navigate'), color: 'cyan' }
        ];

        // Create title with padding
        const title = this.t('ui.controls.title');
        const titlePadding = Math.max(0, Math.floor((boxWidth - title.length - 4) / 2));
        const titleLine = `┌─ ${title} ${'─'.repeat(titlePadding)}${'─'.repeat(boxWidth - title.length - titlePadding - 4)}┐`;

        let result = chalk.gray(titleLine) + '\n';

        controls.forEach(control => {
            const keyText = this.colorText(control.key, control.color);
            const keyLength = control.key.length; // Length without color codes
            const actionText = control.action;
            const spacing = boxWidth - keyLength - actionText.length - 5; // 5 for "│ ", " - ", "│"
            
            result += chalk.gray('│') + ' ' + keyText + ' - ' + actionText + ' '.repeat(Math.max(0, spacing)) + chalk.gray('│') + '\n';
        });

        result += chalk.gray('└' + '─'.repeat(boxWidth - 1) + '┘');
        return result;
    }

    // Load all JSON components
    loadComponents() {
        try {
            if (!fs.existsSync(this.componentsDir)) {
                console.log(this.t('errors.componentsNotFound'));
                return false;
            }

            const files = fs.readdirSync(this.componentsDir)
                .filter(file => file.endsWith('.json'));

            if (files.length === 0) {
                console.log(this.t('errors.noComponentsFound'));
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
            console.log(this.t('errors.componentLoadFailed'), error.message);
            return false;
        }
    }

    // Get available types
    getAvailableTypes() {
        const types = [...new Set(this.components.map(comp => comp.type))];
        return types.sort();
    }

    // Get available groups for selected types
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

    // Structure components by groups
    getComponentsByGroup(selectedTypes, selectedGroups = null) {
        const structure = {};
        
        this.components
            .filter(comp => selectedTypes.includes(comp.type))
            .forEach(comp => {
                const type = comp.type;
                const group = comp.group || null;
                
                // If groups are selected, only consider these
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

    // Interactive component selection with categories and optional groups
    async selectComponents() {
        // First selection: Choose category (type)
        const types = this.getAvailableTypes();
        
        if (types.length === 0) {
            console.log(this.t('errors.noComponentsAvailable'));
            return [];
        }

        // Show startup information
        console.log(this.t('messages.categoriesDetected', {
            count: types.length,
            types: types.map(t => this.colorText(t.toUpperCase(), this.getTypeColor(t))).join(', ')
        }));
        console.log(this.t('messages.componentsLoaded', { count: this.components.length }));
        
        // Show control overview with proper formatting
        console.log('\n' + this.createControlsBox() + '\n');

        // Step 1: Select categories
        let selectedTypes = types;
        if (types.length > 1) {
            const typeChoices = types.map(type => {
                const count = this.components.filter(c => c.type === type).length;
                const color = this.getTypeColor(type);
                return {
                    name: this.colorText(`${type.toUpperCase()}`, color) + ` (${count} ${this.t('ui.components')})`,
                    value: type
                };
            });

            const { types: selectedTypesResult } = await inquirer.prompt([{
                type: 'checkbox',
                name: 'types',
                message: this.t('prompts.categoriesPrompt'),
                choices: typeChoices,
                default: types, // All selected by default
                validate: (input) => {
                    return input.length > 0 ? true : this.t('prompts.categoriesValidation');
                }
            }]);

            selectedTypes = selectedTypesResult;
        }

        // Step 2: Select groups (if available)
        const availableGroups = this.getAvailableGroups(selectedTypes);
        let selectedGroups = null;

        if (availableGroups.length > 0) {
            console.log(`\n${this.t('messages.groupsFound', { count: availableGroups.length })}`);
            
            const groupChoices = [
                {
                    name: chalk.white(this.t('prompts.allGroups')),
                    value: 'all'
                },
                ...availableGroups.map(({ type, group }) => {
                    const typeColor = this.getTypeColor(type);
                    const componentsInGroup = this.components.filter(c => c.type === type && c.group === group).length;
                    return {
                        name: `${this.colorText(type.toUpperCase(), typeColor)} › ${chalk.white(group)} (${componentsInGroup} ${this.t('ui.components')})`,
                        value: { type, group }
                    };
                })
            ];

            const { groups } = await inquirer.prompt([{
                type: 'checkbox',
                name: 'groups',
                message: this.t('prompts.groupsPrompt'),
                choices: groupChoices,
                default: ['all'], // All selected by default
                validate: (input) => {
                    return input.length > 0 ? true : this.t('prompts.groupsValidation');
                }
            }]);

            // If "all" is not selected, use only specific groups
            if (!groups.includes('all')) {
                selectedGroups = groups.filter(g => g !== 'all');
            }
        }

        // Step 3: Select components with robust inquirer system
        return await this.selectComponentsWithInquirer(selectedTypes, selectedGroups);
    }

    // Robust component selection with inquirer
    async selectComponentsWithInquirer(selectedTypes, selectedGroups) {
        const componentStructure = this.getComponentsByGroup(selectedTypes, selectedGroups);
        const choices = [];
        const componentMap = new Map();
        const groupMap = new Map();

        // Create choices for inquirer
        Object.entries(componentStructure).forEach(([type, groups]) => {
            const typeColor = this.getTypeColor(type);
            
            // Category header (language) - only with multiple languages
            if (selectedTypes.length > 1) {
                choices.push(new inquirer.Separator(`\n${this.colorText(`── ${type.toUpperCase()} ──`, typeColor)}`));
            }

            Object.entries(groups).forEach(([groupName, components]) => {
                // Group header for real groups
                if (groupName !== '_ungrouped') {
                    const groupKey = `group_${type}_${groupName}`;
                    groupMap.set(groupKey, components);
                    
                    choices.push({
                        name: `${this.colorText(`📁 ${groupName.toUpperCase()}`, typeColor)} ${chalk.gray(`(${components.length} ${this.t('ui.components')})`)}`,
                        value: groupKey,
                        short: `${this.t('ui.group')}: ${groupName}`
                    });
                }

                // Add components
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

        // Inquirer prompt for component selection
        const { selectedItems } = await inquirer.prompt([{
            type: 'checkbox',
            name: 'selectedItems',
            message: this.t('prompts.componentsPrompt'),
            choices: choices,
            pageSize: 15, // Show more items per page
            validate: (input) => {
                return input.length > 0 ? true : this.t('prompts.componentsValidation');
            }
        }]);

        // Process selected items
        const finalComponents = [];
        let componentIndex = 0; // Unique index for each component

        selectedItems.forEach(itemKey => {
            if (itemKey.startsWith('group_')) {
                // Group selected - add all components
                const components = groupMap.get(itemKey);
                if (components) {
                    components.forEach(comp => {
                        // Each component gets a unique index
                        finalComponents.push({
                            ...comp,
                            _uniqueId: componentIndex++
                        });
                    });
                    console.log(this.t('messages.groupSelected', { count: chalk.green(components.length) }));
                }
            } else if (itemKey.startsWith('comp_')) {
                // Single component selected
                const comp = componentMap.get(itemKey);
                if (comp) {
                    // Each component gets a unique index
                    finalComponents.push({
                        ...comp,
                        _uniqueId: componentIndex++
                    });
                }
            }
        });

        console.log(`\n${this.t('messages.componentsSelected', { count: chalk.green(finalComponents.length) })}`);
        return finalComponents;
    }

    // Ask for bundle option
    async askForBundle() {
        const { bundle } = await inquirer.prompt([{
            type: 'confirm',
            name: 'bundle',
            message: this.t('prompts.bundlePrompt'),
            default: false
        }]);

        return bundle;
    }

    // Generate files
    generateFiles(selectedComponents, bundle = false) {
        // Create dist folder if it doesn't exist
        if (!fs.existsSync(this.distDir)) {
            fs.mkdirSync(this.distDir);
        }

        if (bundle) {
            this.generateBundledFiles(selectedComponents);
        } else {
            this.generateSeparateFiles(selectedComponents);
        }
    }

    // Create separate files
    generateSeparateFiles(components) {
        const generatedFiles = [];

        components.forEach(comp => {
            // Create unique filename (with index if identical titles)
            const uniqueFileName = comp._uniqueId !== undefined 
                ? `${comp.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${comp._uniqueId}.${comp.type}`
                : this.generateFileName(comp.title, comp.type);
                
            const filePath = path.join(this.distDir, uniqueFileName);
            
            fs.writeFileSync(filePath, comp.content, 'utf8');
            generatedFiles.push(uniqueFileName);
        });

        console.log(`\n${this.t('messages.separateFilesCreated')}`);
        generatedFiles.forEach(file => console.log(`   📄 ${file}`));
    }

    // Create bundled files
    generateBundledFiles(components) {
        const typeGroups = {};
        
        // Group by type
        components.forEach(comp => {
            if (!typeGroups[comp.type]) {
                typeGroups[comp.type] = [];
            }
            typeGroups[comp.type].push(comp);
        });

        const generatedFiles = [];

        // Create a file for each type
        Object.entries(typeGroups).forEach(([type, comps]) => {
            const fileName = `bundle.${type}`;
            const filePath = path.join(this.distDir, fileName);
            
            // Combine contents with comments (including identical components)
            const bundledContent = comps.map(comp => 
                `/* ${comp.title} - ${comp.description} ${comp._uniqueId !== undefined ? `(ID: ${comp._uniqueId})` : ''} */\n${comp.content}`
            ).join('\n\n');
            
            fs.writeFileSync(filePath, bundledContent, 'utf8');
            generatedFiles.push(fileName);
        });

        console.log(`\n${this.t('messages.bundledFilesCreated')}`);
        generatedFiles.forEach(file => console.log(`   📦 ${file}`));
    }

    // Generate filename
    generateFileName(title, type) {
        const sanitized = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        return `${sanitized}.${type}`;
    }

    // List available components
    listComponents() {
        if (!this.loadComponents()) return;

        console.log(`\n${this.t('list.availableComponents')}`);
        console.log('=' .repeat(50));

        const types = this.getAvailableTypes();
        types.forEach(type => {
            const typeColor = this.getTypeColor(type);
            console.log(`\n🏷️  ${this.colorText(type.toUpperCase(), typeColor)}`);
            
            const compsOfType = this.components.filter(comp => comp.type === type);
            
            // Organize by groups
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

        console.log(`\n${this.t('list.totalStats', { 
            components: chalk.cyan(this.components.length.toString()), 
            categories: chalk.cyan(types.length.toString()) 
        })}`);
        
        // Group count
        const totalGroups = new Set();
        this.components.forEach(comp => {
            if (comp.group) totalGroups.add(`${comp.type}:${comp.group}`);
        });
        
        if (totalGroups.size > 0) {
            console.log(this.t('list.groupsAvailable', { count: chalk.cyan(totalGroups.size.toString()) }));
        }
        
        // Configuration help
        console.log(`\n${this.t('list.configHelp', { file: chalk.cyan('config.json') })}`);
    }

    // Initialize project
    initProject() {
        console.log(this.t('commands.initProject'));
        
        // Create components folder
        if (!fs.existsSync(this.componentsDir)) {
            fs.mkdirSync(this.componentsDir);
            console.log(this.t('commands.foldersCreated', { folder: 'components/' }));
        }

        // Create dist folder
        if (!fs.existsSync(this.distDir)) {
            fs.mkdirSync(this.distDir);
            console.log(this.t('commands.foldersCreated', { folder: 'dist/' }));
        }

        console.log(this.t('messages.projectInitialized'));
        console.log(`\n${this.t('messages.nextSteps')}`);
        console.log('   npm install');
        console.log('   npm start');
        console.log(`\n${this.t('messages.configTip', { file: chalk.cyan('config.json') })}`);
    }

    // Show ASCII Art banner
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
        console.log(chalk.gray(`               ${this.t('banner.tagline')}`));
        console.log(chalk.gray(`                      ${this.t('banner.creator')}`));
        console.log(chalk.gray(`               ${this.t('banner.github')}\n`));
    }

    // Main function
    async run() {
        const args = process.argv.slice(2);
        const command = args[0] || 'build';

        // Show banner only for 'start' or 'build'
        if (command === 'build' || args.length === 0) {
            this.showBanner();
        } else {
            console.log(chalk.cyan(this.t('banner.title')));
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
                console.log(`\n${this.t('commands.configFile', { file: chalk.cyan('config.json') })}`);
                console.log(`\n${this.t('commands.availableSettings')}`);
                console.log(this.t('commands.typeColorsSetting'));
                console.log(this.t('commands.generalColorsSetting'));
                console.log(this.t('commands.outputSetting'));
                console.log(this.t('commands.languageSetting'));
                break;
            
            case 'build':
            default:
                if (!this.loadComponents()) return;

                const selected = await this.selectComponents();
                if (selected.length === 0) {
                    console.log(`\n${this.t('errors.noComponentsSelected')}`);
                    return;
                }

                const bundle = await this.askForBundle();
                this.generateFiles(selected, bundle);

                console.log(`\n${this.t('messages.componentsGenerated', { count: chalk.green(selected.length.toString()) })}`);
                console.log(this.t('messages.filesLocation', { dir: chalk.cyan(this.distDir) }));
                break;
        }
    }
}

// Run CLI
if (require.main === module) {
    const builder = new ComponentBuilder();
    builder.run().catch(error => {
        console.error(`${builder.t ? builder.t('errors.error') : '❌ Error:'} ${error.message}`);
        process.exit(1);
    });
}

module.exports = ComponentBuilder;