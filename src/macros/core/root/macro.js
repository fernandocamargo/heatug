import { join, parse } from 'path';
import { lstatSync } from 'fs';
import isEqual from 'lodash/isEqual';
import matches from 'lodash/matches';
import match from 'minimatch';
import { sync as find } from 'glob';
import update from 'immutability-helper';
import { createMacro } from 'babel-plugin-macros';

import { absolute } from 'helpers/path';

import { Meta } from './helpers';

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
  console.clear();

  const { identifiers } = new Meta({ filename });
  const load = ({ file, webpackChunkName }) =>
    arrowFunctionExpression(
      [],
      callExpression(types.import(), [
        addComment(
          stringLiteral(file),
          'leading',
          `webpackChunkName: "${webpackChunkName}"`
        ),
      ])
    );
  const extract = ({
    input = { routing: { routes: [] }, skins: {} },
    directory,
    file,
  }) => {
    const cwd = file ? parse(file).dir : directory;
    const found = find(
      [
        '*{\\[*\\]/,',
        file ? '{skins/**/index,(hooks|i18n|routing|statics|style)}' : 'index',
        '.js}',
      ].join(''),
      { nocase: true, realpath: true, cwd }
    );
    const root = !!directory && found.find(matches(join(cwd, 'index.js')));

    console.log(JSON.stringify({ file, directory, found, root }, null, 2));

    const check = (output, item) => {
      const webpackChunkName = absolute(item);
      const { dir, name } = parse(item);
      const itself = isEqual(item, filename);
      const transform = () => {
        switch (true) {
          case match(item, '**/skins/*/index.js'):
            return {
              skins: { [parse(dir).name]: { $set: { webpackChunkName } } },
            };
          case isEqual(name.toLowerCase(), 'style'):
            return { skins: { default: { $set: { webpackChunkName } } } };
          case isEqual(name.toLowerCase(), 'index') && !itself:
            return { routing: { routes: { $push: [{ webpackChunkName }] } } };
          case ['hooks', 'i18n', 'statics'].includes(name):
            return { [name]: { $set: { webpackChunkName } } };
          case lstatSync(item).isDirectory():
            return extract({ directory: item, input: output });
          default:
            return {};
        }
      };

      return update(output, transform());
    };

    return found.reduce(check, input);
  };
  const dependencies = extract({ file: filename });

  console.log({ dependencies });

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
