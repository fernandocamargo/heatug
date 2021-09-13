import React, { forwardRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider as Theming } from '@mui/material/styles';

import theme from 'themes/default';
import { Style } from 'components';

export default forwardRef(({ render: Render, props }, ref) => (
  <Theming theme={theme}>
    <Style />
    <Router>
      <Render {...props} ref={ref} />
    </Router>
  </Theming>
));
