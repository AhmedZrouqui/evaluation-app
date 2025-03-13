import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../config/database';
import { BaseAttributes } from '../../base/model/base.model';
import User from '../../user/models/user.model';

export interface ReviewAttributes extends BaseAttributes {
  comment: string;
  mark: number;
}

interface ReviewCreationAttributes
  extends Optional<ReviewAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
  public id!: number;
  public comment!: string;
  public mark!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly user?: User;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mark: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,
  }
);

export default Review;
