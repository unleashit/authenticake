export const encodeBase64QueryString = (data: unknown) =>
  Buffer.from(JSON.stringify(data)).toString('base64');

export const decodeBase64QueryString = (data: string) =>
  JSON.parse(decodeURIComponent(Buffer.from(data, 'base64').toString('utf8')));

// empty object
export const isEmpty = (obj?: { [key: string]: any }) =>
  !(obj && Object.keys(obj).length > 0);
