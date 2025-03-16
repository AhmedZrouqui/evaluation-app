import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../config/database';
import User from '../../user/models/user.model';

export interface KioskAttributes {
  id: number;
  title: string;
  description: string;
  geolocation: object;
  userId: number;
}

export interface KioskCreationAttributes
  extends Optional<KioskAttributes, 'id'> {}

class Kiosk
  extends Model<KioskAttributes, KioskCreationAttributes>
  implements KioskAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public geolocation!: object;
  public userId!: number;
}

Kiosk.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    geolocation: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Kiosk',
    tableName: 'kiosks',
    timestamps: true,
  }
);

export default Kiosk;
