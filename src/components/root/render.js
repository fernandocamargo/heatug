import React, { forwardRef } from 'react';
import { ThemeProvider as Theming } from '@mui/material/styles';

import theme from 'themes/default';
import { Style } from 'components';

export default forwardRef(({ render: Render, props }, ref) => (
  <Theming theme={theme}>
    <Style />
    <Render {...props} ref={ref} />
  </Theming>
));
