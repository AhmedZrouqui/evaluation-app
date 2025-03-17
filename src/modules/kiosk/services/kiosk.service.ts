import KioskRepository from '../repositories/kiosk.repository';

class KioskService {
  private readonly kioskRepository: KioskRepository;

  constructor() {
    this.kioskRepository = new KioskRepository();
  }

  async create({
    title,
    description,
    geolocation,
    userId,
  }: {
    title: string;
    description: string;
    geolocation: { lat: number; lng: number };
    userId: number;
  }) {
    return this.kioskRepository.create(title, description, geolocation, userId);
  }

  async getById(id: number) {
    return this.kioskRepository.findById(id);
  }

  async update(
    id: number,
    userId: number,
    data: Partial<{ title: string; description: string }>
  ) {
    return this.kioskRepository.update(id, userId, data);
  }

  async delete(id: number, userId: number) {
    return this.kioskRepository.delete(id, userId);
  }

  async search(
    geolocation: { lat: number; lng: number },
    maxDistance: number,
    page: number,
    offset: number
  ) {
    return this.kioskRepository.search(geolocation, maxDistance, page, offset);
  }
}

export default KioskService;
