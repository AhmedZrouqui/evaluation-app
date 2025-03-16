import AccessTokenRepository from '../../accessToken/repositories/accessToken.repository';
import { UserAttributes, UserCreationAttributes } from '../models/user.model';
import UserRepository from '../repositories/user.repository';
import { UserAuthAttributes } from '../types/types';
import bcrypt from 'bcrypt';

class UserService {
  private readonly userRepository: UserRepository;
  private readonly accessTokenRepository: AccessTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.accessTokenRepository = new AccessTokenRepository();
  }

  async updateUser(
    id: number,
    data: Partial<{ firstname: string; lastname: string; phone: string }>
  ) {
    return this.userRepository.updateUser(id, data);
  }

  async deleteUser(id: number) {
    return await this.userRepository.deleteUser(id);
  }

  async revokeToken(token: string) {
    return await this.accessTokenRepository.delete(token);
  }

  async getUserByToken(token: string) {
    try {
      return await this.userRepository.findUserByJWT(token);
    } catch (error) {
      throw new Error('Get user by Token error: ' + error);
    }
  }

  async authenticate({ countryCode, phone, password }: UserAuthAttributes) {
    try {
      const user = await this.userRepository.findUserByCountryCodeAndPhone(
        countryCode,
        phone
      );

      if (!user) throw new Error('user not found');

      const isMatching = await bcrypt.compare(password, user.password);

      if (!isMatching) throw new Error('user not found');

      return await this.accessTokenRepository.create(3600, user.id);
    } catch (err) {
      throw new Error('Auth error: ' + err);
    }
  }

  public async getUserById(id: number) {
    return await this.userRepository.findUserById(id);
  }

  public async create({
    firstname,
    lastname,
    password,
    countryCode,
    phone,
  }: UserCreationAttributes) {
    try {
      return await this.userRepository.createUser(
        firstname,
        lastname,
        countryCode,
        phone,
        password
      );
    } catch (err) {
      throw new Error('Error creating user: ' + err);
    }
  }
}

export default UserService;
