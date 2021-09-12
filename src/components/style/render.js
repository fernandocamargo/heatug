const property = require('lodash/property');
const { createGlobalStyle } = require('styled-components');

module.exports = createGlobalStyle`
  html {
    background-color: #fff;
    opacity: 1;
  }

  body {
    font-family: ${property('theme.typography.main')};
  }

  figure {
    margin: 0;
  }
`;
