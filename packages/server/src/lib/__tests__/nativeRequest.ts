import util from 'util';

import nativeRequest from '../nativeRequest';

const exec = util.promisify(require('child_process').exec);

const target = 'https://httpbin.org';
const sampleToken = '123';
const headers = {
  'Content-Type': 'application/json',
};

describe('nativeRequest', () => {
  let myIp: string;

  beforeAll(async () => {
    const { stdout } = await exec(
      'dig +short myip.opendns.com @resolver1.opendns.com',
    );

    [myIp] = stdout.split('\n');
  });

  it('performs a GET request', async () => {
    interface Data {
      origin: string;
    }

    const { data } = await nativeRequest.get<Data>(`${target}/ip`);
    typeof data === 'object' && expect(data.origin).toEqual(myIp);
  });

  it('performs GET request with Authorization header', async () => {
    interface Data {
      headers: { Authorization: string };
    }

    const { data } = await nativeRequest.get<Data>(`${target}/headers`, {
      headers: { ...headers, ...{ Authorization: `Bearer ${sampleToken}` } },
    });

    typeof data === 'object' &&
      expect(data.headers.Authorization).toEqual(`Bearer ${sampleToken}`);
  });

  it('performs a POST request with token in body', async () => {
    interface Data {
      json: { token: string };
    }

    const { data } = await nativeRequest.post<Data>(
      `${target}/post`,
      {},
      { token: sampleToken },
    );

    typeof data === 'object' && expect(data.json.token).toEqual(sampleToken);
  });

  it('performs a PUT request', async () => {
    interface Data {
      json: { email: string };
    }

    const email = 'me@me.com';

    const { data } = await nativeRequest.put<Data>(
      `${target}/put`,
      {},
      { email },
    );

    typeof data === 'object' && expect(data.json.email).toEqual(email);
  });

  it('performs a DELETE request', async () => {
    interface Data {
      json: { email: number };
    }

    const email = 'me@me.com';

    const { data } = await nativeRequest.delete<Data>(
      `${target}/delete`,
      {},
      { email },
    );

    typeof data === 'object' && expect(data.json.email).toEqual(email);
  });

  it('Returns the right status from the webserver', async () => {
    // 404 not found
    const resp = await nativeRequest.get(`${target}/limbo`);
    expect(resp.status).toEqual(404);

    // 200 ok
    const resp2 = await nativeRequest.get(`${target}/anything`);
    expect(resp2.status).toEqual(200);

    // 405 method not allowed
    const resp3 = await nativeRequest.get(`${target}/post`);
    expect(resp3.status).toEqual(405);
  });

  it('Throws an Error when it should', async () => {
    // non-existing domain
    const resp = () =>
      nativeRequest.put(
        `https://ugfhgruyasfsyifsfhiuhasqfjgoergegr_nonexistant.com`,
      );
    await expect(resp).rejects.toThrow(/ENOTFOUND/);
  });
});
