const isEqual = require('lodash/isEqual');
const { createMacro } = require('babel-plugin-macros');

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
  },
  source,
}) {
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
                identifier('forwardRef123'),
                identifier('forwardRef')
              )
            ),
            stringLiteral('react')
          ),
          importDeclaration(
            [importSpecifier(identifier('Root'), identifier('Root'))],
            stringLiteral('@components')
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
              variableDeclarator(identifier('Render'), render),
            ])
          ),
        ]);
        path.replaceWith(
          exportDefaultDeclaration(
            callExpression(identifier('forwardRef123'), [
              arrowFunctionExpression(
                [identifier('props'), identifier('ref')],
                jSXElement(
                  jSXOpeningElement(jSXIdentifier('Render'), [
                    jSXAttribute(
                      jSXIdentifier('ref'),
                      jSXExpressionContainer(identifier('ref'))
                    ),
                  ]),
                  jSXClosingElement(jSXIdentifier('Render')),
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
