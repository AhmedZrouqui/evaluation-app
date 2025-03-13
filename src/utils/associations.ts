import AccessToken from '../modules/accessToken/models/accessToken.model';
import Review from '../modules/review/model/review.model';
import User from '../modules/user/models/user.model';

export function initializeAssociations() {
  Review.belongsTo(User, {
    foreignKey: 'id',
    as: 'user',
  });

  User.hasMany(Review, {
    foreignKey: 'id',
    as: 'reviews',
  });

  User.hasMany(AccessToken, {
    foreignKey: 'id',
    as: 'tokens',
  });

  console.log('Model associations initialized');
}
