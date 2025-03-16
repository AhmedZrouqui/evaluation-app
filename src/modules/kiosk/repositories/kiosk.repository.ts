import Kiosk from '../models/kiosk.model';
import User from '../../user/models/user.model';
import { Op, Sequelize } from 'sequelize';
import Review from '../../review/model/review.model';

class KioskRepository {
  async create(
    title: string,
    description: string,
    geolocation: object,
    userId: number
  ) {
    return await Kiosk.create({ title, description, geolocation, userId });
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
                `ST_Distance(geolocation, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))`
              ),
              'distance',
            ],
          ],
        },
        where: Sequelize.where(
          Sequelize.fn(
            'ST_DWithin',
            Sequelize.col('geolocation'),
            Sequelize.fn(
              'ST_SetSRID',
              Sequelize.fn('ST_MakePoint', lng, lat),
              4326
            ),
            maxDistance
          ),
          true
        ),
        order: [[Sequelize.literal('distance'), 'ASC']],
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
    }
  }
}

export default KioskRepository;
