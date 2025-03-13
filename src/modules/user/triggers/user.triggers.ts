import User from '../models/user.model';
import bcrypt from 'bcrypt';

export function userTriggers() {
  User.beforeCreate(async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });
}
