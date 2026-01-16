/**
 * vite-plugin-visual-edit
 * 
 * A Vite plugin for visual editing of React components.
 * Highlights elements, shows source locations, and enables in-browser content editing
 * with iframe communication support.
 * 
 * @packageDocumentation
 */

import type { Plugin, ResolvedConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { babelPluginVisualEdit } from './babel-plugin';
import { generateClientScript } from './client';
import type {
  VisualEditOptions,
  VisualEditConfig,
  VisualEditPluginReturn,
  VisualEditRequestData,
  VisualEditRequestMessage,
  VisualEditResponseMessage,
  VisualEditToggleMessage,
  VisualEditAPI,
} from './types';

/**
 * Default options for the Visual Edit plugin
 */
const DEFAULT_OPTIONS: Required<Omit<VisualEditOptions, 'exclude' | 'react'>> & {
  exclude: RegExp[];
} = {
  exclude: [/node_modules/, /components\/ui\//],
  persistState: true,
  submitTimeout: 10,
  showBadge: false,
  enableKeyboardShortcut: false,
  messageTypeDataRequest: 'visual-edit-request',
  messageTypeDataResponse: 'visual-edit-response',
  messageTypeToggle: 'visual-edit-toggle',
  defaultEnabled: false,
  colorHover: '#3b82f6',
  colorSelected: '#10b981',
  colorSubmit: '#10b981',
  attributeSourceLocation: 'data-source-location',
  attributeDynamicContent: 'data-dynamic-content',
};

/**
 * Creates the Visual Edit Vite plugin.
 * 
 * This plugin provides visual editing capabilities for React applications:
 * - Adds source location attributes to JSX elements via Babel
 * - Auto-injects a client-side script for hover highlighting and click forms
 * - Supports iframe communication via postMessage
 * - Only active in development mode
 * 
 * @param options - Configuration options
 * @returns Array of Vite plugins (editor plugin + configured react plugin)
 * 
 * @example
 * ```typescript
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import visualEdit from 'vite-plugin-visual-edit'
 * 
 * export default defineConfig({
 *   plugins: [
 *     ...visualEdit({
 *       defaultEnabled: false,
 *       showBadge: true,
 *     }),
 *   ],
 * })
 * ```
 */
export function visualEdit(options: VisualEditOptions = {}): VisualEditPluginReturn {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    exclude: options.exclude ?? DEFAULT_OPTIONS.exclude,
  };

  const {
    exclude,
    react: reactOptions = {},
    persistState,
    submitTimeout,
    showBadge,
    enableKeyboardShortcut,
    messageTypeDataRequest,
    messageTypeDataResponse,
    messageTypeToggle,
    defaultEnabled,
    colorHover,
    colorSelected,
    colorSubmit,
    attributeSourceLocation,
    attributeDynamicContent,
  } = resolvedOptions;

  let isDev = false;

  // Runtime configuration object
  const config: VisualEditConfig = {
    persistState,
    submitTimeout: submitTimeout * 1000, // Convert to milliseconds
    showBadge,
    enableKeyboardShortcut,
    messageTypeDataRequest,
    messageTypeDataResponse,
    messageTypeToggle,
    defaultEnabled,
    colorHover,
    colorSelected,
    colorSubmit,
    attributeSourceLocation,
    attributeDynamicContent,
  };

  // Main Vite plugin for injecting the client-side script
  const editorPlugin: Plugin = {
    name: 'vite-plugin-visual-edit',
    
    configResolved(resolvedConfig: ResolvedConfig) {
      isDev = resolvedConfig.mode === 'development' || resolvedConfig.command === 'serve';
    },

    transformIndexHtml(html: string) {
      // Only inject in development mode
      if (!isDev) {
        return html;
      }

      const script = generateClientScript(config);
      return html.replace('</body>', `${script}\n</body>`);
    },
  };

  // Configure the React plugin with our Babel plugin
  const reactPlugin = react({
    ...reactOptions,
    babel: {
      ...(reactOptions.babel as Record<string, unknown> | undefined),
      plugins: [
        ...((reactOptions.babel as Record<string, unknown[]> | undefined)?.plugins ?? []),
        [babelPluginVisualEdit, { exclude, attributeSourceLocation, attributeDynamicContent }],
      ],
    },
  });

  return [editorPlugin, reactPlugin];
}

// Default export
export default visualEdit;

// Named exports for advanced usage
export { babelPluginVisualEdit };

// Type exports
export type {
  VisualEditOptions,
  VisualEditConfig,
  VisualEditPluginReturn,
  VisualEditRequestData,
  VisualEditRequestMessage,
  VisualEditResponseMessage,
  VisualEditToggleMessage,
  VisualEditAPI,
};
