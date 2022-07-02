export interface CreateUserArgs {
  email: string;
  password: string;
}

export interface FindUserByEmailArgs {
  email: string;
}

export interface FindUserByIdArgs {
  id: number | string;
}
