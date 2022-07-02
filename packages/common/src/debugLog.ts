import debug from 'debug';

// import ServerAuth from '../modules/ServerAuth/ServerAuth';

export const debugLog = {
  info: debug('authenticake:info'),
  warning: debug('authenticake:warning'),
  error: debug('authenticake:error'),
  always: console.log,
} as const;

type DebugLevel = keyof Omit<typeof debugLog, 'always'>;

export const debugEnabled = (level: DebugLevel) => debugLog[level].enabled;

export const debugLogAlways = async (
  msg: string,
  level: DebugLevel = 'info',
  logger?: (...args: any) => void,
) => {
  const withStack = `${msg}\n\r${new Error().stack}`;

  try {
    // const { logger } = await ServerAuth();
    if (logger && logger !== console.error) {
      logger(withStack);
      return;
    }
  } catch (err) {
    console.error(err);
  }

  if (debugEnabled(level)) {
    debugLog[level](withStack);
    return;
  }

  if (level === 'error') {
    console.error(withStack);
  } else if (level === 'warning') {
    console.warn(withStack);
  } else {
    console.log(withStack);
  }
};
