export interface AuthUser {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
