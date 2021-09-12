const React = require('heatug/src/macros/core/root/macro');
const { ThemeProvider: Theming } = require('@mui/material/styles');
const theme = require('themes/default');
const { Style } = require('components');

module.exports = ({ children }) => (
  <Theming theme={theme}>
    <Style />
    {children}
  </Theming>
);
