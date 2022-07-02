export interface BaseSession {
  // eslint-disable-next-line camelcase
  user_id: string | number;
  roles: string[];
  email: string;
  password?: string;
  // eslint-disable-next-line camelcase
  created_at?: Date;
  // eslint-disable-next-line camelcase
  updated_at?: Date;
}
