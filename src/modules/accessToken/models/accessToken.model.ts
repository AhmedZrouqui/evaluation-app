import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../config/database';

export interface AccessTokenAttributes {
  id: string;
  ttl: number;
  createdAt: Date;
}

export interface AccessTokenCreation
  extends Optional<AccessTokenAttributes, 'id' | 'createdAt'> {}

class AccessToken
  extends Model<AccessTokenAttributes, AccessTokenCreation>
  implements AccessTokenAttributes
{
  public id!: string;
  public ttl!: number;
  public readonly createdAt!: Date;

  public expired(): boolean {
    const expirationTime = new Date(this.createdAt.getTime() + this.ttl * 1000);
    return new Date() > expirationTime;
  }
}

AccessToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ttl: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'AccessToken',
    tableName: 'accessTokens',
    timestamps: true,
  }
);

export default AccessToken;
