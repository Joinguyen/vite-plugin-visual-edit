import type { PluginObj, types as t } from '@babel/core';
import type { BabelPluginState } from './types';

const DYNAMIC_CONTENT_SYMBOL = Symbol('hasDynamicContent');

/**
 * Babel Plugin: Add Source Location Attributes
 *
 * Adds data-source-location and data-dynamic-content attributes to JSX elements.
 * 
 * @param context - Babel plugin context
 * @returns Babel plugin object
 */
export function babelPluginVisualEdit({ types }: { types: typeof t }): PluginObj<BabelPluginState> {
  return {
    name: 'visual-edit-source-location',
    visitor: {
      Program(_path, state) {
        const filename = state.filename || '';
        const normalizedPath = filename.replace(/\\/g, '/');

        const options = state.opts || {};
        const excludePatterns = options.exclude || [/node_modules/, /components\/ui\//];


        const shouldExclude = excludePatterns.some((pattern) => pattern.test(normalizedPath));
        if (shouldExclude) {
          return;
        }

        const srcMatch = normalizedPath.match(/(?:^|\/)(src\/.*)$/);
        if (!srcMatch) {
          return;
        }

        let relativePath = srcMatch[1];
        relativePath = relativePath.replace(/^src\//, '');
        relativePath = relativePath.replace(/\.(jsx?|tsx?)$/, '');

        state.set('filenameRelative', relativePath);
      },

      JSXElement: {
        exit(path, state) {
          const filenameRelative = state.get('filenameRelative');
          if (!filenameRelative) {
            return;
          }

          const openingElement = path.node.openingElement;

          const options = state.opts || {};
          const attributeSourceLocation = options.attributeSourceLocation || 'data-source-location';
          const attributeDynamicContent = options.attributeDynamicContent || 'data-dynamic-content';

          const hasSourceLocation = openingElement.attributes.some(
            (attr) => types.isJSXAttribute(attr) && attr.name?.name === attributeSourceLocation
          );

          if (hasSourceLocation) {
            return;
          }

          const loc = openingElement.loc?.start;
          if (!loc) {
            return;
          }

          const sourceLocation = `${filenameRelative}:${loc.line}:${loc.column}`;
          const hasDynamicContent = checkForDynamicContent(path, types);

          (path.node as unknown as Record<symbol, boolean>)[DYNAMIC_CONTENT_SYMBOL] = hasDynamicContent;

          openingElement.attributes.push(
            types.jsxAttribute(
              types.jsxIdentifier(attributeSourceLocation),
              types.stringLiteral(sourceLocation)
            )
          );

          openingElement.attributes.push(
            types.jsxAttribute(
              types.jsxIdentifier(attributeDynamicContent),
              types.stringLiteral(hasDynamicContent ? 'true' : 'false')
            )
          );
        },
      },
    },
  };
}

function checkForDynamicContent(
  path: { node: { children?: t.Node[] } },
  types: typeof t
): boolean {
  const children = path.node.children || [];

  for (const child of children) {
    if (types.isJSXExpressionContainer(child)) {
      const expression = child.expression;
      if (
        !types.isJSXEmptyExpression(expression) &&
        !(types.isNullLiteral && types.isNullLiteral(expression)) &&
        !(types.isIdentifier(expression) && expression.name === 'undefined')
      ) {
        return true;
      }
    }

    if (types.isJSXElement(child)) {
      if ((child as unknown as Record<symbol, boolean>)[DYNAMIC_CONTENT_SYMBOL]) {
        return true;
      }
    }

    if (types.isJSXFragment(child)) {
      if (checkFragmentForDynamicContent(child, types)) {
        return true;
      }
    }
  }

  return false;
}

function checkFragmentForDynamicContent(
  fragment: t.JSXFragment,
  types: typeof t
): boolean {
  const children = fragment.children || [];

  for (const child of children) {
    if (types.isJSXExpressionContainer(child)) {
      const expression = child.expression;
      if (
        !types.isJSXEmptyExpression(expression) &&
        !(types.isNullLiteral && types.isNullLiteral(expression)) &&
        !(types.isIdentifier(expression) && expression.name === 'undefined')
      ) {
        return true;
      }
    }

    if (types.isJSXElement(child)) {
      if ((child as unknown as Record<symbol, boolean>)[DYNAMIC_CONTENT_SYMBOL]) {
        return true;
      }
    }

    if (types.isJSXFragment(child)) {
      if (checkFragmentForDynamicContent(child, types)) {
        return true;
      }
    }
  }

  return false;
}

export default babelPluginVisualEdit;
