import AccessToken from '../models/accessToken.model';

class AccessTokenRepository {
  async findToken(token: string) {
    try {
      return await AccessToken.findOne({
        where: {
          id: token,
        },
      });
    } catch (error) {
      throw new Error('Error: ' + error);
    }
  }

  async create(ttl: number, userId: number) {
    try {
      return await AccessToken.create({ ttl, userId });
    } catch (error) {
      throw new Error(
        'An error occurred while creating an auth token.' + error
      );
    }
  }

  async delete(token: string) {
    try {
      return await AccessToken.destroy({ where: { id: token } });
    } catch (error) {
      throw new Error(
        'An error occurred while revoking an auth token.' + error
      );
    }
  }
}

export default AccessTokenRepository;
