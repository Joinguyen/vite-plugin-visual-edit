import type { PluginOption } from 'vite';

/**
 * Configuration options for the Visual Edit plugin
 */
export interface VisualEditOptions {
  /**
   * Babel exclude patterns - files matching these patterns won't have source location attributes added
   * @default [/node_modules/, /components\/ui\//]
   */
  exclude?: RegExp[];

  /**
   * Additional options to pass to @vitejs/plugin-react
   */
  react?: Record<string, unknown>;

  /**
   * Save toggle state to localStorage
   * @default true
   */
  persistState?: boolean;

  /**
   * Auto off loading timeout in seconds
   * @default 10
   */
  submitTimeout?: number;

  /**
   * Show toggle badge at bottom right corner
   * @default false
   */
  showBadge?: boolean;

  /**
   * Enable Ctrl+Shift+E keyboard shortcut to toggle
   * @default false
   */
  enableKeyboardShortcut?: boolean;

  /**
   * postMessage type for data request (sent to parent)
   * @default 'visual-edit-request'
   */
  messageTypeDataRequest?: string;

  /**
   * postMessage type for data response (received from parent)
   * @default 'visual-edit-response'
   */
  messageTypeDataResponse?: string;

  /**
   * postMessage type for toggle command
   * @default 'visual-edit-toggle'
   */
  messageTypeToggle?: string;

  /**
   * Default toggle state on first load
   * @default false
   */
  defaultEnabled?: boolean;

  /**
   * Color for hover highlight border
   * @default '#3b82f6' (blue-500)
   */
  colorHover?: string;

  /**
   * Color for selected element border
   * @default '#10b981' (green-500)
   */
  colorSelected?: string;

  /**
   * Color for submit button (also used for selected state)
   * @default '#10b981' (green-500)
   */
  colorSubmit?: string;
}

/**
 * Data sent via postMessage when user submits a change
 */
export interface VisualEditRequestData {
  /**
   * Source location in format "path/to/file:line:column"
   */
  sourceLocation: string;

  /**
   * Content entered by the user
   */
  content: string;

  /**
   * HTML tag name of the clicked element (lowercase)
   */
  element: string | null;
}

/**
 * postMessage payload for requests
 */
export interface VisualEditRequestMessage {
  type: string;
  data: VisualEditRequestData;
}

/**
 * postMessage payload for responses
 */
export interface VisualEditResponseMessage {
  type: string;
  success: boolean;
  error?: string;
}

/**
 * postMessage payload for toggle commands
 */
export interface VisualEditToggleMessage {
  type: string;
  enabled?: boolean;
}

/**
 * Global API exposed on window.__VISUAL_EDIT__
 */
export interface VisualEditAPI {
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  isEnabled: () => boolean;
  config: VisualEditConfig;
}

/**
 * Internal configuration object (runtime)
 */
export interface VisualEditConfig {
  persistState: boolean;
  submitTimeout: number;
  showBadge: boolean;
  enableKeyboardShortcut: boolean;
  messageTypeDataRequest: string;
  messageTypeDataResponse: string;
  messageTypeToggle: string;
  defaultEnabled: boolean;
  colorHover: string;
  colorSelected: string;
  colorSubmit: string;
}

/**
 * Babel plugin state
 */
export interface BabelPluginState {
  filename?: string;
  opts?: {
    exclude?: RegExp[];
  };
  get: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
}

/**
 * Return type of the visualEdit function
 */
export type VisualEditPluginReturn = PluginOption[];
