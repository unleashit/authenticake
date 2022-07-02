import debugLib from 'debug';

const debug = debugLib('rbac');

export function any(promises: any) {
  if (promises.length < 1) {
    return Promise.resolve(false);
  }
  return Promise.all(
    promises.map(($p: any) =>
      $p
        .catch((err: any) => {
          debug('Underlying promise rejected', err);
          return false;
        })
        .then((result: any) => {
          if (result) {
            throw new Error('authorized');
          }
        }),
    ),
  )
    .then(() => false)
    .catch((err) => err && err.message === 'authorized');
}

export function isGlob(string: any) {
  return string.includes('*');
}

export function globToRegex(string: any) {
  return new RegExp(`^${string.replace(/\*/g, '.*')}`);
}
