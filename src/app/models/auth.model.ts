export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  username: string;
  email: string;
  email_verified: boolean;
  groups: string[];
  login_time: string;
  expires_at: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  groups: string[];
  loginTime: Date;
  expiresAt: Date;
}