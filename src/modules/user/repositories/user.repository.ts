import AccessToken from '../../accessToken/models/accessToken.model';
import User from '../models/user.model';

class UserRepository {
  async createUser(
    firstname: string,
    lastname: string,
    countryCode: string,
    phone: string,
    password: string
  ) {
    try {
      const user = await User.create({
        firstname,
        lastname,
        countryCode,
        phone,
        password,
      });
      return user;
    } catch (error) {
      throw new Error('Error creating user: ' + error);
    }
  }

  async findUserByCountryCodeAndPhone(countryCode: string, phone: string) {
    try {
      return await User.findOne({
        where: {
          countryCode: countryCode,
          phone: phone,
        },
      });
    } catch (error) {
      throw new Error('Error creating user: ' + error);
    }
  }

  async findUserByJWT(token: string) {
    try {
      return await User.findOne({
        include: [
          {
            model: AccessToken,
            as: 'tokens',
            where: {
              id: token,
            },
          },
        ],
      });
    } catch (error) {
      throw new Error('Error: ' + error);
    }
  }
}

export default UserRepository;
