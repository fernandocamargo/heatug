import React, { forwardRef } from 'react';
import { Provider as StateManager } from 'react-redux';
import { PersistGate as StatePersistence } from 'redux-persist/integration/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider as Theming } from '@mui/material/styles';

import theme from 'themes/default';
import { Loader, Style } from 'components';

import use from './hooks';

export default forwardRef(({ render: Render, props }, ref) => {
  const { persistor, store } = use(props);

  return (
    <Theming theme={theme}>
      <Style />
      <StateManager store={store}>
        <StatePersistence persistor={persistor} loading={<Loader />}>
          <Router>
            <Render {...props} ref={ref} />
          </Router>
        </StatePersistence>
      </StateManager>
    </Theming>
  );
});
