const { dirname, join, relative } = require('path');
const { lstatSync } = require('fs');
const isEqual = require('lodash/isEqual');
const { sync: find } = require('glob');
const update = require('immutability-helper');
const { createMacro } = require('babel-plugin-macros');
const { Meta } = require('./helpers');

const PATTERN =
  '*{\\[*\\]/,{skins/**/index,(hooks|i18n|index|routing|statics|style)}.js}';

function macro({
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
  const extract = (path) => {
    const cwd = dirname(path);
    const found = find(PATTERN, { nocase: true, realpath: true, cwd });
    const check = (stack, file) => {
      const itself = isEqual(file, filename);
      const checkable = lstatSync(file).isDirectory();
      const chunk = join(cwd, relative(cwd, file));

      return checkable
        ? stack
        : update(stack, {
            dependencies: {
              $push: [
                objectExpression([
                  objectProperty(
                    identifier('load'),
                    arrowFunctionExpression(
                      [],
                      callExpression(types.import(), [
                        addComment(
                          stringLiteral(chunk),
                          'leading',
                          `webpackChunkName: "${chunk}"`
                        ),
                      ])
                    )
                  ),
                ]),
              ],
            },
          });
    };

    return found.reduce(check, {
      stats: { routing: {}, skins: {} },
      dependencies: [],
    });
  };
  const { dependencies, stats } = extract(filename);

  console.log({ dependencies, stats });

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
                      jSXExpressionContainer(arrayExpression(dependencies))
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

module.exports = createMacro(macro);
