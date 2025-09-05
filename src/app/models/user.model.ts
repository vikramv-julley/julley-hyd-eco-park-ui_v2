export interface User {
  username: string;
  email: string;
  phone: string;
  tempPassword: string;
  userGroup: UserGroup;
}

export enum UserGroup {
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}