import AccessToken from '../modules/accessToken/models/accessToken.model';
import Kiosk from '../modules/kiosk/models/kiosk.model';
import Review from '../modules/review/model/review.model';
import User from '../modules/user/models/user.model';

export function initializeAssociations() {
  Review.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  User.hasMany(Review, {
    foreignKey: 'id',
    as: 'reviews',
  });

  User.hasMany(AccessToken, {
    foreignKey: 'userId',
    as: 'tokens',
  });

  User.hasOne(Kiosk, {
    foreignKey: 'userId',
    as: 'kiosk',
  });

  Kiosk.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  console.log('Model associations initialized');
}
