import get from 'lodash/get';
import { createElement, lazy, useCallback, useMemo } from 'react';

import store, { persistor } from 'store';

export default ({ props, render }) => {
  const locale = useMemo(() => get(store.getState(), ['settings', 'locale']));
  const load = useCallback(
    () =>
      new Promise((resolve) => window.setTimeout(resolve, 5000)).then(() => ({
        default: render,
      })),
    [render]
  );
  const Render = useCallback(() => createElement(lazy(load)), [load]);

  return { Render, locale, persistor, props, store };
};
