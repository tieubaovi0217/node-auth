import * as mongoose from 'mongoose';

import { Conference } from '../common/types';

const conferenceSchema = new mongoose.Schema<Conference>({
  name: {
    type: String,
    unique: true,
    required: true,
  },

  startTime: { type: Date, required: true },

  endTime: { type: Date, required: true },

  timeline: [{ type: mongoose.Schema.Types.Mixed }],

  editors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model<Conference>('Conference', conferenceSchema);
