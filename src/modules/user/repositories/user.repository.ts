import { Op } from 'sequelize';
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

  async findUserById(id: number) {
    try {
      return await User.findOne({ where: { id } });
    } catch (error) {
      throw new Error('Error finding user by id: ' + error);
    }
  }

  async updateUser(
    id: number,
    data: Partial<{ firstname: string; lastname: string; phone: string }>
  ) {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.update(data);
    return user;
  }

  async findUserByCountryCodeAndPhone(countryCode: string, phone: string) {
    try {
      return await User.findOne({
        attributes: { include: ['password'] },
        where: {
          countryCode: countryCode,
          phone: phone,
        },
      });
    } catch (error) {
      throw new Error('Error creating user: ' + error);
    }
  }

  async deleteUser(id: number) {
    const user = await User.findByPk(id);
    if (!user) return false;

    await user.destroy();
    return true;
  }

  async findUserByJWT(token: string) {
    try {
      console.log(token);
      return await User.findOne({
        include: [
          {
            model: AccessToken,
            as: 'tokens',
            where: {
              id: {
                [Op.eq]: token,
              },
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
