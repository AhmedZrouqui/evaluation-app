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

  async authenticate({ countryCode, phone, password }: UserAuthAttributes) {
    try {
      const user = await this.userRepository.findUserByCountryCodeAndPhone(
        countryCode,
        phone
      );

      if (!user) throw new Error('user not found');

      const isMatching = await bcrypt.compare(password, user.password);

      if (!isMatching) throw new Error('user not found');

      return await this.accessTokenRepository.create(60);
    } catch (err) {
      throw new Error('Auth error: ' + err);
    }
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
