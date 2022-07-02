type DoneFn = any;

export function shouldBeAllowed(done: DoneFn) {
  return (result: any) => {
    if (result) {
      done();
    } else {
      done(new Error('should not be denied'));
    }
  };
}

export function shouldNotBeAllowed(done: DoneFn) {
  return (result: any) => {
    if (result) {
      done(new Error('should not be allowed'));
    } else {
      done();
    }
  };
}

export function catchError(_done: DoneFn) {
  return (_err: any) => false;
}
