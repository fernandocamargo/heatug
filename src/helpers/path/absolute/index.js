import { relative, resolve } from 'path';
import { cwd } from 'process';
import get from 'lodash/get';

import * as babel from 'babelrc';

import { ROOT } from './constants';

export default (path) => relative(resolve(cwd(), get(babel, ROOT)), path);
