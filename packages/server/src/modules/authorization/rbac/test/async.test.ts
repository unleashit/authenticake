import RBAC from '../lib/rbac';
import data from './data';
import { catchError, shouldBeAllowed, shouldNotBeAllowed } from './utils';

describe('RBAC async', () => {
  it('should reject if function throws', (done) => {
    new RBAC(async () => {
      throw new Error();
    })._init
      .then(() => {
        done(new Error('Should not succeed'));
      })
      .catch(() => {
        done();
      });
  });

  it('should reject if function returns non object', (done) => {
    // @ts-ignore this test is for JS only
    new RBAC(async () => 1)._init
      .then(() => {
        done(new Error('Should not succeed'));
      })
      .catch(() => {
        done();
      });
  });

  it('should reject if roles[$i].inherits is not an array', (done) => {
    // @ts-ignore this test is for JS only
    new RBAC(async () => ({
      hello: {
        can: ['hel'],
        inherits: 1,
      },
    }))._init
      .then(() => {
        done(new Error('Should not succeed'));
      })
      .catch(() => {
        done();
      });
  });

  it('should reject if roles[$i].inherits[$i2] is not a string', (done) => {
    // @ts-ignore this test is for JS only
    new RBAC(async () => ({
      hello: {
        can: ['hel'],
        inherits: [1],
      },
    }))._init
      .then(() => {
        done(new Error('Should not succeed'));
      })
      .catch(() => {
        done();
      });
  });

  it('should reject if roles[$i].inherits[$i2] is not a defined role', (done) => {
    new RBAC(async () => ({
      hello: {
        can: ['hel'],
        inherits: ['what'],
      },
    }))._init
      .then(() => {
        done(new Error('Should not succeed'));
      })
      .catch(() => {
        done();
      });
  });

  it('should resolve if function returns correct object', (done) => {
    new RBAC(async () => data.all)._init
      .then(() => {
        done();
      })
      .catch(() => {
        done(new Error('Should not reject'));
      });
  });

  describe('resolve current role operations', () => {
    it('should respect operations', (done) => {
      new RBAC(async () => data.all)
        .can('user', 'post:add')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should reject undefined operations', (done) => {
      new RBAC(async () => data.all)
        .can('user', 'post:what')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });
    it('should reject undefined users', (done) => {
      new RBAC(async () => data.all)
        .can('what', 'post:add')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should reject function operations with no operands', (done) => {
      new RBAC(async () => data.all)
        .can('user', 'post:save')
        .then(shouldNotBeAllowed(done))
        .catch((_err) => done());
    });

    it('should reject function operations with rejectable values', (done) => {
      new RBAC(async () => data.all)
        .can('user', 'post:save', { ownerId: 1, postId: 2 })
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should allow function operations with correct values', (done) => {
      new RBAC(async () => data.all)
        .can('user', 'post:save', { ownerId: 1, postId: 1 })
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });

    it('should reject conditional glob operations with no params', (done) => {
      new RBAC(async () => data.all)
        .can('user', 'user:save')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should reject conditional glob operations with wrong params', (done) => {
      new RBAC(async () => data.all)
        .can('user', 'user:save', { userId: 1, id: 2 })
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should allow glob operations with correct params', (done) => {
      new RBAC(async () => data.all)
        .can('user', 'user:save', { userId: 1, id: 1 })
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });

    it('should prioritize non glob operations', (done) => {
      new RBAC(async () => data.all)
        .can('user', 'user:create')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
  });

  describe('parent role operations', () => {
    it('should respect allowed operations', (done) => {
      new RBAC(async () => data.all)
        .can('manager', 'account:add')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should reject undefined operations', (done) => {
      new RBAC(async () => data.all)
        .can('manager', 'post:what')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should respect allowed glob operations', (done) => {
      new RBAC(async () => data.all)
        .can('manager', 'account:whatever')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should handle overwritten glob operations', (done) => {
      new RBAC(async () => data.all)
        .can('manager', 'user:save', { regionId: 1, userRegionId: 1 })
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
  });
  describe('parents parent role operations', () => {
    it('should respect allowed operations', (done) => {
      new RBAC(async () => data.all)
        .can('admin', 'account:add')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should reject undefined operations', (done) => {
      new RBAC(async () => data.all)
        .can('admin', 'post:what')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should respect glob operations', (done) => {
      new RBAC(async () => data.all)
        .can('admin', 'user:what')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
  });

  describe('parent role operations with callback', () => {
    it('should respect allowed operations', (done) => {
      new RBAC(async () => data.all)
        .can('manager', 'post:create', { postId: 1, ownerId: 1 })
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should reject not allowed operation', (done) => {
      new RBAC(async () => data.all)
        .can('manager', 'post:create', { postId: 1, ownerId: 2 })
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });
  });

  describe('array of roles', () => {
    it('should not allow if empty array of roles', (done) => {
      new RBAC(async () => data.all)
        .can([], 'post:what')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });
    it('should not allow if none of the roles is allowed', (done) => {
      new RBAC(async () => data.all)
        .can(['user', 'manager'], 'rule the world')
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });
    it('should allow if one of the roles is allowed', (done) => {
      new RBAC(async () => data.all)
        .can(['user', 'admin'], 'post:delete')
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should allow if one of the roles is allowed', (done) => {
      new RBAC(async () => data.all)
        .can(['user', 'admin'], 'post:rename', { ownerId: 1, postId: 1 })
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
    it('should not allow if none of the roles is allowed', (done) => {
      new RBAC(async () => data.all)
        .can(['user', 'admin'], 'post:rename', { ownerId: 1, postId: 2 })
        .catch(catchError(done))
        .then(shouldNotBeAllowed(done));
    });

    it('should allow if one of the roles is allowed through glob', (done) => {
      new RBAC(async () => data.all)
        .can(['user', 'manager'], 'user:save', { regionId: 1, userRegionId: 1 })
        .catch(catchError(done))
        .then(shouldBeAllowed(done));
    });
  });
});
