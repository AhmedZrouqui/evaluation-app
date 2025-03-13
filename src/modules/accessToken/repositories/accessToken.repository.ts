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

  async create(ttl: number) {
    try {
      return await AccessToken.create({ ttl });
    } catch (error) {
      throw new Error(
        'An error occurred while creating an auth token.' + error
      );
    }
  }
}

export default AccessTokenRepository;
