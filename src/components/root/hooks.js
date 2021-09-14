import get from 'lodash/get';
import invokeMap from 'lodash/invokeMap';
import { createElement, lazy, useCallback, useMemo } from 'react';

import store, { persistor } from 'store';

export const delay = (resolve) => window.setTimeout(resolve, 500);

export default ({ dependencies, props, render }) => {
  const locale = useMemo(() => get(store.getState(), ['settings', 'locale']));
  const wrap = useCallback(() => ({ default: render }), [render]);
  const load = useCallback(
    () => Promise.all(invokeMap(dependencies, 'load')).then(wrap),
    [wrap]
  );
  const Render = useCallback(() => createElement(lazy(load)), [load]);

  return { Render, locale, persistor, props, store };
};
