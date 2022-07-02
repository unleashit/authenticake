// import expressPino, { Options } from 'express-pino-logger';
// import pino from 'pino';

const { NODE_ENV, PINO_LOG_LEVEL } = process.env;
const isProd = NODE_ENV === 'production';

// const serializers: Options['serializers'] =
//   NODE_ENV !== 'production'
//     ? {
//         req: (req) => ({
//           method: req.method,
//           url: req.url,
//           user: req.raw.user,
//         }),
//         res: (res) => ({ statusCode: res.statusCode }),
//       }
//     : {};

// const logger = pino({
//   level: PINO_LOG_LEVEL || 'debug',
//   ...(!isProd && {
//     transport: {
//       target: 'pino-pretty',
//     },
//   }),
// });

// const expressLogger = expressPino({
//   logger,
//   // serializers,
// });

// const logger = expressPino({ logger: require('pino')() });

// const logger = expressPino(pinoLogger);

// export { logger, expressLogger };

export const logger = {
  info: (msg: string) => console.log(msg),
  warning: (msg: string) => console.log(msg),
  error: (msg: string) => console.log(msg),
};
