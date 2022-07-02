import {
  CreateUserArgs,
  EmailHasRoleArgs,
  FindUserByEmailArgs,
  FindUserByIdArgs,
  UserIdHasRoleArgs,
  UserIdIsAdminArgs,
  UserIsAuthArgs,
} from './types/schema';

// type QueryNames =
//   | 'createUser'
//   | 'findUserById'
//   | 'findUserByEmail'
//   | 'userIsAuth'
//   | 'userIdHasGrant'
//   | 'emailHasGrant'
//   | 'userIdIsAdmin';
// type Statements = {
//   [key in QueryNames]: (...args: any) => string;
// };

export const createUser = ({ userTblName }: CreateUserArgs) => `
    INSERT INTO ${userTblName} (email, password, roles)
      VALUES ($1, $2, $3) RETURNING *;
  `;

export const findUserById = ({ userTblName }: FindUserByIdArgs) => `
    SELECT * from ${userTblName}
    WHERE user_id = $1
    LIMIT 1;
  `;

export const findUserByEmail = ({ userTblName }: FindUserByEmailArgs) => `
    SELECT * from ${userTblName}
    WHERE email = $1
    LIMIT 1;
  `;
export const userIsAuth = ({ userTblName }: UserIsAuthArgs) => `
    SELECT * from ${userTblName}
    WHERE email = $1 AND password = $2 AND is_active
    LIMIT 1;
  `;

export const userIdHasRole = ({ userTblName }: UserIdHasRoleArgs) => `
    SELECT * from ${userTblName}
    WHERE user_id = $1 AND $2 = ANY(roles)
    LIMIT 1;
  `;

export const emailHasRole = ({ userTblName }: EmailHasRoleArgs) => `
    SELECT * from ${userTblName}
    WHERE email = $1 AND $2 = ANY(roles)
    LIMIT 1;
  `;

export const userIdIsAdmin = ({ userTblName }: UserIdIsAdminArgs) => `
    SELECT * from ${userTblName}
    WHERE user_id = $1 AND 'admin' = ANY(roles)
    LIMIT 1;
  `;
