const isEqual = require('lodash/isEqual');
const { createMacro } = require('babel-plugin-macros');

function macro({
  babel: {
    types: { importDeclaration, stringLiteral },
  },
  state: {
    file: { path: program },
  },
  source,
}) {
  program.traverse({
    ImportDeclaration(path) {
      const {
        node: {
          source: { value },
          specifiers,
        },
        parentPath,
      } = path;
      const replace = () => {
        parentPath.unshiftContainer(
          'body',
          importDeclaration(specifiers, stringLiteral('react'))
        );
        path.remove();
      };
      const itself = isEqual(value, source);

      return itself && replace();
    },
  });
}

module.exports = createMacro(macro);
