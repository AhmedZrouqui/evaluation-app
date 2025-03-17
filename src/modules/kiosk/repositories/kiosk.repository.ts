import Kiosk from '../models/kiosk.model';
import User from '../../user/models/user.model';
import { Sequelize } from 'sequelize';
import Review from '../../review/model/review.model';

class KioskRepository {
  async create(
    title: string,
    description: string,
    geolocation: { lat: number; lng: number },
    userId: number
  ) {
    const point = {
      type: 'Point',
      coordinates: [geolocation.lng, geolocation.lat],
    };

    return await Kiosk.create({
      title,
      description,
      geolocation: point,
      userId,
    });
  }

  async findById(id: number) {
    return await Kiosk.findByPk(id, { include: [{ model: User, as: 'user' }] });
  }

  async update(
    id: number,
    userId: number,
    data: Partial<{ title: string; description: string }>
  ) {
    const kiosk = await Kiosk.findOne({ where: { id, userId } });
    if (!kiosk) return null;

    await kiosk.update(data);
    return kiosk;
  }

  async delete(id: number, userId: number) {
    const kiosk = await Kiosk.findOne({ where: { id, userId } });
    if (!kiosk) return false;

    await kiosk.destroy();
    return true;
  }

  async search(
    geolocation: { lat: number; lng: number },
    maxDistance: number,
    page: number,
    offset: number
  ) {
    try {
      const { lat, lng } = geolocation;

      return await Kiosk.findAll({
        attributes: {
          include: [
            [
              Sequelize.literal(
                `ST_Distance(geolocation::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) / 1000`
              ),
              'distance_km',
            ],
          ],
        },
        where: Sequelize.where(
          Sequelize.literal(
            `ST_DWithin(geolocation::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${maxDistance * 1000})`
          ),
          true
        ),
        order: [[Sequelize.literal('distance_km'), 'ASC']],
        limit: 10,
        offset: (page - 1) * 10 + offset,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstname', 'lastname'],
            include: [{ model: Review, as: 'reviews' }],
          },
        ],
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default KioskRepository;
