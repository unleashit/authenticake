export interface JWTPayload {
  type: 'access' | 'refresh';
  user_id: string | number;
  email: string;
  roles: string[];
  // grants: string[];
  exp: number;
}
