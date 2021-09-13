import React, { Suspense as OnDemand, forwardRef } from 'react';
import { Provider as StateManager } from 'react-redux';
import { PersistGate as StatePersistence } from 'redux-persist/integration/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider as Theming } from '@mui/material/styles';
import { IntlProvider as I18n } from 'react-intl';

import theme from 'themes/default';
import { Loader, Style } from 'components';

import use from './hooks';

export default forwardRef((props, ref) => {
  const { Render, locale, persistor, store, ...root } = use(props);

  return (
    <Theming theme={theme}>
      <Style />
      <StateManager store={store}>
        <StatePersistence persistor={persistor} loading={<Loader />}>
          <Router>
            <I18n locale={locale}>
              <OnDemand fallback={<Loader />}>
                <Render {...root.props} ref={ref} />
              </OnDemand>
            </I18n>
          </Router>
        </StatePersistence>
      </StateManager>
    </Theming>
  );
});
