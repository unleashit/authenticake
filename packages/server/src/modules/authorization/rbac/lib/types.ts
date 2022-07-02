import { BaseSession } from '../../../../model/types/User';

interface AuthParams {
  session?: BaseSession;
  params?: { [key: string]: string };
  // query?: { [key: string]: unknown };
}

export type DefaultResources = 'account' | 'profile';
export type DefaultActions = 'read' | 'write' | 'create' | 'delete' | '*';
export type SpecialPerms = '*';

export type Permission<
  RESOURCES extends string = DefaultResources,
  ACTIONS extends string = DefaultActions,
  SPECIAL_PERMS extends string = SpecialPerms,
> = 'authenticated' | `${RESOURCES}:${ACTIONS}` | SPECIAL_PERMS;

interface RoleObject<
  RESOURCES extends string = DefaultResources,
  ACTIONS extends string = DefaultActions,
  SPECIAL_PERMS extends string = SpecialPerms,
> {
  name: Permission<RESOURCES, ACTIONS, SPECIAL_PERMS>;
  when: (authParams: AuthParams) => boolean | Promise<boolean>;
}

export interface Roles<
  RESOURCES extends string = DefaultResources,
  ACTIONS extends string = DefaultActions,
  SPECIAL_PERMS extends string = SpecialPerms,
> {
  [key: string]: {
    can: Array<
      | Permission<RESOURCES, ACTIONS, SPECIAL_PERMS>
      | RoleObject<RESOURCES, ACTIONS, SPECIAL_PERMS>
    >;
    inherits?: string[] | undefined;
  };
}

export type RBACOpts<
  RESOURCES extends string = DefaultResources,
  ACTIONS extends string = DefaultActions,
  // TODO: SPECIAL_PERMS should default to SpecialPerms, not string
  // but is causing an error for unknown reasons
  SPECIAL_PERMS extends string = string,
> =
  | Roles<RESOURCES, ACTIONS, SPECIAL_PERMS>
  | (() => Promise<Roles<RESOURCES, ACTIONS, SPECIAL_PERMS>>)
  | Promise<Roles<RESOURCES, ACTIONS, SPECIAL_PERMS>>;

// export declare class RBAC {
//   constructor(opts: RBACOpts);
//
//   can(
//     role: string | string[] | Roles[],
//     operation: string,
//     params?: object,
//   ): Promise<boolean>;
//
//   static create(opts: RBACOpts): RBAC;
// }

// export = RBAC;
