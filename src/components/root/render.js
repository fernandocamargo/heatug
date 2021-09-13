import React, { forwardRef } from 'react';
import { Provider as StateManager } from 'react-redux';
import { PersistGate as StatePersistence } from 'redux-persist/integration/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider as Theming } from '@mui/material/styles';

import theme from 'themes/default';
import { Style } from 'components';

import use from './hooks';

export default forwardRef(({ render: Render, props }, ref) => {
  const { store } = use(props);

  return (
    <Theming theme={theme}>
      <Style />
      <Router>
        <Render {...props} ref={ref} />
      </Router>
    </Theming>
  );
});
