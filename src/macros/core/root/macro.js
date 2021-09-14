import { join, parse, relative } from 'path';
import { lstatSync } from 'fs';
import isEqual from 'lodash/isEqual';
import { sync as find } from 'glob';
import update from 'immutability-helper';
import { createMacro } from 'babel-plugin-macros';

import { absolute } from 'helpers/path';

import { Meta } from './helpers';

export const PATTERN =
  '*{\\[*\\]/,{skins/**/index,(hooks|i18n|index|routing|statics|style)}.js}';

export function macro({
  babel: {
    types: {
      addComment,
      arrayExpression,
      arrowFunctionExpression,
      callExpression,
      exportDefaultDeclaration,
      exportNamedDeclaration,
      identifier,
      importDeclaration,
      importSpecifier,
      jSXClosingElement,
      jSXAttribute,
      jSXElement,
      jSXExpressionContainer,
      jSXIdentifier,
      jSXOpeningElement,
      objectExpression,
      objectProperty,
      stringLiteral,
      variableDeclaration,
      variableDeclarator,
      ...types
    },
  },
  state: {
    file: { path: program },
    filename,
  },
  source,
}) {
  const { identifiers } = new Meta({ filename });
  const load = (path) =>
    arrowFunctionExpression(
      [],
      callExpression(types.import(), [
        addComment(
          stringLiteral(path),
          'leading',
          `webpackChunkName: "${path}"`
        ),
      ])
    );
  const extract = (path) => {
    const { dir: cwd } = parse(path);
    const found = find(PATTERN, { nocase: true, realpath: true, cwd });
    const check = (stack, file) => {
      const namespace = absolute(file);
      const itself = isEqual(file, filename);
      const checkable = lstatSync(file).isDirectory();
      const chunk = join(cwd, relative(cwd, file));
      const transform = () => {
        switch (true) {
          default:
            return {};
        }
      };

      console.log({ namespace });

      return update(stack, transform());
    };

    return found.reduce(check, { routing: {}, skins: {} });
  };
  const dependencies = extract(filename);

  return program.traverse({
    ImportDeclaration(path) {
      const {
        node: {
          source: { value },
          specifiers,
        },
        parentPath,
      } = path;
      const replace = () => {
        parentPath.unshiftContainer('body', [
          importDeclaration(
            specifiers.concat(
              importSpecifier(
                identifier(identifiers.forwardRef),
                identifier('forwardRef')
              )
            ),
            stringLiteral('react')
          ),
          importDeclaration(
            [importSpecifier(identifier(identifiers.Root), identifier('Root'))],
            stringLiteral('heatug/dist/components')
          ),
        ]);
      };
      const replaceable = isEqual(value, source);

      return void (replaceable && replace());
    },
    ExportDefaultDeclaration(path) {
      const {
        node: { declaration: render },
        parentPath,
      } = path;
      const replace = () => {
        parentPath.unshiftContainer('body', [
          exportNamedDeclaration(
            variableDeclaration('const', [
              variableDeclarator(identifier('render'), render),
            ])
          ),
        ]);
        path.replaceWith(
          exportDefaultDeclaration(
            callExpression(identifier(identifiers.forwardRef), [
              arrowFunctionExpression(
                [identifier('props'), identifier('ref')],
                jSXElement(
                  jSXOpeningElement(jSXIdentifier(identifiers.Root), [
                    jSXAttribute(
                      jSXIdentifier('dependencies'),
                      jSXExpressionContainer(arrayExpression([]))
                    ),
                    jSXAttribute(
                      jSXIdentifier('props'),
                      jSXExpressionContainer(identifier('props'))
                    ),
                    jSXAttribute(
                      jSXIdentifier('ref'),
                      jSXExpressionContainer(identifier('ref'))
                    ),
                    jSXAttribute(
                      jSXIdentifier('render'),
                      jSXExpressionContainer(identifier('render'))
                    ),
                  ]),
                  jSXClosingElement(jSXIdentifier(identifiers.Root)),
                  []
                )
              ),
            ])
          )
        );
        path.skip();
      };

      return void replace();
    },
  });
}

export default createMacro(macro);
