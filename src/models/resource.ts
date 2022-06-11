import * as mongoose from 'mongoose';

import { Resource } from '../common/types';
import ConferenceModel from './conference';

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

  conferenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conference',
    required: true,
  },

  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  token: {
    type: String,
    required: true,
  },

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

resourceSchema.pre('save', async function (next) {
  const existingConference = await ConferenceModel.findById(this.conferenceId);
  if (!existingConference) {
    throw new Error('conferenceId is invalid or not exist');
  }
  next();
});

const ResourceModel = mongoose.model<Resource>('Resource', resourceSchema);

export default ResourceModel;
