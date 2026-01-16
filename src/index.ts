/**
 * vite-plugin-visual-edit
 * 
 * A Vite plugin for visual editing of React components.
 * Highlights elements, shows source locations, and enables in-browser content editing
 * with iframe communication support.
 * 
 * @packageDocumentation
 */

import { type Plugin, type ResolvedConfig, createFilter } from 'vite';
import { transformAsync } from '@babel/core';
import { babelPluginVisualEdit } from './babel-plugin';
import { generateClientScript } from './client';
import type {
  VisualEditOptions,
  VisualEditConfig,
  VisualEditRequestData,
  VisualEditRequestMessage,
  VisualEditResponseMessage,
  VisualEditToggleMessage,
  VisualEditAPI,
  VisualEditLanguage,
  VisualEditTranslation,
} from './types';

const DEFAULT_TRANSLATIONS: Record<VisualEditLanguage, VisualEditTranslation> = {
  en: { placeholder: 'What to change?' },
  ko: { placeholder: '무엇을 변경하시겠습니까?' },
  vn: { placeholder: 'Bạn muốn thay đổi gì?' },
  jp: { placeholder: '何を変更しますか？' },
  ch: { placeholder: '你想改什么？' },
};

/**
 * Default options for the Visual Edit plugin
 */
const DEFAULT_OPTIONS: Required<Omit<VisualEditOptions, 'exclude' | 'translations'>> & {
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
  messageTypeLanguage: 'visual-edit-language',
  defaultEnabled: false,
  colorHover: '#3b82f6',
  colorSelected: '#10b981',
  colorSubmit: '#10b981',
  attributeSourceLocation: 'data-source-location',
  attributeDynamicContent: 'data-dynamic-content',
  language: 'en',
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
 * @returns Vite plugin
 */
export function visualEdit(options: VisualEditOptions = {}): Plugin[] {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    exclude: options.exclude ?? DEFAULT_OPTIONS.exclude,
  };

  const {
    exclude,
    persistState,
    submitTimeout,
    showBadge,
    enableKeyboardShortcut,
    messageTypeDataRequest,
    messageTypeDataResponse,
    messageTypeToggle,
    messageTypeLanguage,
    defaultEnabled,
    colorHover,
    colorSelected,
    colorSubmit,
    attributeSourceLocation,
    attributeDynamicContent,
    language,
    translations: userTranslations,
  } = resolvedOptions;

  let isDev = false;
  
  // Create filter for transformation
  const filter = createFilter(null, exclude);

  // Merge translations
  const translations = { ...DEFAULT_TRANSLATIONS };
  if (userTranslations) {
    (Object.keys(userTranslations) as VisualEditLanguage[]).forEach(lang => {
      if (userTranslations[lang]) {
        translations[lang] = {
          ...translations[lang],
          ...userTranslations[lang]
        } as VisualEditTranslation;
      }
    });
  }

  // Runtime configuration object
  const config: VisualEditConfig = {
    persistState,
    submitTimeout: submitTimeout * 1000, // Convert to milliseconds
    showBadge,
    enableKeyboardShortcut,
    messageTypeDataRequest,
    messageTypeDataResponse,
    messageTypeToggle,
    messageTypeLanguage,
    defaultEnabled,
    colorHover,
    colorSelected,
    colorSubmit,
    attributeSourceLocation,
    attributeDynamicContent,
    language,
    translations,
  };

  const plugin: Plugin = {
    name: 'vite-plugin-visual-edit',
    enforce: 'pre', // Run before @vitejs/plugin-react to add attributes before compilation
    
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

    async transform(code: string, id: string) {
      // Only transform in development mode
      if (!isDev) return null;
      
      // Filter files (exclude node_modules, etc.)
      if (!filter(id)) return null;
      
      // Only process likely React files
      if (!/\.(t|j)sx?$/.test(id)) return null;

      try {
        const result = await transformAsync(code, {
          filename: id,
          sourceMaps: true,
          plugins: [
            [babelPluginVisualEdit, { 
              exclude, 
              attributeSourceLocation, 
              attributeDynamicContent 
            }]
          ],
          // Minimal parser options to handle JSX and TS
          parserOpts: {
            plugins: [
              'jsx', 
              'typescript',
              'importMeta',
              'classProperties',
              'numericSeparator',
              'dynamicImport'
            ]
          },
          configFile: false,
          babelrc: false
        });

        if (result?.code) {
          return {
            code: result.code,
            map: result.map
          };
        }
        return null;
      } catch (e) {
        // If transformation fails, silently fail and return null (Vite will use original code)
        // console.warn('[vite-plugin-visual-edit] Failed to transform:', id, e);
        return null;
      }
    }
  };

  return [plugin];
}

// Default export
export default visualEdit;

// Named exports for advanced usage
export { babelPluginVisualEdit };

// Type exports
export type {
  VisualEditOptions,
  VisualEditConfig,
  VisualEditRequestData,
  VisualEditRequestMessage,
  VisualEditResponseMessage,
  VisualEditToggleMessage,
  VisualEditAPI,
};
