import * as mongoose from 'mongoose';

import { User } from '../common/types';

const userSchema = new mongoose.Schema<User>({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  avatarUrl: {
    type: String,
  },
});

export default mongoose.model<User>('User', userSchema);
