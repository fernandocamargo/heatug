import { createMacro } from 'babel-plugin-macros';

console.log({ createMacro });

export function macro() {}

export default createMacro(macro);
