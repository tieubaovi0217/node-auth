import * as mongoose from 'mongoose';

import { Resource } from '../common/types';

const resourceSchema = new mongoose.Schema<Resource>({
  id: {
    type: String,
    required: true,
    unique: true,
  },

  url: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },
});

export default mongoose.model<Resource>('Resource', resourceSchema);
