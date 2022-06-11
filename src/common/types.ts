import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Document, ObjectId } from 'mongoose';

import * as mongoose from 'mongoose';

export interface UserPayload {
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  token: string;
  user: UserPayload;
}

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
  tokens: any;
}

export interface DecodedJwtToken {
  id: ObjectId;
  username: string;
  email: string;
}

export interface AuthorizedRequest extends Request {
  user: User;
  token: JwtPayload;
}

export interface Resource {
  id: string;
  url: string;
  token: string;
  type: 'Picture' | 'Document' | 'Video';
  user: mongoose.Types.ObjectId;
  conferenceId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
}

export interface Conference {
  name: string;
  startTime: Date;
  endTime: Date;
  host: mongoose.Types.ObjectId;
  resources: Array<mongoose.Types.ObjectId>;
  timeline: Array<TimelineEvent>;
}

export interface TimelineEvent {
  time: Date;
  content: string;
}
