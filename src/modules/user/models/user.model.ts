import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../config/database';
import { BaseAttributes } from '../../base/model/base.model';
import Review from '../../review/model/review.model';
import AccessToken from '../../accessToken/models/accessToken.model';
import Kiosk from '../../kiosk/models/kiosk.model';

export interface UserAttributes extends BaseAttributes {
  firstname: string;
  lastname: string;
  countryCode: string;
  phone: string;
  password: string;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public firstname!: string;
  public lastname!: string;
  public countryCode!: string;
  public phone!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly reviews?: Review[];
  public readonly tokens?: AccessToken[];
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    countryCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: {
        exclude: ['password'],
      },
      order: [['createdAt', 'DESC']],
    },
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
