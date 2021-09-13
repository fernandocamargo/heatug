const isEqual = require('lodash/isEqual');
const { createMacro } = require('babel-plugin-macros');
const { Hash } = require('./helpers');

function macro({
  babel: {
    types: {
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
      stringLiteral,
      variableDeclaration,
      variableDeclarator,
    },
  },
  state: {
    file: { path: program },
    filename,
  },
  source,
}) {
  const hash = new Hash(filename);

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
                identifier(hash.forwardRef),
                identifier('forwardRef')
              )
            ),
            stringLiteral('react')
          ),
          importDeclaration(
            [importSpecifier(identifier(hash.Root), identifier('Root'))],
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
            callExpression(identifier(hash.forwardRef), [
              arrowFunctionExpression(
                [identifier('props'), identifier('ref')],
                jSXElement(
                  jSXOpeningElement(jSXIdentifier(hash.Root), [
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
                  jSXClosingElement(jSXIdentifier(hash.Root)),
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
