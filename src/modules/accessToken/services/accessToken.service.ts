import AccessTokenRepository from '../repositories/accessToken.repository';

class AccessTokenService {
  private readonly accessTokenRepository: AccessTokenRepository;

  constructor() {
    this.accessTokenRepository = new AccessTokenRepository();
  }

  async isExpired(token: string) {
    const _token = await this.accessTokenRepository.findToken(token);

    if (!_token) {
      return {
        valid: false,
        notFound: true,
      };
    }

    if (_token.expired()) {
      await this.accessTokenRepository.delete(token);
      return {
        valid: false,
        notFound: false,
      };
    }

    return { valid: true, notFound: false };
  }

  async validateToken(token: string): Promise<boolean> {
    const accessToken = await this.accessTokenRepository.findToken(token);
    if (!accessToken) return false;

    const expired = accessToken.expired();

    if (expired) await this.accessTokenRepository.delete(token);

    return !expired;
  }
}

export default AccessTokenService;
