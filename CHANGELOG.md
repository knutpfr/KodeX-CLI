# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-10-08

### Added
- 🌍 **Full Internationalization Support**
  - English interface (default)
  - German interface (`"language": "de"` in config.json)
  - Automatic language loading based on configuration
  - Translation system with placeholder support
- 🎨 **Enhanced Controls Display**
  - Dynamic formatting for controls box
  - Auto-adjusting spacing for different languages
  - Colorized key indicators (Space, Enter, etc.)
- ⚙️ **Extended Configuration Options**
  - New `language` setting for interface language
  - Extended color configuration options
  - Better configuration documentation
- 📦 **Version Information**
  - Added `--version` command support
  - Version display in CLI
  - Updated package.json to 0.3.0
- 🚀 **Improved Developer Experience**
  - Better formatted output
  - Enhanced visual feedback
  - Cleaner code structure with modular translations

### Changed
- 🔄 **README.md Updates**
  - Added version badge
  - Updated documentation for new features
  - Added release notes section
  - Translated remaining German text to English
- 📂 **Project Structure**
  - Added `locales/` folder for translations
  - Added `.gitignore` file
  - Removed empty files

### Fixed
- 🛠️ **Controls Box Formatting**
  - Fixed alignment issues in different languages
  - Proper spacing calculation
  - Consistent box appearance

### Removed
- 🗑️ **Cleanup**
  - Removed empty `INTERNATIONALIZATION_SUMMARY.md`
  - Added proper `.gitignore` for cleaner repository

## [0.2.x] - Previous Releases
- Enhanced component management and bundling features
- Improved CLI navigation and user experience

## [0.1.x] - Initial Release
- Basic CLI tool functionality
- Component loading from JSON files
- Bundle and separate file generation