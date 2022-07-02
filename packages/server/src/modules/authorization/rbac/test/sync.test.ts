import assert from 'assert';

import RBAC from '../lib/rbac';
import data from './data';
import { catchError, shouldBeAllowed, shouldNotBeAllowed } from './utils';

describe('RBAC sync', () => {
  let rbac: any;
  it('should reject if no roles object', () => {
    assert.throws(() => {
      // @ts-ignore
      rbac = new RBAC();
    }, TypeError);
  });
  it('should throw error if no roles object', () => {
    assert.throws(() => {
      // @ts-ignore this test is for JS only
      rbac = new RBAC('hello');
    }, TypeError);
  });
  it('should throw error if roles[$i].can is not an array', () => {
    assert.throws(() => {
      rbac = new RBAC({
        hello: {
          // @ts-ignore this test is for JS only
          can: 1,
        },
      });
    }, TypeError);
  });
  it('should throw error if roles[$i].can is not an array', () => {
    assert.throws(() => {
      rbac = new RBAC({
        // @ts-ignore this test is for JS only
        hello: 1,
      });
    }, TypeError);
  });
  it('should throw error if roles[$i].can[$i2] is not a string or object with .when', () => {
    assert.throws(() => {
      rbac = new RBAC({
        hello: {
          // @ts-ignore this test is for JS only
          can: [() => {}],
        },
      });
    }, TypeError);
  });

  it('should throw error if roles[$i].inherits is not an array', () => {
    assert.throws(() => {
      rbac = new RBAC({
        hello: {
          can: ['hel'],
          // @ts-ignore this test is for JS only
          inherits: 1,
        },
      });
    }, TypeError);
  });

  it('should throw error if roles[$i].inherits[$i2] is not a string', () => {
    assert.throws(() => {
      rbac = new RBAC({
        hello: {
          can: ['hel'],
          // @ts-ignore this test is for JS only
          inherits: [1],
        },
      });
    }, TypeError);
  });

  it('should throw error if roles[$i].inherits[$i2] is not a defined role', () => {
    assert.throws(() => {
      rbac = new RBAC({
        hello: {
          can: ['hel'],
          inherits: ['what'],
        },
      });
    }, TypeError);
  });

  it('should create model if all OK', () => {
    rbac = new RBAC(data.all);
  });
  describe('current role operations', () => {
    it('should respect allowed operations', (done) => {
      rbac
        .can('user', 'post:add')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should not allow when undefined operations', (done) => {
      rbac
        .can('user', 'post:what')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });
    it('should not allow undefined users', (done) => {
      rbac
        .can('what', 'post:add')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should reject function operations with no operands', (done) => {
      rbac
        .can('user', 'post:save')
        .then(() => done(new Error('should not be here')))
        .catch((_err: any) => done());
    });

    it('should not allow function operations based on params', (done) => {
      rbac
        .can('user', 'post:save', { ownerId: 1, postId: 2 })
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should allow function operations with correct values', (done) => {
      rbac
        .can('user', 'post:save', { ownerId: 1, postId: 1 })
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });

    it('should reject conditional glob operations with no params', (done) => {
      rbac
        .can('user', 'user:save')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should reject conditional glob operations with wrong params', (done) => {
      rbac
        .can('user', 'user:save', { userId: 1, id: 2 })
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should allow glob operations with correct params', (done) => {
      rbac
        .can('user', 'user:save', { userId: 1, id: 1 })
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });

    it('should prioritize non glob operations', (done) => {
      rbac
        .can('user', 'user:create')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });

    it.only('should allow globs on role (super admin style)', (done) => {
      rbac = new RBAC({
        ...data.all,
        ...{
          admin: {
            can: ['*:*'],
          },
        },
      });

      rbac
        .can('admin', 'somerole:someop')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });

    // put back the original data for next test
    rbac = new RBAC(data.all);
  });

  describe('parent role operations', () => {
    it('should respect allowed operations', (done) => {
      rbac
        .can('manager', 'account:add')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should reject undefined operations', (done) => {
      rbac
        .can('manager', 'post:what')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should respect allowed glob operations', (done) => {
      rbac
        .can('manager', 'account:whatever')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should handle overwritten glob operations', (done) => {
      rbac
        .can('manager', 'user:save', { regionId: 1, userRegionId: 1 })
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
  });
  describe('parents parent role operations', () => {
    it('should respect allowed operations', (done) => {
      rbac
        .can('admin', 'account:add')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should reject undefined operations', (done) => {
      rbac
        .can('admin', 'post:what')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should respect glob operations', (done) => {
      rbac
        .can('admin', 'user:what')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
  });

  describe('array of roles', () => {
    it('should not allow if empty array of roles', (done) => {
      rbac
        .can([], 'post:what')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });
    it('should not allow if none of the roles is allowed', (done) => {
      rbac
        .can(['user', 'manager'], 'rule the world')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });
    it('should allow if one of the roles is allowed', (done) => {
      rbac
        .can(['user', 'admin'], 'post:delete')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should allow if one of the roles is allowed', (done) => {
      rbac
        .can(['user', 'admin'], 'post:rename', { ownerId: 1, postId: 1 })
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should not allow if none of the roles is allowed', (done) => {
      rbac
        .can(['user', 'admin'], 'post:rename', { ownerId: 1, postId: 2 })
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should allow if one of the roles is allowed through glob', (done) => {
      rbac
        .can(['user', 'manager'], 'user:save', { regionId: 1, userRegionId: 1 })
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
  });

  describe('complex setup', () => {
    // eslint-disable-next-line no-shadow
    rbac = new RBAC({
      signup: {
        can: [],
        inherits: [],
      },
      investor: {
        can: ['deal:read'],
        inherits: ['signup'],
      },
      manager: {
        can: ['deal:readAdmin'],
        inherits: ['investor'],
      },
      admin: {
        can: [],
        inherits: ['manager'],
      },
    });

    it('should reject on deal:readAdmin', (done) => {
      rbac
        .can('investor', 'deal:readAdmin')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });
  });
});
