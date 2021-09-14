import get from 'lodash/get';
import { createElement, lazy, useCallback, useMemo } from 'react';

import store, { persistor } from 'store';

export const delay = (resolve) => window.setTimeout(resolve, 500);

export default ({ props, render }) => {
  const locale = useMemo(() => get(store.getState(), ['settings', 'locale']));
  const wrap = useCallback(() => ({ default: render }), [render]);
  const load = useCallback(() => new Promise(delay).then(wrap), [wrap]);
  const Render = useCallback(() => createElement(lazy(load)), [load]);

  return { Render, locale, persistor, props, store };
};
