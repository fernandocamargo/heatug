import get from 'lodash/get';
import { useMemo } from 'react';

import store, { persistor } from 'store';

export default () => {
  const locale = useMemo(() => get(store.getState(), ['settings', 'locale']));

  return { locale, persistor, store };
};
