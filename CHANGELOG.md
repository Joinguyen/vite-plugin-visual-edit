# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-16

### Added

- Initial release
- Visual highlighting of elements with `data-source-location` attribute
- Click-to-edit functionality with inline form
- postMessage communication for iframe embedding
- Toggle on/off via:
  - postMessage (`visual-edit-toggle`)
  - JavaScript API (`window.__VISUAL_EDIT__`)
  - Keyboard shortcut (Ctrl+Shift+E)
  - Badge UI
- Configurable options:
  - `persistState` - Save toggle state to localStorage
  - `submitTimeout` - Auto-hide loading timeout
  - `showBadge` - Show toggle badge
  - `enableKeyboardShortcut` - Enable keyboard toggle
  - `messageTypeDataRequest` - Custom request message type
  - `messageTypeDataResponse` - Custom response message type
  - `messageTypeToggle` - Custom toggle message type
  - `defaultEnabled` - Start enabled/disabled
- Babel plugin to add source location attributes to JSX elements
- TypeScript support with full type definitions
- Development mode only - no overhead in production
