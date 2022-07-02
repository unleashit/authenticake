const authRoles: any = {
  user: {
    can: [
      'account',
      'post:add',
      {
        name: 'post:save',
        when: async (params: any) => params.userId === params.ownerId,
      },
      'user:create',
      {
        name: 'user:*',
        when: async (params: any) => params.id === params.userId,
      },
    ],
  },
  manager: {
    can: ['post:save', 'post:delete', 'account:*'],
    inherits: ['user'],
  },
  admin: {
    can: ['rule the server'],
    inherits: ['manager'],
  },
};

export default authRoles;
