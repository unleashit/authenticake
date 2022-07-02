import { debugLog } from '@authenticake/common';
import http, { METHODS } from 'http';
import https from 'https';
import merge from 'lodash/merge';

export type NativeRequestArgs = [
  url: string,
  options?: http.RequestOptions,
  body?: { [key: string]: unknown },
  debug?: boolean,
];

interface Response<T> {
  headers: http.IncomingHttpHeaders;
  status?: number | string;
  // data: T | string;
  data: T;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

const makeRequest = Symbol('makeRequest');

const parseJsonIfNeeded = (d: unknown) => {
  if (typeof d !== 'string') return d;

  try {
    return JSON.parse(d);
  } catch (e) {
    return d;
  }
};

const NativeRequest = {
  async [makeRequest]<T>(
    method: Method,
    args: NativeRequestArgs,
  ): Promise<Response<T>> {
    const [url, options, body, debug = false] = args;

    return new Promise((resolve, reject) => {
      const target = new URL(url);
      const secure = target.protocol === 'https:';
      const httpOrHttps = secure || options?.port === 443 ? https : http;

      let PORT: string | number;
      if (options?.port) {
        PORT = options.port;
      } else if (target.port) {
        PORT = target.port;
      } else {
        PORT = secure ? 443 : 80;
      }

      console.log(method);
      // remove content-length header (case insensitive) if exists
      // as it needs to be recalculated
      if (options?.headers) {
        options.headers = Object.keys(options.headers)
          .filter((key) => key.toLowerCase() !== 'content-length')
          .reduce(
            (obj, prop) => ({
              ...obj,
              [prop]: options.headers![prop],
            }),
            {},
          );
      }

      const json = body ? JSON.stringify(body) : null;

      const defaultOpts = {
        protocol: target.protocol,
        hostname: target.hostname,
        port: PORT,
        path: target.pathname + target.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(json && { 'Content-Length': Buffer.byteLength(json) }),
        } as any,
      };

      const mergedOpts = merge(defaultOpts, options);

      debug &&
        debugLog.info(
          `Request options: ${JSON.stringify(mergedOpts, null, 2)}`,
        );

      const req = httpOrHttps.request(mergedOpts, (res) => {
        const buffers: Uint8Array[] = [];

        res.on('data', (chunk) => {
          buffers.push(chunk);
        });
        res.on('end', () => {
          const data = Buffer.concat(buffers).toString();

          const output: Response<T> = {
            status: res.statusCode,
            headers: res.headers,
            data: parseJsonIfNeeded(data),
          };

          resolve(output);
        });
      });

      req.on('error', (err) => {
        debugLog.error(err);
        reject(err);
      });

      if (json) {
        req.write(json);
      }

      req.end();
    });
  },

  async get<T>(...args: NativeRequestArgs): Promise<Response<T>> {
    return this[makeRequest]<T>('GET', args);
  },

  async post<T>(...args: NativeRequestArgs): Promise<Response<T>> {
    return this[makeRequest]<T>('POST', args);
  },

  async put<T>(...args: NativeRequestArgs): Promise<Response<T>> {
    return this[makeRequest]<T>('PUT', args);
  },

  async patch<T>(...args: NativeRequestArgs): Promise<Response<T>> {
    return this[makeRequest]<T>('PATCH', args);
  },

  async delete<T>(...args: NativeRequestArgs): Promise<Response<T>> {
    return this[makeRequest]<T>('DELETE', args);
  },

  async head<T>(...args: NativeRequestArgs): Promise<Response<T>> {
    return this[makeRequest]<T>('HEAD', args);
  },

  async options<T>(...args: NativeRequestArgs): Promise<Response<T>> {
    return this[makeRequest]<T>('OPTIONS', args);
  },
};

export default NativeRequest;
