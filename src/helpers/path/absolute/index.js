import { relative, resolve } from 'path';
import { cwd } from 'process';
import get from 'lodash/get';

import { plugins } from 'babelrc';

export default (path) => {
  const base = get(plugins, [0, 1, 'root', 0]);

  return relative(resolve(cwd(), base), path);
};
