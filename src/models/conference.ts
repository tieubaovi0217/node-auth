import * as mongoose from 'mongoose';

import { Conference } from '../common/types';

const conferenceSchema = new mongoose.Schema<Conference>({
  // id: {
  //   type: Number,
  //   required: true,
  //   unique: true,
  // },

  name: {
    type: String,
    unique: true,
    required: true,
  },

  startTime: { type: Date, required: true },

  endTime: { type: Date, required: true },

  editors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],

  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model<Conference>('Conference', conferenceSchema);
