import React, { forwardRef } from 'react';
import { Provider as StateManager } from 'react-redux';
import { PersistGate as StatePersistence } from 'redux-persist/integration/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider as Theming } from '@mui/material/styles';
import { IntlProvider as I18n } from 'react-intl';

import theme from 'themes/default';
import { Loader, Style } from 'components';

import use from './hooks';

export default forwardRef(({ render: Render, props }, ref) => {
  const { locale, persistor, store } = use(props);

  return (
    <Theming theme={theme}>
      <Style />
      <StateManager store={store}>
        <StatePersistence persistor={persistor} loading={<Loader />}>
          <Router>
            <I18n locale={locale}>
              <Render {...props} ref={ref} />
            </I18n>
          </Router>
        </StatePersistence>
      </StateManager>
    </Theming>
  );
});
