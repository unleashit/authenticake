export interface PGSchemaOpts {
  sync?: boolean;
  force?: boolean;
  userTblName?: string;
  accountTblName?: string;
  profileTblName?: string;
  sessionTblName?: string;
  customSchema?: string | false;
  defaultAccount?: {
    email: string;
    password: string;
    roles?: string[];
  };
}

interface BaseUserQueryArgs {
  userTblName: string;
}

export type CreateUserArgs = BaseUserQueryArgs;
export type FindUserByIdArgs = BaseUserQueryArgs;
export type FindUserByEmailArgs = BaseUserQueryArgs;
export type UserIsAuthArgs = BaseUserQueryArgs;
export type UserIdHasRoleArgs = BaseUserQueryArgs;
export type EmailHasRoleArgs = BaseUserQueryArgs;
export type UserIdIsAdminArgs = BaseUserQueryArgs;
