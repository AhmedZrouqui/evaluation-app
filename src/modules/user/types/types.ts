import { UserAttributes } from '../models/user.model';

export interface CreateUserRequest {
  firstname: string;
  lastname: string;
  countryCode: string;
  phone: string;
  password: string;
}

export interface UserAuthAttributes
  extends Pick<UserAttributes, 'countryCode' | 'phone' | 'password'> {}
