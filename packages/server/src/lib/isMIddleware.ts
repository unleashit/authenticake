const callsFnName = <T extends () => any>(fnName: string, fn: T): boolean => {
  const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
  const DEFAULT_PARAMS = /=[^,]+/gm;
  const FAT_ARROWS = /=>.*$/gm;

  const cleaned = fn
    .toString()
    .replace(COMMENTS, '')
    .replace(FAT_ARROWS, '')
    .replace(DEFAULT_PARAMS, '');

  const regExp = new RegExp(`${fnName}\\s*\\(.*\\)`, 'gm');
  // const NEXT = /next\(.*\)/gm;

  return regExp.test(cleaned);
};

export const isExpressMiddleware = <T extends () => any>(mw: T) =>
  typeof mw === 'function' && mw.length === 3 && callsFnName<T>('next', mw);

// export const isExpressMiddlewares = (mws: MiddlewareFnc[]) => {
//   return mws.every(isExpressMiddleware);
// };
